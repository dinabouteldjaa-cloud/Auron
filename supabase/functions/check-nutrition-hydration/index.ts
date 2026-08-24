// supabase/functions/check-nutrition-hydration/index.ts
//
// Called every minute by pg_cron (see supabase_nutrition_hydration_migration.sql).
// Handles two related reminder categories in one function (they share
// the same user/profile lookups, just fire at different local times):
//
//   - nutrition_reminder  → checked at 20:30 local time
//       "evening progress" if food was logged but meaningfully behind,
//       "no food logged"   if nothing was logged today at all.
//       These two are mutually exclusive and share one dedup key/day.
//
//   - hydration_reminder  → checked at 17:30 local time
//
// Both insert into the existing `notifications` table, which triggers
// push via the same pipeline already used by every other reminder type.
// This function never sends push itself.
//
// Deploy with:  supabase functions deploy check-nutrition-hydration --no-verify-jwt

import { pickVariantForDate, renderBody, HYDRATION_VARIANTS, NUTRITION_PROGRESS_VARIANTS, NO_FOOD_LOGGED_VARIANTS } from '../_shared/messageVariants.ts'

const WEBHOOK_SECRET   = Deno.env.get('WEBHOOK_SECRET')!
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const HYDRATION_HOUR_LOCAL = '17:30'
const NUTRITION_HOUR_LOCAL = '20:30'

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
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

// today ± 1 calendar day (UTC) is enough to cover every timezone's
// "today" no matter the offset, while keeping the query window small
// and bounded regardless of how much history has accumulated.
function boundedDateWindow(): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now); from.setUTCDate(from.getUTCDate() - 1)
  const to   = new Date(now); to.setUTCDate(to.getUTCDate() + 1)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

