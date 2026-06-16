import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.12)',
  dark: '#0F0F0F', surface: '#1A1A1A', surfaceLight: '#242424',
  border: 'rgba(201,168,76,0.2)', borderStrong: 'rgba(201,168,76,0.4)',
  text: '#F0EDE6', textMuted: '#888880',
  green: '#4CAF72', greenLight: 'rgba(76,175,114,0.15)',
  red: '#E05252', redLight: 'rgba(224,82,82,0.12)',
  blue: '#5B9BD5', blueLight: 'rgba(91,155,213,0.12)',
  amber: '#D4924A',
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function Card({ children, style = {} }) {
  return <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px 18px', ...style }}>{children}</div>
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{children}</div>
}

function CalRing({ consumed, goal }) {
  const r = 65, circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(consumed / goal, 1))
  return (
    <div style={{ position: 'relative', width: 170, height: 170, margin: '0 auto 20px' }}>
      <svg width={170} height={170} viewBox="0 0 170 170">
        <circle cx={85} cy={85} r={r} fill="none" stroke={C.surfaceLight} strokeWidth={11} />
        <circle cx={85} cy={85} r={r} fill="none" stroke={C.gold} strokeWidth={11}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 85 85)" style={{ transition: 'stroke-dashoffset 0.6s' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{consumed.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>of {goal.toLocaleString()} kcal</div>
        <div style={{ fontSize: 11, color: consumed > goal ? C.red : C.gold, marginTop: 3, fontWeight: 500 }}>
          {consumed > goal ? `${(consumed-goal).toLocaleString()} over` : `${(goal-consumed).toLocaleString()} left`}
        </div>
      </div>
    </div>
  )
}

// ── Water Settings Modal ───────────────────────────────────────────────────

