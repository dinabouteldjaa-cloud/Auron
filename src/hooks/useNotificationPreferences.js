import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULTS = {
  workout_reminder: true,
  scheduled_workout: true,
  rest_day: true,
  daily_motivation: true,
  nutrition_reminder: true,
  inactivity_reminder: true,
  push_permission_state: 'not_requested',
}

export function useNotificationPreferences(userId) {
  const [prefs,   setPrefs]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchPrefs()
  }, [userId])

  const fetchPrefs = async () => {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    setPrefs(data || { ...DEFAULTS, user_id: userId })
    setLoading(false)
  }

  const updatePrefs = async (updates) => {
    const payload = {
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error) setPrefs(data)
    return { data, error }
  }

  return { prefs: prefs || { ...DEFAULTS, user_id: userId }, loading, updatePrefs, refetch: fetchPrefs }
}
