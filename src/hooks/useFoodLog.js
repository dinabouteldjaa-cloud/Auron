import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFoodLog(userId) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!userId) return
    fetchTodayLogs()
  }, [userId])

  const fetchTodayLogs = async () => {
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .order('created_at', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }

  const addFood = async (food, meal) => {
    const entry = {
      user_id: userId,
      log_date: today,
      meal_slot: meal,
      food_name: food.name,
      calories: food.cal,
      protein: food.p,
      carbs: food.c,
      fat: food.f,
    }
    const { data, error } = await supabase.from('food_logs').insert(entry).select().single()
    if (!error) setLogs(prev => [...prev, data])
    return { data, error }
  }

  const removeFood = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(f => f.id !== id))
  }

  const fetchByDate = async (date) => {
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .order('created_at', { ascending: true })
    return data || []
  }

  return { logs, loading, addFood, removeFood, fetchByDate, refetch: fetchTodayLogs }
}
