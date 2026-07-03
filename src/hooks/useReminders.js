import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
// useReminders — Phase 4: In-app medication reminders
//
// Architecture is push-notification ready:
//   - Each reminder check runs through shouldFireReminder()
//   - To add push notifications later, call your push API
//     inside that function alongside the in-app alert
//   - reminder_preferences table stores push_token / push_platform
//     for when native push is implemented
// ─────────────────────────────────────────────────────────────

const CHECK_INTERVAL_MS = 60 * 1000 // check every 60 seconds

export function useReminders(userId, medications, markTaken) {
  // Active alerts shown to the user
  const [alerts, setAlerts] = useState([])

  // Reminder preferences loaded from DB
  const [prefs, setPrefs] = useState({
    reminders_enabled: true,
    snooze_minutes:    5,
    advance_minutes:   0,
  })

  // Track which med+time combos have already fired today
  // key: `${medicationId}_${timeString}_${date}`
  const firedRef  = useRef(new Set())
  const snoozedRef = useRef(new Map()) // key → snooze-until timestamp

  // Load preferences from DB
  const loadPrefs = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) setPrefs(data)
  }, [userId])

  useEffect(() => { loadPrefs() }, [loadPrefs])

  // Save preference update to DB
  const updatePrefs = async (updates) => {
    const merged = { ...prefs, ...updates }
    setPrefs(merged)
    await supabase
      .from('reminder_preferences')
      .upsert({ user_id: userId, ...merged, updated_at: new Date().toISOString() })
  }

  // Dismiss an alert
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  // Snooze an alert — re-fires after snooze_minutes
  const snoozeAlert = (alertId) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return
    const snoozeUntil = Date.now() + (prefs.snooze_minutes * 60 * 1000)
    snoozedRef.current.set(alert.fireKey, snoozeUntil)
    dismissAlert(alertId)
  }

  // Mark taken from the alert
  const markTakenFromAlert = async (alertId, medicationId, scheduledTime) => {
    dismissAlert(alertId)
    if (markTaken) await markTaken(medicationId, scheduledTime)
  }

  // Core reminder check — runs every minute
  const checkReminders = useCallback(() => {
    if (!prefs.reminders_enabled || !medications?.length) return

    const now     = new Date()
    const today   = now.toISOString().split('T')[0]
    const nowMins = now.getHours() * 60 + now.getMinutes()

    medications.forEach(med => {
      if (!med.active) return

      // Collect all reminder times for this medication
      let times = []
      try {
        if (med.reminder_times) {
          const parsed = JSON.parse(med.reminder_times)
          times = Array.isArray(parsed) ? parsed.filter(Boolean) : []
        }
        if (!times.length && med.reminder_time) {
          times = [med.reminder_time]
        }
      } catch { if (med.reminder_time) times = [med.reminder_time] }

      times.forEach(timeStr => {
        if (!timeStr) return
        const [h, m]   = timeStr.split(':').map(Number)
        const targetMin = h * 60 + m - (prefs.advance_minutes || 0)
        const fireKey   = `${med.id}_${timeStr}_${today}`

        // Already fired today?
        if (firedRef.current.has(fireKey)) return

        // Snoozed?
        const snoozeUntil = snoozedRef.current.get(fireKey)
        if (snoozeUntil && Date.now() < snoozeUntil) return

        // Is it time? (within a 1-minute window)
        if (nowMins >= targetMin && nowMins < targetMin + 1) {
          firedRef.current.add(fireKey)

          const alert = {
            id:            `${fireKey}_${Date.now()}`,
            fireKey,
            medicationId:  med.id,
            name:          med.medication_name,
            dosage:        med.dosage,
            time:          timeStr.slice(0, 5),
            scheduledTime: timeStr,
          }

          setAlerts(prev => {
            // Don't duplicate
            if (prev.some(a => a.fireKey === fireKey)) return prev
            return [...prev, alert]
          })

          // ── FUTURE PUSH NOTIFICATION HOOK ──────────────────
          // When push notifications are ready, call your push API here:
          //
          // sendPushNotification({
          //   token:   prefs.push_token,
          //   title:   'Medication Reminder',
          //   body:    `Time to take ${med.medication_name}${med.dosage ? ' — ' + med.dosage : ''}`,
          //   data:    { medicationId: med.id, time: timeStr },
          // })
          // ────────────────────────────────────────────────────
        }
      })
    })
  }, [medications, prefs])

  // Set up interval
  useEffect(() => {
    if (!userId) return
    checkReminders() // check immediately on mount
    const interval = setInterval(checkReminders, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [userId, checkReminders])

  // Reset fired set at midnight
  useEffect(() => {
    const now      = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight - now
    const timeout = setTimeout(() => {
      firedRef.current.clear()
      snoozedRef.current.clear()
    }, msUntilMidnight)
    return () => clearTimeout(timeout)
  }, [])

  return {
    alerts,
    prefs,
    updatePrefs,
    dismissAlert,
    snoozeAlert,
    markTakenFromAlert,
  }
}
