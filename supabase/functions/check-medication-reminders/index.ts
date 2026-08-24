// supabase/functions/check-medication-reminders/index.ts
//
// Called every minute by pg_cron (see supabase_medication_reminders_migration.sql).
// For every active medication, checks whether its reminder time matches
// the current local time in that user's own timezone, and — if so and
// it hasn't already been sent — inserts a row into the existing
// `notifications` table. That insert alone is what triggers the push
// (via the `on_notification_created` trigger + send-push function
// already set up) — this function never sends push itself.
//
// Deploy with:  supabase functions deploy check-medication-reminders --no-verify-jwt

import { pickVariantForDate, renderBody, MEDICATION_VARIANTS } from '../_shared/messageVariants.ts'

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

// "HH:MM", "YYYY-MM-DD", and weekday key ('sun'..'sat') for a given IANA
// timezone, computed the same way the frontend does (Intl API) — keeps
// behavior identical to the app.
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

// Normalizes to "HH:MM" regardless of source format — handles a plain
// "HH:MM" string, a "HH:MM:SS" string (native Postgres `time` columns
// come back with seconds via PostgREST), or an array that PostgREST
// already parsed from a jsonb column instead of a JSON-encoded string.
function toHHMM(raw: any): string | null {
  if (!raw || typeof raw !== 'string') return null
  return raw.slice(0, 5)
}

function parseTimes(med: any): string[] {
  let raw: any = med.reminder_times
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { raw = null }
  }
  const list: any[] = Array.isArray(raw) && raw.length > 0 ? raw : (med.reminder_time ? [med.reminder_time] : [])
  return list.map(toHHMM).filter(Boolean) as string[]
}

function parseDays(med: any): string[] | null {
  let raw: any = med.reminder_days
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { raw = null }
  }
  return Array.isArray(raw) && raw.length > 0 ? raw : null
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Active medications.
  const medsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/medications?active=eq.true&select=id,user_id,medication_name,reminder_time,reminder_times,reminder_days,frequency,start_date,end_date`,
    { headers: restHeaders() }
  )
  const meds = await medsRes.json()
  if (!Array.isArray(meds)) {
    console.error('Unexpected medications response:', meds)
    return new Response('ok')
  }
  if (meds.length === 0) return new Response(JSON.stringify({ checked: 0, sent: 0 }))
  console.log(`Checking ${meds.length} active medication(s)`)

  // Timezones for every user with an active medication (fetched
  // separately — medications has no direct FK to profiles for
  // PostgREST to embed).
  const userIds = [...new Set(meds.map((m: any) => m.user_id))]
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,timezone`,
    { headers: restHeaders() }
  )
  const profiles = await profilesRes.json()
  const timezoneByUser = new Map((Array.isArray(profiles) ? profiles : []).map((p: any) => [p.id, p.timezone]))

  let sent = 0

  for (const med of meds) {
    const timezone = timezoneByUser.get(med.user_id) || 'UTC'
    const { date: today, time: nowHHMM, weekday } = localNow(timezone)

    if (med.start_date && med.start_date > today) continue
    if (med.end_date && med.end_date < today) continue

    const days = parseDays(med)
    if (days && !days.includes(weekday)) continue

    const times = parseTimes(med)
    if (!times.includes(nowHHMM)) continue

    console.log(`Match: med=${med.id} name="${med.medication_name}" user=${med.user_id} tz=${timezone} now=${nowHHMM} weekday=${weekday}`)

    const dedupKey = `medication_reminder:${med.id}:${nowHHMM}:${today}`

    // Atomic dedup: the unique(user_id, dedup_key) constraint means this
    // insert only succeeds once, even if the function overlaps itself.
    const dedupRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_reminders`, {
      method: 'POST',
      headers: { ...restHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: med.user_id, dedup_key: dedupKey }),
    })
    if (dedupRes.status === 409) continue // already sent for this exact slot
    if (!dedupRes.ok) {
      console.error('Dedup insert failed for', dedupKey, await dedupRes.text())
      continue
    }

    const variant = pickVariantForDate(today, med.user_id, MEDICATION_VARIANTS)
    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: restHeaders(),
      body: JSON.stringify({
        user_id: med.user_id,
        title: variant.title,
        body: renderBody(variant, med.medication_name),
        url: '/?tab=medication',
        category: 'medication_reminder',
      }),
    })

    sent++
  }

  return new Response(JSON.stringify({ checked: meds.length, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
