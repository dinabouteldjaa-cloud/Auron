// ─────────────────────────────────────────────────────────────
// Date utilities — always use LOCAL device timezone
//
// NEVER use toISOString().split('T')[0] for log dates.
// That returns UTC which is wrong for users in UTC+2, UTC+3, UTC+5:30 etc.
// These functions use getFullYear/getMonth/getDate which respect local time.
// ─────────────────────────────────────────────────────────────

/**
 * Returns today's date as YYYY-MM-DD in the device's local timezone.
 * Safe for all regions including Qatar (UTC+3), India (UTC+5:30), etc.
 */
export function localDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns today's local date string.
 */
export function todayLocal() {
  return localDateStr(new Date())
}

/**
 * Returns a date N days ago as YYYY-MM-DD local.
 */
export function daysAgoLocal(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return localDateStr(d)
}
