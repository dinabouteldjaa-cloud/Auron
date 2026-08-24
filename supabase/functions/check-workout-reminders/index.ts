// supabase/functions/check-workout-reminders/index.ts
//
// Called every minute by pg_cron (see supabase_workout_reminders_migration.sql).
// For every workout plan with an active schedule, checks whether today
// is a scheduled day AND the schedule's reminder time matches the
// current local time in that user's own timezone. If so — and it
// hasn't already been sent — inserts a row into the existing
// `notifications` table, which triggers push via the same pipeline
// already used for medication reminders (on_notification_created →
// send-push). This function never sends push itself.
//
// If schedule.time is blank/null, no reminder is ever sent for that
// plan — matches the existing "Leave blank to skip time reminder" UI.
//
// Deploy with:  supabase functions deploy check-workout-reminders --no-verify-jwt

const WEBHOOK_SECRET    = Deno.env.get('WEBHOOK_SECRET')!
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function restHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }
}

// "HH:MM" and weekday key ('sun'..'sat') for a given IANA timezone —
// identical logic to check-medication-reminders, kept in sync so both
// functions always agree on "what time/day is it for this user".
const WEEKDAY_KEYS: Record<string, string> = {
  Sun: 'sun', Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat',
}

function localNow(timezone: string) {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'short',
  })
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    weekday: WEEKDAY_KEYS[parts.weekday] || 'sun',
  }
}

function toHHMM(raw: any): string | null {
  if (!raw || typeof raw !== 'string') return null
  return raw.slice(0, 5)
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Plans with a non-null schedule column. Filtering further (active
  // days/time) happens in code since `schedule` is jsonb.
  const plansRes = await fetch(
    `${SUPABASE_URL}/rest/v1/workout_plans?schedule=not.is.null&select=id,user_id,name,schedule`,
    { headers: restHeaders() }
  )
  const plans = await plansRes.json()
  if (!Array.isArray(plans)) {
    console.error('Unexpected workout_plans response:', plans)
    return new Response('ok')
  }
  if (plans.length === 0) return new Response(JSON.stringify({ checked: 0, sent: 0 }))
  console.log(`Checking ${plans.length} scheduled workout plan(s)`)

  const userIds = [...new Set(plans.map((p: any) => p.user_id))]
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,timezone`,
    { headers: restHeaders() }
  )
  const profiles = await profilesRes.json()
  const timezoneByUser = new Map((Array.isArray(profiles) ? profiles : []).map((p: any) => [p.id, p.timezone]))

  let sent = 0

  for (const plan of plans) {
    const schedule = plan.schedule
    if (!schedule || schedule.active === false) continue

    const days = Array.isArray(schedule.days) ? schedule.days : []
    const reminderTime = toHHMM(schedule.time)
    if (days.length === 0 || !reminderTime) continue // no days or no time set → no reminder, per spec

    const timezone = timezoneByUser.get(plan.user_id) || 'UTC'
    const { date: today, time: nowHHMM, weekday } = localNow(timezone)

    if (!days.includes(weekday)) continue
    if (nowHHMM !== reminderTime) continue

    console.log(`Match: plan=${plan.id} name="${plan.name}" user=${plan.user_id} tz=${timezone} now=${nowHHMM} weekday=${weekday}`)

    const dedupKey = `scheduled_workout:${plan.id}:${reminderTime}:${today}`

    // Atomic dedup — reuses the same sent_reminders table/mechanism as
    // medication reminders, just with a different key prefix.
    const dedupRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_reminders`, {
      method: 'POST',
      headers: { ...restHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: plan.user_id, dedup_key: dedupKey }),
    })
    if (dedupRes.status === 409) continue // already sent for this exact slot
    if (!dedupRes.ok) {
      console.error('Dedup insert failed for', dedupKey, await dedupRes.text())
      continue
    }

    const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: restHeaders(),
      body: JSON.stringify({
        user_id: plan.user_id,
        title: 'Time to train 💪',
        body: `${plan.name} is scheduled now.`,
        url: '/?tab=workout',
        category: 'scheduled_workout',
      }),
    })

    if (!notifRes.ok) {
      console.error(`Notification insert FAILED for plan=${plan.id} dedupKey=${dedupKey}:`, await notifRes.text())
      // The dedup row was already written, but no notification actually
      // went out — remove it so this exact reminder slot can be retried
      // on the next run instead of being permanently (and silently)
      // suppressed.
      const rollback = await fetch(
        `${SUPABASE_URL}/rest/v1/sent_reminders?user_id=eq.${plan.user_id}&dedup_key=eq.${encodeURIComponent(dedupKey)}`,
        { method: 'DELETE', headers: restHeaders() }
      )
      if (!rollback.ok) {
        console.error(`Dedup rollback ALSO FAILED for dedupKey=${dedupKey} — this slot will be stuck as "sent" until manually cleared:`, await rollback.text())
      }
      continue
    }

    sent++
  }

  return new Response(JSON.stringify({ checked: plans.length, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