function WaterSettingsModal({ profile, onSave, onClose }) {
  const [unit, setUnit] = useState(profile?.water_unit || 'cups')
  const [goal, setGoal] = useState(
    profile?.water_unit === 'ml'
      ? (profile?.water_goal_ml || 2000).toString()
      : (profile?.water_goal || 8).toString()
  )
  const [cupSize, setCupSize] = useState((profile?.cup_size_ml || 250).toString())

  const save = () => {
    const updates = { water_unit: unit }
    if (unit === 'cups') {
      updates.water_goal = parseInt(goal) || 8
      updates.cup_size_ml = parseInt(cupSize) || 250
    } else {
      updates.water_goal_ml = parseInt(goal) || 2000
    }
    onSave(updates)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, border: `1px solid ${C.borderStrong}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Water settings</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Track by</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['cups','☕ Cups'],['ml','💧 Millilitres']].map(([val,label]) => (
              <button key={val} onClick={() => setUnit(val)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${unit===val?C.gold:C.border}`, background: unit===val?C.goldLight:'transparent', color: unit===val?C.gold:C.textMuted, fontSize: 13, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
        </div>

        {unit === 'cups' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal (cups)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['4','6','8','10','12'].map(n => (
                  <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${goal===n?C.gold:C.border}`, background: goal===n?C.goldLight:'transparent', color: goal===n?C.gold:C.textMuted, fontSize: 13, cursor: 'pointer', minWidth: 44 }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Cup size (ml)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['150','200','250','350','500'].map(n => (
                  <button key={n} onClick={() => setCupSize(n)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${cupSize===n?C.gold:C.border}`, background: cupSize===n?C.goldLight:'transparent', color: cupSize===n?C.gold:C.textMuted, fontSize: 11, cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
                Total: {parseInt(goal||8) * parseInt(cupSize||250)} ml / day
              </div>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal (ml)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['1500','2000','2500','3000','3500'].map(n => (
                <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${goal===n?C.gold:C.border}`, background: goal===n?C.goldLight:'transparent', color: goal===n?C.gold:C.textMuted, fontSize: 11, cursor: 'pointer', minWidth: 52 }}>{n}</button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Or enter custom (ml)</div>
              <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="2000"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
            </div>
          </div>
        )}

        <button onClick={save} style={{ width: '100%', padding: 13, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save settings</button>
      </div>
    </div>
  )
}

// ── Water Tracker ──────────────────────────────────────────────────────────

function WaterTracker({ userId, profile, updateProfile, selectedDate }) {
  const [amount, setAmount] = useState(0) // cups or ml
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const unit = profile?.water_unit || 'cups'
  const goal = unit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)
  const cupSize = profile?.cup_size_ml || 250
  const pct = Math.min((amount / goal) * 100, 100)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase.from('water_logs').select('cups, amount_ml').eq('user_id', userId).eq('log_date', selectedDate).single()
      .then(({ data }) => {
        if (data) setAmount(unit === 'ml' ? (data.amount_ml || data.cups * cupSize) : (data.cups || 0))
        else setAmount(0)
        setLoading(false)
      }).catch(() => { setAmount(0); setLoading(false) })
  }, [userId, selectedDate, unit])

  const save = async (newAmount) => {
    setAmount(newAmount)
    const cups = unit === 'cups' ? newAmount : Math.round(newAmount / cupSize)
    const amount_ml = unit === 'ml' ? newAmount : newAmount * cupSize
    await supabase.from('water_logs').upsert({ user_id: userId, log_date: selectedDate, cups, amount_ml, updated_at: new Date().toISOString() })
  }

  const handleSaveSettings = async (updates) => {
    await updateProfile(updates)
  }

  const displayLabel = unit === 'ml'
    ? `${amount} / ${goal} ml`
    : `${amount} / ${goal} cups (${amount * cupSize}ml)`

  const steps = unit === 'cups'
    ? Array.from({ length: goal }, (_, i) => i + 1)
    : [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500].filter(v => v <= goal + 500).slice(0, 10)

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Water intake</div>
          <div style={{ fontSize: 12, color: C.blue, marginTop: 2 }}>{loading ? '...' : displayLabel}</div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', color: C.textMuted, fontSize: 12, cursor: 'pointer' }}>⚙️ Settings</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: C.blue, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>

      {unit === 'cups' ? (
        // Cup mode — tap individual cups
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: goal }, (_, i) => (
            <div key={i} onClick={() => isToday && save(i < amount ? i : i + 1)}
              style={{ width: 36, height: 36, borderRadius: 10, cursor: isToday ? 'pointer' : 'default', background: i < amount ? C.blueLight : C.surfaceLight, border: `1px solid ${i < amount ? C.blue : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.15s' }}>
              💧
            </div>
          ))}
        </div>
      ) : (
        // ML mode — tap amount buttons
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {[250, 330, 500, 750, 1000].map(ml => (
              <button key={ml} onClick={() => isToday && save(Math.min(amount + ml, goal * 1.5))}
                disabled={!isToday}
                style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceLight, color: isToday ? C.text : C.textMuted, fontSize: 12, cursor: isToday ? 'pointer' : 'default', minWidth: 52 }}>
                +{ml}ml
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => isToday && save(Math.max(0, amount - 250))} disabled={!isToday || amount === 0}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 18, cursor: 'pointer' }}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 600, color: C.blue }}>{amount}ml</div>
            <button onClick={() => isToday && save(amount + 250)} disabled={!isToday}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold, fontSize: 18, cursor: 'pointer' }}>+</button>
          </div>
        </div>
      )}

      {!isToday && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10, textAlign: 'center' }}>View only — switch to today to log water</div>}

      {showSettings && (
        <WaterSettingsModal profile={profile} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
    </Card>
  )
}

// ── Main TodayTab ──────────────────────────────────────────────────────────

