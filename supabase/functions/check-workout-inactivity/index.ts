// supabase/functions/check-workout-inactivity/index.ts
//
// Called every minute by pg_cron (see supabase_workout_inactivity_migration.sql).
// Only actually does anything once a day, around 18:00 local time per
// user — the minute-by-minute cron is just how it waits for that.
//
// Source of truth for "last completed workout" is `workout_logs.log_date`
// (the same table WorkoutTab writes to when a session is saved). We take
// the most recent log_date per user and compare it to "today" in that
// user's own timezone — exactly 3 or 7 full days apart triggers one
// notification each, via the same notifications → send-push pipeline
// already used by medication and scheduled-workout reminders.
//
// Deploy with:  supabase functions deploy check-workout-inactivity --no-verify-jwt

import { pickVariantForDate, renderBody, INACTIVITY_3_VARIANTS, INACTIVITY_7_VARIANTS } from '../_shared/messageVariants.ts'

const WEBHOOK_SECRET    = Deno.env.get('WEBHOOK_SECRET')!
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const REMINDER_HOUR_LOCAL = '18:00' // ~6:00 PM in the user's own timezone

function restHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }
}

// "HH:MM" and "YYYY-MM-DD" for a given IANA timezone — same logic as
// the other reminder checkers, kept in sync so they all agree on "what
// time/day is it for this user".
function localNow(timezone: string) {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

// Full calendar days between two YYYY-MM-DD strings — parsed at noon
// (same trick used in src/lib/dateUtils.js) to avoid a date shifting
// by a day due to timezone/DST when constructing the Date object.
function daysBetween(fromDateStr: string, toDateStr: string): number {
  const from = new Date(fromDateStr + 'T12:00:00')
  const to   = new Date(toDateStr + 'T12:00:00')
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // One row per user — their most recent log_date, computed by the DB
  // (see `latest_workout_per_user` view in the migration file) instead
  // of fetching every row here and reducing in code. Only users who
  // appear here have ever completed a workout, which is exactly the
  // "at least 1 workout before" requirement, satisfied for free.
  const logsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/latest_workout_per_user?select=user_id,log_date`,
    { headers: restHeaders() }
  )
  const logs = await logsRes.json()
  if (!Array.isArray(logs)) {
    console.error('Unexpected latest_workout_per_user response:', logs)
    return new Response('ok')
  }
  if (logs.length === 0) return new Response(JSON.stringify({ checked: 0, sent: 0 }))

  const lastWorkoutByUser = new Map<string, string>(logs.map((row: any) => [row.user_id, row.log_date]))
  console.log(`Checking inactivity for ${lastWorkoutByUser.size} user(s) with workout history`)

  const userIds = [...lastWorkoutByUser.keys()]
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,timezone`,
    { headers: restHeaders() }
  )
  const profiles = await profilesRes.json()
  const timezoneByUser = new Map((Array.isArray(profiles) ? profiles : []).map((p: any) => [p.id, p.timezone]))

  let sent = 0

  for (const [userId, lastWorkoutDate] of lastWorkoutByUser) {
    const timezone = timezoneByUser.get(userId) || 'UTC'
    const { date: today, time: nowHHMM } = localNow(timezone)

    if (nowHHMM !== REMINDER_HOUR_LOCAL) continue // only fires once/day, ~6pm local

    const daysSince = daysBetween(lastWorkoutDate, today)

    let milestone: 3 | 7 | null = null
    let title = ''
    let body  = ''
    if (daysSince === 3) {
      milestone = 3
      const variant = pickVariantForDate(today, userId, INACTIVITY_3_VARIANTS)
      title = variant.title
      body  = renderBody(variant)
    } else if (daysSince === 7) {
      milestone = 7
      const variant = pickVariantForDate(today, userId, INACTIVITY_7_VARIANTS)
      title = variant.title
      body  = renderBody(variant)
    }
    if (!milestone) continue // not exactly at a threshold day — nothing to send

    console.log(`Match: user=${userId} lastWorkout=${lastWorkoutDate} daysSince=${daysSince} milestone=${milestone}`)

    const dedupKey = `workout_inactivity:${milestone}:${lastWorkoutDate}`

    // Atomic dedup — same sent_reminders table/mechanism as the other
    // reminder types, just a different key prefix. Because the key is
    // tied to lastWorkoutDate, it also naturally resets the moment the
    // user logs a new workout (new lastWorkoutDate → new key).
    const dedupRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_reminders`, {
      method: 'POST',
      headers: { ...restHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: userId, dedup_key: dedupKey }),
    })
    if (dedupRes.status === 409) continue // already sent for this exact milestone
    if (!dedupRes.ok) {
      console.error('Dedup insert failed for', dedupKey, await dedupRes.text())
      continue
    }

    const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: restHeaders(),
      body: JSON.stringify({
        user_id: userId,
        title,
        body,
        url: '/?tab=workout',
        category: 'workout_inactivity',
      }),
    })

    if (!notifRes.ok) {
      console.error(`Notification insert FAILED for user=${userId} dedupKey=${dedupKey}:`, await notifRes.text())
      // Roll back the dedup row so this exact milestone can be retried
      // on a later run instead of being silently, permanently suppressed.
      const rollback = await fetch(
        `${SUPABASE_URL}/rest/v1/sent_reminders?user_id=eq.${userId}&dedup_key=eq.${encodeURIComponent(dedupKey)}`,
        { method: 'DELETE', headers: restHeaders() }
      )
      if (!rollback.ok) {
        console.error(`Dedup rollback ALSO FAILED for dedupKey=${dedupKey} — this milestone will be stuck as "sent" until manually cleared:`, await rollback.text())
      }
      continue
    }

    sent++
  }

  return new Response(JSON.stringify({ checked: lastWorkoutByUser.size, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
