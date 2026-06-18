import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { askClaude } from '../lib/claude'
import { WORKOUTS, WORKOUT_CATEGORIES } from '../lib/workouts'

const C = {
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.12)', goldDark: '#8B6914',
  dark: '#0D0E12', surface: '#16181F', surfaceLight: '#1E2029',
  border: 'rgba(201,168,76,0.2)', borderStrong: 'rgba(201,168,76,0.4)',
  text: '#F0EDE6', textMuted: '#888880', textDim: '#52525A',
  green: '#4CAF72', greenLight: 'rgba(76,175,114,0.15)',
  red: '#E05252', blue: '#5B9BD5', amber: '#D4924A',
  purple: '#9B72D0', purpleLight: 'rgba(155,114,208,0.13)',
}

const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const TYPE_COLORS = {
  Strength: C.gold, HIIT: C.red, Cardio: C.blue,
  Mobility: C.green, Sports: C.amber, Swimming: C.blue,
  'Martial Arts': C.red, Yoga: C.green, Cycling: C.amber, Combat: C.red,
}

function Spinner() {
  return <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '18px 20px', cursor: onClick ? 'pointer' : 'default', ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = C.borderStrong)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = C.border)}
    >{children}</div>
  )
}

function Badge({ children, color, bg }) {
  return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: bg || `${color}22`, color, fontWeight: 500, display: 'inline-block' }}>{children}</span>
}

function GoldBtn({ children, onClick, disabled, style = {}, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 20px', borderRadius: 24,
      background: outline ? 'transparent' : disabled ? C.surfaceLight : C.gold,
      color: outline ? C.gold : disabled ? C.textMuted : C.dark,
      border: outline ? `1px solid ${C.gold}` : 'none',
      fontSize: 13, fontWeight: 500, opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer', ...style
    }}>
      {children}
    </button>
  )
}

// ── Workout Detail ─────────────────────────────────────────────────────────

function WorkoutDetail({ workout, userId, onBack, onSavePlan }) {
  const [logging, setLogging] = useState(false)
  const [logged, setLogged] = useState(false)

  const logWorkout = async () => {
    setLogging(true)
    await supabase.from('workout_logs').insert({
      user_id: userId,
      workout_name: workout.name,
      workout_type: workout.type,
      duration_minutes: workout.duration,
      calories_burned: workout.cal,
    })
    setLogging(false)
    setLogged(true)
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8 }}>{workout.name}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <Badge color={TYPE_COLORS[workout.type] || C.gold}>{workout.type}</Badge>
        <Badge color={C.textMuted} bg={C.surfaceLight}>⏱ {workout.duration} min</Badge>
        <Badge color={C.textMuted} bg={C.surfaceLight}>🔥 {workout.cal} kcal</Badge>
        <Badge color={C.textMuted} bg={C.surfaceLight}>{workout.level}</Badge>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Exercises</div>
        {workout.exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < workout.exercises.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.gold, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 14 }}>{ex.split(' ').slice(0, -1).join(' ') || ex}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{ex.split(' ').slice(-1)[0]}</div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 10 }}>
        <GoldBtn onClick={logWorkout} disabled={logging || logged} style={{ flex: 1, padding: 14, fontSize: 14 }}>
          {logged ? '✓ Logged!' : logging ? 'Logging...' : '▶ Start & log workout'}
        </GoldBtn>
        <GoldBtn onClick={() => onSavePlan({
          title: workout.name,
          type: workout.type,
          duration: workout.duration,
          cal: workout.cal,
          exercises: workout.exercises.map(ex => {
            const parts = ex.split(' ')
            const last = parts[parts.length - 1]
            const setsReps = last.match(/^(\d+)[×x](\d+)$/)
            const name = setsReps ? parts.slice(0, -1).join(' ') : ex
            return setsReps
              ? { name, sets: parseInt(setsReps[1]), reps: parseInt(setsReps[2]) }
              : { name, duration: last }
          }),
        })} outline style={{ flex: 1, padding: 14, fontSize: 14 }}>
          + Save to plans
        </GoldBtn>
      </div>
    </div>
  )
}

// ── Custom Workout Builder ─────────────────────────────────────────────────

