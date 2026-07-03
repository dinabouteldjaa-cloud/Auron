// ─────────────────────────────────────────────────────────────
// dateUtils.js — Timezone-aware date utilities
//
// All dates in the DB are stored as YYYY-MM-DD strings.
// The date must match the user's LOCAL calendar day, not UTC.
//
// Solution:
//   - Browser auto-detects timezone via Intl API (no user input)
//   - toUserDateStr(tz) converts NOW to the correct date in that TZ
//   - All log_date writes and reads use this
// ─────────────────────────────────────────────────────────────

/**
 * Returns the current date as YYYY-MM-DD in the given IANA timezone.
 * Falls back to the browser's detected timezone, then UTC.
 *
 * Examples:
 *   toUserDateStr('Asia/Qatar')    → "2025-07-05"  (UTC+3)
 *   toUserDateStr('Asia/Kolkata')  → "2025-07-05"  (UTC+5:30)
 *   toUserDateStr('America/New_York') → "2025-07-04" (UTC-4 in summer)
 */
export function toUserDateStr(timezone) {
  const tz = timezone || getBrowserTimezone()
  try {
    // Intl.DateTimeFormat with the user's timezone gives the correct local date
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year:  'numeric',
      month: '2-digit',
      day:   '2-digit',
    }).formatToParts(new Date())

    const y = parts.find(p => p.type === 'year').value
    const m = parts.find(p => p.type === 'month').value
    const d = parts.find(p => p.type === 'day').value
    return `${y}-${m}-${d}`
  } catch {
    // Fallback: use browser local date
    return localDateStr()
  }
}

/**
 * Auto-detect the browser's IANA timezone string.
 * e.g. "Asia/Qatar", "Europe/Paris", "America/New_York"
 */
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Returns today as YYYY-MM-DD using the browser's local time.
 * Faster than Intl API — use when no stored timezone.
 */
export function localDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns a date N days before the given date string, in the same timezone.
 */
export function daysBeforeStr(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z') // noon UTC avoids DST edge cases
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().split('T')[0]
}
