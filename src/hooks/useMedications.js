import { toUserDateStr } from '../lib/dateUtils.js'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMedications(userId, timezone, viewDate) {
  const [medications, setMedications] = useState([])
  const [logs,        setLogs]        = useState([])
  const [loading,     setLoading]     = useState(true)

  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const today   = toUserDateStr(timezone)
    const logDate = viewDate || today

    const [{ data: meds }, { data: dayLogs }] = await Promise.all([
      supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .lte('start_date', today)
        .order('reminder_time', { ascending: true }),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', logDate),
    ])

    // Filter out meds past their end_date
    const activeMeds = (meds || []).filter(m => !m.end_date || m.end_date >= today)

    setMedications(activeMeds)
    setLogs(dayLogs || [])
    setLoading(false)
  }, [userId, viewDate])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addMedication = async (data) => {
    const { data: med, error } = await supabase
      .from('medications')
      .insert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
      .select().single()
    if (!error) setMedications(prev => [...prev, med])
    return { data: med, error }
  }

  const updateMedication = async (id, updates) => {
    const { data: med, error } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (!error) setMedications(prev => prev.map(m => m.id === id ? med : m))
    return { data: med, error }
  }

  const deleteMedication = async (id) => {
    const { error } = await supabase
      .from('medications')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setMedications(prev => prev.filter(m => m.id !== id))
    return { error }
  }

  // markTaken only allowed for today — uses today's date regardless of viewDate
  const markTaken = async (medicationId, scheduledTime) => {
    const today    = toUserDateStr(timezone)
    const existing = logs.find(l => l.medication_id === medicationId && l.log_date === today)

    if (existing) {
      const newStatus = existing.status === 'taken' ? 'pending' : 'taken'
      const { data: log, error } = await supabase
        .from('medication_logs')
        .update({ status: newStatus, taken_at: newStatus === 'taken' ? new Date().toISOString() : null })
        .eq('id', existing.id).select().single()
      if (!error) setLogs(prev => prev.map(l => l.id === existing.id ? log : l))
      return { data: log, error }
    } else {
      const { data: log, error } = await supabase
        .from('medication_logs')
        .insert({ medication_id: medicationId, user_id: userId, log_date: today, scheduled_time: scheduledTime, status: 'taken', taken_at: new Date().toISOString() })
        .select().single()
      if (!error) setLogs(prev => [...prev, log])
      return { data: log, error }
    }
  }

  const logDate         = viewDate || toUserDateStr(timezone)
  const getStatusForMed = (medicationId) => {
    const log = logs.find(l => l.medication_id === medicationId && l.log_date === logDate)
    return log?.status || 'pending'
  }

  const takenCount  = logs.filter(l => l.status === 'taken').length
  const missedCount = logs.filter(l => l.status === 'missed').length

  const nextMed = medications
    .filter(m => getStatusForMed(m.id) === 'pending')
    .sort((a, b) => {
      const getTime = m => m.reminder_time || (() => { try { return JSON.parse(m.reminder_times || '[]')[0] || '' } catch { return '' } })()
      return getTime(a).localeCompare(getTime(b))
    })[0] || null

  return {
    medications, logs, loading,
    addMedication, updateMedication, deleteMedication, markTaken,
    getStatusForMed, takenCount, missedCount, nextMed,
    refetch: fetchAll,
  }
}