function CustomWorkoutBuilder({ userId, onBack, onSaved }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Strength')
  const [duration, setDuration] = useState('45')
  const [exercises, setExercises] = useState([{ name: '', sets: '3', reps: '10' }])
  const [saving, setSaving] = useState(false)

  const addExercise = () => setExercises(p => [...p, { name: '', sets: '3', reps: '10' }])
  const removeExercise = (i) => setExercises(p => p.filter((_, idx) => idx !== i))
  const updateExercise = (i, field, val) => setExercises(p => p.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex))

  const save = async () => {
    if (!name.trim() || exercises.some(e => !e.name.trim())) return
    setSaving(true)
    const exerciseList = exercises.map(e => `${e.name} ${e.sets}×${e.reps}`)
    await supabase.from('custom_workouts').insert({
      user_id: userId, name, type,
      duration_minutes: parseInt(duration) || 45,
      exercises: exerciseList,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Build custom workout</div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Workout name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Monday Push Day"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Type</div>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }}>
              {['Strength','HIIT','Cardio','Mobility','Sports','Swimming','Martial Arts','Yoga','Cycling','Combat'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Duration (min)</div>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="45"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
          </div>
        </div>
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Exercises</div>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: C.gold, flexShrink: 0 }}>{i + 1}</div>
            <input value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} placeholder="Exercise name"
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
            <input value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} placeholder="Sets" type="number"
              style={{ width: 52, padding: '9px 8px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', textAlign: 'center' }} />
            <span style={{ color: C.textMuted, fontSize: 13 }}>×</span>
            <input value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} placeholder="Reps"
              style={{ width: 52, padding: '9px 8px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', textAlign: 'center' }} />
            {exercises.length > 1 && (
              <button onClick={() => removeExercise(i)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 20, lineHeight: 1, cursor: 'pointer', flexShrink: 0 }}>×</button>
            )}
          </div>
        ))}
        <button onClick={addExercise} style={{ width: '100%', marginTop: 8, padding: '9px', borderRadius: 10, border: `1px dashed ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>+ Add exercise</button>
      </Card>
      <GoldBtn onClick={save} disabled={saving || !name.trim()} style={{ width: '100%', padding: 13, fontSize: 14 }}>
        {saving ? 'Saving...' : 'Save workout ✓'}
      </GoldBtn>
    </div>
  )
}

// ── Save Plan Modal — with day picker ──────────────────────────────────────

function SavePlanModal({ plan, userId, onClose, onSaved }) {
  const [planName, setPlanName] = useState(plan?.title || '')
  const [chosenDays, setChosenDays] = useState([]) // day-of-week indices
  const [dayWorkouts, setDayWorkouts] = useState({}) // { dayIndex: workoutName }
  const [saving, setSaving] = useState(false)
  const isAIPlan = !!plan?.aiSchedule // pre-parsed from AI

  const toggleDay = (d) => {
    setChosenDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a,b) => a - b)
    )
  }

  // Build the schedule JSON to save
  const buildSchedule = () => {
    const schedule = {}
    if (isAIPlan && plan.aiSchedule) {
      // AI plan: map chosen days to parsed day entries
      const entries = Object.entries(plan.aiSchedule)
      chosenDays.forEach((dayIdx, i) => {
        if (entries[i]) schedule[dayIdx] = entries[i][1]
      })
    } else if (plan?.exercises) {
      // Single workout being saved to all chosen days
      const workoutObj = {
        name: plan.title,
        type: plan.type || 'Strength',
        duration: plan.duration || 45,
        cal: plan.cal || 0,
        exercises: plan.exercises,
      }
      chosenDays.forEach(d => { schedule[d] = workoutObj })
    }
    return schedule
  }

  const save = async () => {
    if (!planName.trim() || chosenDays.length === 0) return
    setSaving(true)
    const schedule = buildSchedule()
    await supabase.from('saved_plans').insert({
      user_id: userId,
      title: planName,
      content: plan?.rawText || plan?.title || '',
      plan_type: plan?.type || 'workout',
      days_per_week: chosenDays.length,
      chosen_days: chosenDays,
      schedule,
      is_active: true,
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  const aiDayCount = plan?.aiSchedule ? Object.keys(plan.aiSchedule).length : 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, border: `1px solid ${C.borderStrong}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Save to my plans</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Plan name */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Plan name</div>
          <input value={planName} onChange={e => setPlanName(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
        </div>

        {/* Day picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
            Which days will you do this?
          </div>
          {isAIPlan && aiDayCount > 0 && (
            <div style={{ fontSize: 11, color: C.gold, marginBottom: 10 }}>
              This plan has {aiDayCount} workout days — pick {aiDayCount} days below
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS_SHORT.map((day, i) => {
              const chosen = chosenDays.includes(i)
              return (
                <button key={i} onClick={() => toggleDay(i)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10,
                  border: `1px solid ${chosen ? C.gold : C.border}`,
                  background: chosen ? C.goldLight : 'transparent',
                  color: chosen ? C.gold : C.textMuted,
                  fontSize: 11, fontWeight: chosen ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  {day.slice(0,1)}
                  <span style={{ fontSize: 9, color: chosen ? C.gold : C.textDim }}>{day.slice(1,3)}</span>
                </button>
              )
            })}
          </div>
          {chosenDays.length > 0 && (
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>
              {chosenDays.map(d => DAYS_SHORT[d]).join(', ')} · {chosenDays.length} day{chosenDays.length !== 1 ? 's' : ''}/week
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 20, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <GoldBtn onClick={save} disabled={saving || !planName.trim() || chosenDays.length === 0} style={{ flex: 1, padding: 12, fontSize: 13 }}>
            {saving ? 'Saving...' : 'Save plan'}
          </GoldBtn>
        </div>
      </div>
    </div>
  )
}

// ── Saved Plans View ───────────────────────────────────────────────────────

function SavedPlans({ userId, onBack }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase.from('saved_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setPlans(data || []); setLoading(false) })
  }, [userId])

  const deletePlan = async (id) => {
    await supabase.from('saved_plans').delete().eq('id', id)
    setPlans(p => p.filter(plan => plan.id !== id))
  }

  const toggleActive = async (plan) => {
    await supabase.from('saved_plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    setPlans(p => p.map(pl => pl.id === plan.id ? { ...pl, is_active: !pl.is_active } : pl))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>Loading plans...</div>

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>My saved plans</div>

      {plans.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40, borderStyle: 'dashed' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>No saved plans yet</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Generate an AI plan or save a workout to get started</div>
        </Card>
      ) : plans.map(plan => {
        const isExp = expanded === plan.id
        const days = plan.chosen_days || []
        const schedule = plan.schedule || {}
        return (
          <Card key={plan.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{plan.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {days.length > 0 ? days.map(d => DAYS_SHORT[d]).join(', ') : `${plan.days_per_week || '?'} days/week`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => toggleActive(plan)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: `1px solid ${plan.is_active ? C.green : C.border}`, background: plan.is_active ? C.greenLight : 'transparent', color: plan.is_active ? C.green : C.textMuted, cursor: 'pointer' }}>
                  {plan.is_active ? 'Active' : 'Paused'}
                </button>
                <button onClick={() => deletePlan(plan.id)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
            </div>

            {/* Day chips */}
            {days.length > 0 && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                {DAYS_SHORT.map((d, i) => {
                  const active = days.includes(i)
                  const hasWorkout = !!schedule[i]
                  return (
                    <div key={i} style={{ padding: '4px 9px', borderRadius: 8, fontSize: 11, fontWeight: active ? 600 : 400, background: active ? C.goldLight : 'transparent', color: active ? C.gold : C.textDim, border: `1px solid ${active ? C.gold + '55' : C.border}` }}>
                      {d.slice(0,3)}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Schedule preview */}
            {Object.keys(schedule).length > 0 && (
              <>
                <button onClick={() => setExpanded(isExp ? null : plan.id)} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: isExp ? 10 : 0 }}>
                  {isExp ? '▴ Hide schedule' : '▾ View schedule'}
                </button>
                {isExp && (
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    {Object.entries(schedule).sort(([a],[b]) => parseInt(a)-parseInt(b)).map(([dayIdx, workout]) => (
                      <div key={dayIdx} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, width: 34, flexShrink: 0 }}>{DAYS_SHORT[parseInt(dayIdx)]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{workout.name}</div>
                          {workout.duration && <div style={{ fontSize: 11, color: C.textMuted }}>{workout.duration}min · {workout.exercises?.length || 0} exercises</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ── AI Plan Generator — returns structured JSON schedule ───────────────────

function AIPlanGenerator({ userId, onBack }) {
  const [goal, setGoal] = useState('')
  const [daysCount, setDaysCount] = useState(3)
  const [aiSchedule, setAiSchedule] = useState(null) // parsed structured schedule
  const [rawText, setRawText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saved, setSaved] = useState(false)

  const generate = async () => {
    setAiLoading(true); setAiSchedule(null); setRawText(''); setSaved(false)

    const SYSTEM = `You are an expert personal trainer. The user wants a ${daysCount}-day weekly workout plan.
Return ONLY valid JSON, no markdown, no explanation.
Format:
{
  "days": [
    {
      "day": "Day 1",
      "name": "Upper Body Strength",
      "type": "Strength",
      "duration": 45,
      "warmup": "5 min light cardio + arm circles",
      "exercises": [
        {"name": "Bench Press", "sets": 4, "reps": 8, "rest": "90s", "tip": "Keep shoulder blades retracted"},
        {"name": "Pull-ups", "sets": 3, "reps": 10, "rest": "60s", "tip": "Full range of motion"},
        {"name": "Plank", "duration": "60s", "sets": 3, "rest": "45s", "tip": "Keep hips level"}
      ],
      "cooldown": "5 min stretching"
    }
  ]
}`

    try {
      const raw = await askClaude(SYSTEM, `Create a ${daysCount}-day workout plan for: ${goal}`)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      // Convert array to object keyed by index
      const scheduleObj = {}
      parsed.days.forEach((d, i) => { scheduleObj[i] = d })
      setAiSchedule(scheduleObj)
      setRawText(raw)
    } catch {
      // Fallback: store as plain text
      const plain = await askClaude(
        'You are an expert personal trainer. Create a concise weekly workout plan. Plain text only, no markdown symbols. Under 300 words.',
        `Create a ${daysCount}-day workout plan for: ${goal}`
      )
      setRawText(plain)
    }
    setAiLoading(false)
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 6 }}>AI Workout Plan</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Tell AI your goal and how many days — get a fully structured plan</div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Days per week</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[2,3,4,5,6].map(d => (
              <button key={d} onClick={() => setDaysCount(d)} style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1px solid ${daysCount===d?C.gold:C.border}`, background: daysCount===d?C.goldLight:'transparent', color: daysCount===d?C.gold:C.textMuted, fontSize: 13, cursor: 'pointer', fontWeight: daysCount===d?600:400 }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Your goal</div>
          <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3}
            placeholder="e.g. Build muscle and lose fat, intermediate level, full gym access..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.6 }} />
        </div>
        <GoldBtn onClick={generate} disabled={aiLoading || !goal.trim()} style={{ width: '100%', padding: 13 }}>
          {aiLoading ? 'Building your plan...' : `Generate ${daysCount}-day plan ✨`}
        </GoldBtn>
      </Card>

      {aiLoading && (
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <Spinner />
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Building your structured plan...</div>
        </Card>
      )}

      {/* Structured plan preview */}
      {aiSchedule && !aiLoading && (
        <div style={{ marginBottom: 16 }}>
          {Object.entries(aiSchedule).map(([idx, day]) => (
            <Card key={idx} style={{ marginBottom: 10, borderColor: C.purple + '55' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: C.purple + '22', border: `1px solid ${C.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {day.type === 'Strength' ? '💪' : day.type === 'Cardio' ? '🏃' : day.type === 'HIIT' ? '⚡' : '🏋️'}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{day.day} · {day.type}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{day.name}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted }}>⏱ {day.duration}min</div>
              </div>
              {day.warmup && <div style={{ fontSize: 12, color: C.amber, marginBottom: 8 }}>🔥 Warmup: {day.warmup}</div>}
              {day.exercises?.map((ex, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: `1px solid ${C.border}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.purple + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.purple, flexShrink: 0 }}>{j+1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : ex.duration ? `${ex.sets ? ex.sets + ' sets × ' : ''}${ex.duration}` : ''}
                      {ex.rest ? ` · rest ${ex.rest}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              {day.cooldown && <div style={{ fontSize: 12, color: C.blue, marginTop: 8 }}>❄️ Cooldown: {day.cooldown}</div>}
            </Card>
          ))}

          <div style={{ display: 'flex', gap: 10 }}>
            <GoldBtn onClick={() => setShowSaveModal(true)} disabled={saved} style={{ flex: 1, padding: 12, fontSize: 13 }}>
              {saved ? '✓ Saved!' : '+ Save this plan'}
            </GoldBtn>
            <GoldBtn onClick={generate} outline style={{ flex: 1, padding: 12, fontSize: 13 }}>↺ Regenerate</GoldBtn>
          </div>
        </div>
      )}

      {/* Fallback plain text */}
      {rawText && !aiSchedule && !aiLoading && (
        <Card style={{ borderColor: C.borderStrong, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 16 }}>{rawText}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <GoldBtn onClick={() => setShowSaveModal(true)} disabled={saved} style={{ flex: 1, padding: 12, fontSize: 13 }}>
              {saved ? '✓ Saved!' : '+ Save this plan'}
            </GoldBtn>
            <GoldBtn onClick={generate} outline style={{ flex: 1, padding: 12, fontSize: 13 }}>↺ Regenerate</GoldBtn>
          </div>
        </Card>
      )}

      {showSaveModal && (
        <SavePlanModal
          plan={{ title: goal.slice(0, 50), aiSchedule, rawText, type: 'workout' }}
          userId={userId}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => setSaved(true)}
        />
      )}
    </div>
  )
}

// ── Main Workouts Tab ──────────────────────────────────────────────────────

export default function WorkoutsTab({ userId }) {
  const [view, setView] = useState('browse')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [savePlan, setSavePlan] = useState(null)
  const [customWorkouts, setCustomWorkouts] = useState([])
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    supabase.from('custom_workouts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => setCustomWorkouts(data || []))
    supabase.from('saved_plans').select('id', { count: 'exact' }).eq('user_id', userId)
      .then(({ count }) => setSavedCount(count || 0))
  }, [userId])

  const allWorkouts = [
    ...WORKOUTS,
    ...customWorkouts.map(w => ({
      id: `custom-${w.id}`, name: w.name, type: w.type, duration: w.duration_minutes,
      cal: Math.round(w.duration_minutes * 7), level: 'Custom', exercises: w.exercises || [], isCustom: true
    }))
  ].filter(w => (filter === 'All' || w.type === filter) && w.name.toLowerCase().includes(search.toLowerCase()))

  if (view === 'detail' && selected) return (
    <WorkoutDetail workout={selected} userId={userId} onBack={() => setView('browse')}
      onSavePlan={(plan) => { setSavePlan(plan); setView('browse') }} />
  )
  if (view === 'custom') return <CustomWorkoutBuilder userId={userId} onBack={() => setView('browse')} onSaved={() => setView('browse')} />
  if (view === 'saved') return <SavedPlans userId={userId} onBack={() => setView('browse')} />
  if (view === 'ai') return <AIPlanGenerator userId={userId} onBack={() => setView('browse')} />

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'AI Plan', icon: '✨', action: () => setView('ai') },
          { label: 'Build custom', icon: '🔧', action: () => setView('custom') },
          { label: `My plans${savedCount > 0 ? ` (${savedCount})` : ''}`, icon: '📋', action: () => setView('saved') },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{ padding: '12px 8px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>{btn.icon}</span>{btn.label}
          </button>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search workouts..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', marginBottom: 14 }} />

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {WORKOUT_CATEGORIES.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter===t?C.gold:C.border}`, background: filter===t?C.gold:'transparent', color: filter===t?C.dark:C.textMuted, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{t}</button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{allWorkouts.length} workout{allWorkouts.length !== 1 ? 's' : ''}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {allWorkouts.map(w => (
          <Card key={w.id} onClick={() => { setSelected(w); setView('detail') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: `${TYPE_COLORS[w.type]||C.gold}22`, color: TYPE_COLORS[w.type]||C.gold, fontWeight: 500 }}>{w.type}</span>
              {w.isCustom && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: C.goldLight, color: C.gold }}>Custom</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.3 }}>{w.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>⏱ {w.duration}m · 🔥 {w.cal} kcal</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{w.level} · {w.exercises.length} exercises</div>
          </Card>
        ))}
      </div>

      {savePlan && (
        <SavePlanModal plan={savePlan} userId={userId} onClose={() => setSavePlan(null)} onSaved={() => setSavedCount(p => p + 1)} />
      )}
    </div>
  )
}
