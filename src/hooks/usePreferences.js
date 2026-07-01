import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePreferences(userId) {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    setPreferences(data || {})
    setLoading(false)
  }

  const updatePreferences = async (updates) => {
    const payload = {
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    // upsert — creates row if not exists, updates if it does
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error) setPreferences(data)
    return { data, error }
  }

  return { preferences, loading, updatePreferences, refetch: fetchPreferences }
}
