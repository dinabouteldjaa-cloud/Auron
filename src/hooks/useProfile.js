import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getBrowserTimezone } from '../lib/dateUtils.js'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Auto-detect timezone and save if missing or changed
    const detectedTz = getBrowserTimezone()
    if (data && data.timezone !== detectedTz) {
      const updated = { ...data, timezone: detectedTz }
      setProfile(updated)
      // Save silently in background — user never has to think about this
      supabase
        .from('profiles')
        .upsert({ id: userId, timezone: detectedTz, updated_at: new Date().toISOString() })
        .then(() => {})
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return { profile, loading, updateProfile, refetch: fetchProfile }
}