export default function TodayTab({ userId, profile, updateProfile }) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week
  const [foodLogs, setFoodLogs] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [savedPlans, setSavedPlans] = useState([])
  const [dailyStats, setDailyStats] = useState({ steps: '', burned: '', sleep: '' })
  const [loading, setLoading] = useState(true)
  const statsTimer = useRef(null)

  const isToday = selectedDate === todayStr

  // Build week array based on offset
  const getWeekDays = (offset) => {
    const days = []
    const curr = new Date(today)
    const dayOfWeek = curr.getDay()
    const startOfWeek = new Date(curr)
    startOfWeek.setDate(curr.getDate() - dayOfWeek + (offset * 7))
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }

  const weekDays = getWeekDays(weekOffset)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      supabase.from('food_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('saved_plans').select('*').eq('user_id', userId).eq('is_active', true).limit(3),
      supabase.from('daily_stats').select('*').eq('user_id', userId).eq('log_date', selectedDate).single(),
    ]).then(([food, workout, plans, stats]) => {
      setFoodLogs(food.data || [])
      setWorkoutLogs(workout.data || [])
      setSavedPlans(plans.data || [])
      setDailyStats(stats.data ? { steps: stats.data.steps || '', burned: stats.data.burned_kcal || '', sleep: stats.data.sleep_hours || '' } : { steps: '', burned: '', sleep: '' })
      setLoading(false)
    })
  }, [userId, selectedDate])

  const handleStatChange = (key, value) => {
    setDailyStats(prev => ({ ...prev, [key]: value }))
    if (statsTimer.current) clearTimeout(statsTimer.current)
    statsTimer.current = setTimeout(async () => {
      await supabase.from('daily_stats').upsert({
        user_id: userId,
        log_date: selectedDate,
        steps: parseInt(dailyStats.steps) || null,
        burned_kcal: parseInt(dailyStats.burned) || null,
        sleep_hours: parseFloat(dailyStats.sleep) || null,
        [key === 'steps' ? 'steps' : key === 'burned' ? 'burned_kcal' : 'sleep_hours']: key === 'sleep' ? parseFloat(value) : parseInt(value) || null,
      })
    }, 800)
  }

  const totalCal = foodLogs.reduce((s, f) => s + f.calories, 0)
  const totalP   = foodLogs.reduce((s, f) => s + (f.protein || 0), 0)
  const totalC   = foodLogs.reduce((s, f) => s + (f.carbs || 0), 0)
  const totalF   = foodLogs.reduce((s, f) => s + (f.fat || 0), 0)
  const calorieGoal = profile?.calorie_goal || 2200

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    if (dateStr === todayStr) return 'Today'
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
  }

  const MEAL_SLOTS = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'snack', label: 'Snack', icon: '🍎' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
  ]

  return (
    <div>
      {/* ── Date Navigator ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>‹</button>
          <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
            {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `${Math.abs(weekOffset)} weeks ago`}
          </div>
          <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))} style={{ background: 'none', border: 'none', color: weekOffset === 0 ? C.border : C.textMuted, fontSize: 20, cursor: weekOffset === 0 ? 'default' : 'pointer', padding: '4px 8px' }}>›</button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {weekDays.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0]
            const isSelected = dateStr === selectedDate
            const isFuture = d > today
            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(dateStr)} disabled={isFuture}
                style={{ flex: 1, padding: '8px 4px', borderRadius: 12, border: `1px solid ${isSelected ? C.gold : C.border}`, background: isSelected ? C.gold : dateStr === todayStr && !isSelected ? C.goldLight : 'transparent', color: isSelected ? C.dark : isFuture ? C.border : dateStr === todayStr ? C.gold : C.textMuted, cursor: isFuture ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 10, fontWeight: 500 }}>{DAYS[d.getDay()].slice(0,1)}</div>
                <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>{d.getDate()}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Date Title ── */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20, color: C.text }}>
        {formatDate(selectedDate)}
      </div>

      {/* ── Apple Health Banner ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: C.surfaceLight, borderRadius: 12, border: `1px solid ${C.borderStrong}` }}>
        <span style={{ fontSize: 20 }}>❤️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Apple Health connected</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Steps, heart rate & sleep syncing</div>
        </div>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: C.greenLight, color: C.green, fontWeight: 500 }}>Live</span>
      </div>

      {/* ── Calorie Ring ── */}
      <CalRing consumed={totalCal} goal={calorieGoal} />

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { icon: '👟', label: 'Steps', key: 'steps', placeholder: '8,000', color: C.blue, unit: 'steps' },
          { icon: '🔥', label: 'Burned', key: 'burned', placeholder: '400', color: C.red, unit: 'kcal' },
          { icon: '🌙', label: 'Sleep', key: 'sleep', placeholder: '7.5', color: C.gold, unit: 'hrs' },
        ].map(s => (
          <div key={s.key} style={{ background: C.surfaceLight, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{s.icon} {s.label}</div>
            {isToday ? (
              <input
                type="number"
                value={dailyStats[s.key] || ''}
                onChange={e => handleStatChange(s.key, e.target.value)}
                placeholder={s.placeholder}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: s.color, fontSize: 18, fontWeight: 600, padding: 0 }}
              />
            ) : (
              <div style={{ fontSize: 18, fontWeight: 600, color: dailyStats[s.key] ? s.color : C.border }}>{dailyStats[s.key] || '—'}</div>
            )}
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* ── Macros Summary ── */}
      {totalCal > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Macros</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[['Protein', totalP, 'g', C.blue], ['Carbs', totalC, 'g', C.amber], ['Fat', totalF, 'g', C.gold], ['Calories', totalCal, 'kcal', C.red]].map(([l, v, u, col]) => (
              <div key={l} style={{ textAlign: 'center', background: C.surfaceLight, borderRadius: 10, padding: '10px 6px' }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: col }}>{Math.round(v)}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{u} {l}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Meals ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Meals</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MEAL_SLOTS.map(slot => {
            const items = foodLogs.filter(f => f.meal_slot === slot.id)
            const slotCal = items.reduce((s, f) => s + f.calories, 0)
            return (
              <div key={slot.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{slot.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{slot.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''} · ${slotCal} kcal` : 'Nothing logged'}</div>
                  </div>
                  {slotCal > 0 && <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{slotCal} kcal</div>}
                </div>
                {items.length > 0 && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 14px' }}>
                    {items.map((f, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.textMuted, padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{f.food_name}</span>
                        <span style={{ color: C.text }}>{f.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Workouts ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Workouts logged</SectionLabel>
        {workoutLogs.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 20, borderStyle: 'dashed' }}>
            <div style={{ fontSize: 13, color: C.textMuted }}>No workouts logged {isToday ? 'today' : 'this day'}</div>
            {isToday && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Head to the Workouts tab to start one</div>}
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workoutLogs.map(w => (
              <Card key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{w.workout_name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{w.duration_minutes}min · {w.calories_burned} kcal burned · {w.workout_type}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: C.greenLight, color: C.green }}>Done ✓</span>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Plans (Today's Schedule) ── */}
      {savedPlans.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Active plans</SectionLabel>
          {savedPlans.map(plan => {
            const dayIndex = new Date(selectedDate + 'T00:00:00').getDay()
            const dayName = DAYS[dayIndex]
            return (
              <Card key={plan.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{plan.title}</div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: C.goldLight, color: C.gold }}>{plan.days_per_week}x/week</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                  {plan.content ? plan.content.split('\n').find(l => l.toLowerCase().includes(dayName.toLowerCase()) || l.match(new RegExp(`day\\s*${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(dayName)+1}`, 'i'))) || `Rest day or no specific ${dayName} entry` : 'No schedule details'}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Water Tracker ── */}
      <WaterTracker userId={userId} profile={profile} updateProfile={updateProfile} selectedDate={selectedDate} />

      {/* ── Streak ── */}
      <Card style={{ marginTop: 16 }}>
        <SectionLabel>This week's streak</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekDays.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0]
            const isSelected = dateStr === selectedDate
            const isFuture = d > today
            const isCurrentDay = dateStr === todayStr
            return (
              <div key={i} onClick={() => !isFuture && setSelectedDate(dateStr)}
                style={{ flex: 1, textAlign: 'center', cursor: isFuture ? 'default' : 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto 4px', background: isSelected ? C.gold : isCurrentDay ? C.goldLight : isFuture ? 'transparent' : C.greenLight, border: `1px solid ${isSelected ? 'transparent' : isCurrentDay ? C.gold : isFuture ? C.border : C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: isSelected ? C.dark : isCurrentDay ? C.gold : isFuture ? C.border : C.green }}>
                  {!isFuture ? '✓' : ''}
                </div>
                <div style={{ fontSize: 10, color: isSelected ? C.gold : C.textMuted }}>{DAYS[d.getDay()].slice(0,1)}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