// Sends one notification via the existing pipeline, with the same
// dedup-first + rollback-on-failure pattern as the other checkers.
// Returns true only once the notification row was actually created.
async function sendReminder(userId: string, dedupKey: string, title: string, body: string, category: string): Promise<boolean> {
  const dedupRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_reminders`, {
    method: 'POST',
    headers: { ...restHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: userId, dedup_key: dedupKey }),
  })
  if (dedupRes.status === 409) return false // already sent today
  if (!dedupRes.ok) {
    console.error('Dedup insert failed for', dedupKey, await dedupRes.text())
    return false
  }

  const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
    method: 'POST',
    headers: restHeaders(),
    body: JSON.stringify({ user_id: userId, title, body, url: '/?tab=calories', category }),
  })

  if (!notifRes.ok) {
    console.error(`Notification insert FAILED for user=${userId} dedupKey=${dedupKey}:`, await notifRes.text())
    const rollback = await fetch(
      `${SUPABASE_URL}/rest/v1/sent_reminders?user_id=eq.${userId}&dedup_key=eq.${encodeURIComponent(dedupKey)}`,
      { method: 'DELETE', headers: restHeaders() }
    )
    if (!rollback.ok) {
      console.error(`Dedup rollback ALSO FAILED for dedupKey=${dedupKey} — stuck as "sent" until manually cleared:`, await rollback.text())
    }
    return false
  }

  return true
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { from, to } = boundedDateWindow()

  // Candidate users — only those who have used each feature at least
  // once before. One row per user regardless of history size.
  const [foodUsersRes, waterUsersRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/food_log_users?select=user_id`, { headers: restHeaders() }),
    fetch(`${SUPABASE_URL}/rest/v1/water_log_users?select=user_id`, { headers: restHeaders() }),
  ])
  const foodUsers  = await foodUsersRes.json()
  const waterUsers = await waterUsersRes.json()
  if (!Array.isArray(foodUsers) || !Array.isArray(waterUsers)) {
    console.error('Unexpected users response:', foodUsers, waterUsers)
    return new Response('ok')
  }
  const foodUserIds  = new Set(foodUsers.map((r: any) => r.user_id))
  const waterUserIds = new Set(waterUsers.map((r: any) => r.user_id))
  const allUserIds = [...new Set([...foodUserIds, ...waterUserIds])]
  if (allUserIds.length === 0) return new Response(JSON.stringify({ checked: 0, sent: 0 }))
  console.log(`Candidates: ${foodUserIds.size} food-tracking user(s), ${waterUserIds.size} water-tracking user(s)`)

  // Profiles (timezone + goals) for every candidate, in one query.
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=in.(${allUserIds.join(',')})&select=id,timezone,calorie_goal,protein_goal,water_goal_ml`,
    { headers: restHeaders() }
  )
  const profiles = await profilesRes.json()
  const profileByUser = new Map((Array.isArray(profiles) ? profiles : []).map((p: any) => [p.id, p]))

  // Bounded windows — small regardless of total history — covering
  // every candidate's possible "today" no matter their timezone.
  const [foodTotalsRes, waterLogsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/daily_food_totals?log_date=gte.${from}&log_date=lte.${to}&select=user_id,log_date,total_calories,total_protein`, { headers: restHeaders() }),
    fetch(`${SUPABASE_URL}/rest/v1/water_logs?log_date=gte.${from}&log_date=lte.${to}&select=user_id,log_date,amount_ml`, { headers: restHeaders() }),
  ])
  const foodTotals = await foodTotalsRes.json()
  const waterLogs   = await waterLogsRes.json()
  const foodTotalsKey  = new Map((Array.isArray(foodTotals) ? foodTotals : []).map((r: any) => [`${r.user_id}:${r.log_date}`, r]))
  const waterLogsKey   = new Map((Array.isArray(waterLogs) ? waterLogs : []).map((r: any) => [`${r.user_id}:${r.log_date}`, r]))

  let sent = 0

  for (const userId of allUserIds) {
    const profile = profileByUser.get(userId)
    const timezone = profile?.timezone || 'UTC'
    const { date: today, time: nowHHMM } = localNow(timezone)

    // ── Hydration — 17:30 local ──────────────────────────────
    if (nowHHMM === HYDRATION_HOUR_LOCAL && waterUserIds.has(userId)) {
      const waterGoal = profile?.water_goal_ml || 2000
      const todayWater = waterLogsKey.get(`${userId}:${today}`)
      const currentMl = todayWater?.amount_ml || 0 // no row today → treat as 0, per spec

      if (currentMl < waterGoal * 0.5) {
        const remainingL = ((waterGoal - currentMl) / 1000).toFixed(1)
        const variant = pickVariantForDate(today, userId, HYDRATION_VARIANTS)
        const ok = await sendReminder(
          userId,
          `hydration_reminder:${today}`,
          variant.title,
          renderBody(variant, remainingL),
          'hydration_reminder'
        )
        if (ok) { sent++; console.log(`Sent hydration_reminder to user=${userId}`) }
      }
    }

    // ── Nutrition — 20:30 local ──────────────────────────────
    if (nowHHMM === NUTRITION_HOUR_LOCAL && foodUserIds.has(userId)) {
      const calorieGoal = profile?.calorie_goal || 2200
      const proteinGoal = profile?.protein_goal || 150
      const todayFood = foodTotalsKey.get(`${userId}:${today}`)

      if (!todayFood) {
        // Nothing logged today at all → "no food logged" case.
        const variant = pickVariantForDate(today, userId, NO_FOOD_LOGGED_VARIANTS)
        const ok = await sendReminder(
          userId,
          `nutrition_reminder:${today}`,
          variant.title,
          renderBody(variant),
          'nutrition_reminder'
        )
        if (ok) { sent++; console.log(`Sent nutrition_reminder (no food logged) to user=${userId}`) }
      } else {
        // Logged something → evening progress case, only if meaningfully behind.
        const cal = todayFood.total_calories || 0
        const pro = todayFood.total_protein  || 0
        const calRemaining = calorieGoal - cal
        const proRemaining = proteinGoal - pro
        const calBehind = calRemaining >= 300 && cal < calorieGoal * 0.85
        const proBehind = proRemaining >= 20  && pro < proteinGoal * 0.85

        if (calBehind || proBehind) {
          const parts: string[] = []
          if (calBehind) parts.push(`${Math.round(calRemaining)} calories`)
          if (proBehind) parts.push(`${Math.round(proRemaining)}g of protein`)
          const remaining = parts.join(' and ')

          const variant = pickVariantForDate(today, userId, NUTRITION_PROGRESS_VARIANTS)
          const ok = await sendReminder(
            userId,
            `nutrition_reminder:${today}`,
            variant.title,
            renderBody(variant, remaining),
            'nutrition_reminder'
          )
          if (ok) { sent++; console.log(`Sent nutrition_reminder (progress) to user=${userId}`) }
        }
      }
    }
  }

  return new Response(JSON.stringify({ checked: allUserIds.length, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
