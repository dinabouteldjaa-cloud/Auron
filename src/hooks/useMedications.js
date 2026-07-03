import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMedications(userId) {
  const [medications, setMedications] = useState([])
  const [logs,        setLogs]        = useState([])
  const [loading,     setLoading]     = useState(true)

  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const [{ data: meds }, { data: todayLogs }] = await Promise.all([
      supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('reminder_time', { ascending: true }),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', today),
    ])
    setMedications(meds || [])
    setLogs(todayLogs || [])
    setLoading(false)
  }, [userId, today])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Add a new medication
  const addMedication = async (data) => {
    const { data: med, error } = await supabase
      .from('medications')
      .insert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (!error) setMedications(prev => [...prev, med])
    return { data: med, error }
  }

  // Update an existing medication
  const updateMedication = async (id, updates) => {
    const { data: med, error } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) setMedications(prev => prev.map(m => m.id === id ? med : m))
    return { data: med, error }
  }

  // Soft delete — mark inactive
  const deleteMedication = async (id) => {
    const { error } = await supabase
      .from('medications')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setMedications(prev => prev.filter(m => m.id !== id))
    return { error }
  }

  // Mark a medication as taken today
  const markTaken = async (medicationId, scheduledTime) => {
    // Check if a log already exists for today
    const existing = logs.find(l => l.medication_id === medicationId && l.log_date === today)

    if (existing) {
      // Toggle: if already taken, revert to pending
      const newStatus = existing.status === 'taken' ? 'pending' : 'taken'
      const { data: log, error } = await supabase
        .from('medication_logs')
        .update({
          status: newStatus,
          taken_at: newStatus === 'taken' ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (!error) setLogs(prev => prev.map(l => l.id === existing.id ? log : l))
      return { data: log, error }
    } else {
      // Create new log entry
      const { data: log, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medicationId,
          user_id: userId,
          log_date: today,
          scheduled_time: scheduledTime,
          status: 'taken',
          taken_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (!error) setLogs(prev => [...prev, log])
      return { data: log, error }
    }
  }

  // Helpers
  const getStatusForMed = (medicationId) => {
    const log = logs.find(l => l.medication_id === medicationId && l.log_date === today)
    return log?.status || 'pending'
  }

  const takenCount  = logs.filter(l => l.status === 'taken').length
  const missedCount = logs.filter(l => l.status === 'missed').length

  // Next medication — first pending one, with or without a reminder time
  const nextMed = medications
    .filter(m => getStatusForMed(m.id) === 'pending')
    .sort((a, b) => {
      const aTime = a.reminder_time || (a.reminder_times ? JSON.parse(a.reminder_times)[0] : '') || ''
      const bTime = b.reminder_time || (b.reminder_times ? JSON.parse(b.reminder_times)[0] : '') || ''
      return aTime.localeCompare(bTime)
    })[0] || null

  return {
    medications, logs, loading,
    addMedication, updateMedication, deleteMedication, markTaken,
    getStatusForMed, takenCount, missedCount, nextMed,
    refetch: fetchAll,
  }
}
