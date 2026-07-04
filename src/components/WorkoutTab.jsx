import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import { toUserDateStr } from '../lib/dateUtils.js'

// ─────────────────────────────────────────────
// Exercise library — categorized
// ─────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  'Chest': [
    { name: 'Bench Press', icon: '🏋️', muscles: 'Chest, Triceps, Shoulders' },
    { name: 'Push Ups', icon: '💪', muscles: 'Chest, Triceps' },
    { name: 'Incline Bench Press', icon: '🏋️', muscles: 'Upper Chest' },
    { name: 'Chest Fly', icon: '🦋', muscles: 'Chest' },
    { name: 'Dips', icon: '💪', muscles: 'Chest, Triceps' },
  ],
  'Back': [
    { name: 'Pull Ups', icon: '💪', muscles: 'Lats, Biceps' },
    { name: 'Deadlift', icon: '🏋️', muscles: 'Full Back, Hamstrings' },
    { name: 'Bent Over Row', icon: '🏋️', muscles: 'Back, Biceps' },
    { name: 'Lat Pulldown', icon: '💪', muscles: 'Lats' },
    { name: 'Seated Row', icon: '🚣', muscles: 'Mid Back' },
  ],
  'Legs': [
    { name: 'Squat', icon: '🏋️', muscles: 'Quads, Glutes, Hamstrings' },
    { name: 'Romanian Deadlift', icon: '🏋️', muscles: 'Hamstrings, Glutes' },
    { name: 'Leg Press', icon: '🦵', muscles: 'Quads, Glutes' },
    { name: 'Lunges', icon: '🦵', muscles: 'Quads, Glutes' },
    { name: 'Calf Raises', icon: '🦵', muscles: 'Calves' },
    { name: 'Leg Curl', icon: '🦵', muscles: 'Hamstrings' },
  ],
  'Shoulders': [
    { name: 'Overhead Press', icon: '🏋️', muscles: 'Shoulders, Triceps' },
    { name: 'Lateral Raise', icon: '💪', muscles: 'Side Delts' },
    { name: 'Front Raise', icon: '💪', muscles: 'Front Delts' },
    { name: 'Face Pull', icon: '💪', muscles: 'Rear Delts' },
    { name: 'Arnold Press', icon: '🏋️', muscles: 'All Delts' },
  ],
  'Arms': [
    { name: 'Bicep Curl', icon: '💪', muscles: 'Biceps' },
    { name: 'Hammer Curl', icon: '💪', muscles: 'Biceps, Forearms' },
    { name: 'Tricep Pushdown', icon: '💪', muscles: 'Triceps' },
    { name: 'Skull Crushers', icon: '🏋️', muscles: 'Triceps' },
    { name: 'Preacher Curl', icon: '💪', muscles: 'Biceps' },
  ],
  'Core': [
    { name: 'Plank', icon: '🧘', muscles: 'Core', timed: true },
    { name: 'Crunches', icon: '💪', muscles: 'Abs' },
    { name: 'Russian Twist', icon: '🔄', muscles: 'Obliques' },
    { name: 'Leg Raises', icon: '🦵', muscles: 'Lower Abs' },
    { name: 'Mountain Climbers', icon: '🏔️', muscles: 'Core, Cardio', timed: true },
  ],
  'Cardio': [
    { name: 'Running', icon: '🏃', muscles: 'Full Body', timed: true },
    { name: 'Cycling', icon: '🚴', muscles: 'Legs, Cardio', timed: true },
    { name: 'Jump Rope', icon: '🪢', muscles: 'Full Body', timed: true },
    { name: 'Swimming', icon: '🏊', muscles: 'Full Body', timed: true },
    { name: 'Rowing', icon: '🚣', muscles: 'Full Body', timed: true },
    { name: 'HIIT', icon: '⚡', muscles: 'Full Body', timed: true },
    { name: 'Walking', icon: '🚶', muscles: 'Legs', timed: true },
    { name: 'Elliptical', icon: '🏃', muscles: 'Full Body', timed: true },
  ],
}

const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(([cat, exs]) =>
  exs.map(ex => ({ ...ex, category: cat }))
)

// Quick workout templates
const TEMPLATES = [
  {
    name: 'Push Day',
    icon: '💪',
    color: T.purple,
    exercises: ['Bench Press', 'Overhead Press', 'Incline Bench Press', 'Lateral Raise', 'Tricep Pushdown'],
  },
  {
    name: 'Pull Day',
    icon: '🔙',
    color: T.blue,
    exercises: ['Pull Ups', 'Bent Over Row', 'Lat Pulldown', 'Bicep Curl', 'Face Pull'],
  },
  {
    name: 'Leg Day',
    icon: '🦵',
    color: T.green,
    exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Calf Raises'],
  },
  {
    name: 'Full Body',
    icon: '🏋️',
    color: T.amber,
    exercises: ['Squat', 'Bench Press', 'Bent Over Row', 'Overhead Press', 'Plank'],
  },
  {
    name: 'Cardio',
    icon: '🏃',
    color: T.red,
    exercises: ['Running', 'Jump Rope', 'Mountain Climbers'],
  },
]

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.divider}`, boxShadow: T.shadowCard, padding: '16px 18px', ...style }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// SetRow — one set within an exercise
// ─────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, timed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: set.done ? T.green : T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: set.done ? '#fff' : T.purple, flexShrink: 0, cursor: 'pointer' }}
        onClick={() => onChange({ ...set, done: !set.done })}>
        {set.done ? '✓' : idx + 1}
      </div>
      {timed ? (
        <input type="number" value={set.duration || ''} onChange={e => onChange({ ...set, duration: e.target.value })}
          placeholder="sec" style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
      ) : (
        <>
          <input type="number" value={set.weight || ''} onChange={e => onChange({ ...set, weight: e.target.value })}
            placeholder="kg" style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
          <span style={{ color: T.textDim, fontSize: 12 }}>×</span>
          <input type="number" value={set.reps || ''} onChange={e => onChange({ ...set, reps: e.target.value })}
            placeholder="reps" style={{ flex: 1, padding: '7px 10px', borderRadius: 10, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
        </>
      )}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: T.textDim, fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>✕</button>
    </div>
  )
}

// ─────────────────────────────────────────────
// ExerciseCard — one exercise with its sets
// ─────────────────────────────────────────────
function ExerciseCard({ ex, onUpdate, onRemove }) {
  const timed    = ex.timed
  const doneSets = ex.sets.filter(s => s.done).length

  const addSet = () => {
    const prev = ex.sets[ex.sets.length - 1] || {}
    onUpdate({ ...ex, sets: [...ex.sets, { weight: prev.weight || '', reps: prev.reps || '', duration: prev.duration || '', done: false }] })
  }

  const updateSet = (i, s) => {
    const sets = [...ex.sets]
    sets[i] = s
    onUpdate({ ...ex, sets })
  }

  const removeSet = (i) => {
    const sets = ex.sets.filter((_, j) => j !== i)
    onUpdate({ ...ex, sets })
  }

  return (
    <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.divider}`, marginBottom: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: doneSets > 0 && doneSets === ex.sets.length ? T.greenLight : 'transparent' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {ex.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{ex.name}</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>
            {ex.muscles} · {doneSets}/{ex.sets.length} sets done
          </div>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: T.textDim, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>

      {/* Set headers */}
      <div style={{ padding: '0 16px 4px' }}>
        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: T.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, paddingLeft: 32 }}>
          {timed ? <span style={{ flex: 1, textAlign: 'center' }}>Duration (sec)</span> : <>
            <span style={{ flex: 1, textAlign: 'center' }}>Weight (kg)</span>
            <span style={{ width: 12 }} />
            <span style={{ flex: 1, textAlign: 'center' }}>Reps</span>
          </>}
          <span style={{ width: 24 }} />
        </div>

        {ex.sets.map((set, i) => (
          <SetRow key={i} set={set} idx={i} timed={timed}
            onChange={s => updateSet(i, s)}
            onRemove={() => removeSet(i)} />
        ))}

        <button onClick={addSet} style={{ width: '100%', padding: '8px', marginTop: 8, marginBottom: 12, borderRadius: 10, background: T.purpleLight, border: `1px dashed ${T.purple}55`, color: T.purple, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Add set
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Exercise picker modal
// ─────────────────────────────────────────────
function ExercisePicker({ onAdd, onClose }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  const categories = ['All', ...Object.keys(EXERCISE_LIBRARY)]

  const filtered = (search
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.toLowerCase().includes(search.toLowerCase()))
    : category === 'All' ? ALL_EXERCISES : EXERCISE_LIBRARY[category] || []
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: T.shadowStrong }}>

        {/* Handle + title */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.divider, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 12 }}>Add Exercise</div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." autoFocus
              style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 12, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none' }} />
          </div>

          {/* Category chips */}
          {!search && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', border: `1px solid ${category === cat ? T.purple : T.border}`, background: category === cat ? T.purpleLight : 'transparent', color: category === cat ? T.purple : T.textMuted, fontWeight: category === cat ? 600 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exercise list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 24px' }}>
          {filtered.map((ex, i) => (
            <button key={i} onClick={() => { onAdd(ex); onClose() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.divider}`, background: 'none', border: 'none', borderBottom: `1px solid ${T.divider}`, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {ex.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{ex.category} · {ex.muscles}</div>
              </div>
              <span style={{ fontSize: 18, color: T.purple }}>+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Active workout session
// ─────────────────────────────────────────────
function WorkoutSession({ userId, timezone, selectedDate, onSave, onCancel }) {
  const [workoutName, setWorkoutName]   = useState('')
  const [exercises,   setExercises]     = useState([])
  const [showPicker,  setShowPicker]    = useState(false)
  const [startTime]                     = useState(Date.now())
  const [elapsed,     setElapsed]       = useState(0)
  const [saving,      setSaving]        = useState(false)
  const [notes,       setNotes]         = useState('')

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startTime])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      ...ex,
      sets: [{ weight: '', reps: '', duration: '', done: false }],
    }])
  }

  const updateExercise = (i, ex) => setExercises(prev => prev.map((e, j) => j === i ? ex : e))
  const removeExercise = (i) => setExercises(prev => prev.filter((_, j) => j !== i))

  const totalSets = exercises.reduce((s, e) => s + e.sets.filter(s => s.done).length, 0)
  const totalVol  = exercises.reduce((s, e) => s + e.sets.filter(s => s.done).reduce((sv, set) => sv + ((parseFloat(set.weight)||0) * (parseInt(set.reps)||1)), 0), 0)

  const handleSave = async () => {
    if (!workoutName.trim() && exercises.length === 0) return
    setSaving(true)

    const name     = workoutName.trim() || exercises.map(e => e.name).join(', ') || 'Workout'
    const minutes  = Math.max(1, Math.round(elapsed / 60))
    const calBurned = Math.round(minutes * 6) // rough estimate: 6 kcal/min

    const exerciseData = exercises.map(ex => ({
      name:    ex.name,
      category: ex.category,
      sets:    ex.sets.filter(s => s.done).map(s => ({
        weight:   parseFloat(s.weight) || null,
        reps:     parseInt(s.reps)     || null,
        duration: parseInt(s.duration) || null,
      })),
    }))

    await supabase.from('workout_logs').insert({
      user_id:         userId,
      log_date:        selectedDate,
      workout_name:    name,
      workout_type:    exercises[0]?.category || 'General',
      duration_minutes: minutes,
      calories_burned: calBurned,
      exercises:       exerciseData,
      notes:           notes.trim() || null,
    })

    setSaving(false)
    onSave()
  }

  return (
    <div>
      {/* Session header */}
      <div style={{ background: `linear-gradient(135deg, ${T.purple}, ${T.purpleDark})`, borderRadius: 20, padding: '20px 20px 16px', marginBottom: 16, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Active workout</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(elapsed)}</div>
        </div>

        <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout name (e.g. Push Day)" 
          style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none' }} />

        {/* Stats */}
        {exercises.length > 0 && (
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            {[
              { label: 'Exercises', value: exercises.length },
              { label: 'Sets done', value: totalSets },
              { label: 'Volume', value: `${Math.round(totalVol)}kg` },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercises */}
      {exercises.map((ex, i) => (
        <ExerciseCard key={i} ex={ex}
          onUpdate={ex => updateExercise(i, ex)}
          onRemove={() => removeExercise(i)} />
      ))}

      {/* Add exercise */}
      <button onClick={() => setShowPicker(true)}
        style={{ width: '100%', padding: '13px', borderRadius: 16, background: T.purpleLight, border: `2px dashed ${T.purple}55`, color: T.purple, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
        + Add exercise
      </button>

      {/* Notes */}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', resize: 'none', marginBottom: 14, lineHeight: 1.5 }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: '12px', borderRadius: 16, background: T.surfaceMid, border: 'none', color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 2, padding: '12px', borderRadius: 16, background: T.green, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
          {saving ? 'Saving…' : `✓ Finish workout · ${formatTime(elapsed)}`}
        </button>
      </div>

      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Workout history card
// ─────────────────────────────────────────────
function WorkoutHistoryCard({ log, onDelete }) {
  const [expanded,    setExpanded]    = useState(false)
  const [confirming,  setConfirming]  = useState(false)

  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          💪
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{log.workout_name}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            {[
              log.duration_minutes && `${log.duration_minutes} min`,
              log.calories_burned  && `${log.calories_burned} kcal`,
              log.workout_type,
            ].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {log.exercises?.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{ padding: '6px 12px', borderRadius: 10, background: T.purpleLight, border: 'none', color: T.purple, fontSize: 12, cursor: 'pointer' }}>
              {expanded ? '▲' : `${log.exercises.length} ex`}
            </button>
          )}
          {!confirming ? (
            <button onClick={() => setConfirming(true)} style={{ padding: '6px 10px', borderRadius: 10, background: T.redLight, border: 'none', color: T.red, fontSize: 12, cursor: 'pointer' }}>✕</button>
          ) : (
            <button onClick={() => onDelete(log.id)} style={{ padding: '6px 10px', borderRadius: 10, background: T.red, border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete?</button>
          )}
        </div>
      </div>

      {expanded && log.exercises?.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${T.divider}`, paddingTop: 12 }}>
          {log.exercises.map((ex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, minWidth: 120 }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {ex.sets?.map((s, j) => (
                  <span key={j} style={{ marginRight: 6 }}>
                    {s.weight ? `${s.weight}kg×${s.reps}` : s.duration ? `${s.duration}s` : `×${s.reps}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────
// Main WorkoutTab
// ─────────────────────────────────────────────
export default function WorkoutTab({ userId, profile, selectedDate: externalDate }) {
  const { t }         = useTranslation()
  const timezone      = profile?.timezone
  const today         = toUserDateStr(timezone)
  const selectedDate  = externalDate || today
  const isToday       = selectedDate === today

  const [view,        setView]        = useState('home') // home | session | history
  const [logs,        setLogs]        = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => { fetchLogs() }, [userId, selectedDate])

  const fetchLogs = async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', selectedDate)
      .order('created_at', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  const deleteLog = async (id) => {
    await supabase.from('workout_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const totalMinutes = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0)
  const totalCal     = logs.reduce((s, l) => s + (l.calories_burned  || 0), 0)

  // ── Active session ──────────────────────────
  if (view === 'session') {
    return (
      <WorkoutSession
        userId={userId}
        timezone={timezone}
        selectedDate={selectedDate}
        onSave={() => { fetchLogs(); setView('home') }}
        onCancel={() => setView('home')}
      />
    )
  }

  // ── Home ────────────────────────────────────
  return (
    <div>
      {/* Summary strip (if logged today) */}
      {logs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Workouts', value: logs.length, color: T.purple },
            { label: 'Minutes',  value: totalMinutes, color: T.green  },
            { label: 'Kcal',     value: totalCal,    color: T.amber  },
          ].map(s => (
            <Card key={s.label} style={{ padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Start workout button */}
      {isToday && (
        <button onClick={() => setView('session')}
          style={{ width: '100%', padding: '16px', borderRadius: 20, background: `linear-gradient(135deg, ${T.purple}, ${T.purpleDark})`, border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: T.shadowStrong }}>
          <span style={{ fontSize: 22 }}>🏋️</span> Start workout
        </button>
      )}

      {/* Quick templates */}
      {isToday && logs.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Quick start</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.name} onClick={() => {
                setView('session')
                // Template will be auto-applied via the session init
                // Store template choice in sessionStorage for the session to pick up
                sessionStorage.setItem('auron_template', JSON.stringify(tmpl))
              }}
                style={{ flexShrink: 0, padding: '12px 16px', borderRadius: 16, background: T.surface, border: `1px solid ${T.divider}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 90, boxShadow: T.shadowCard }}>
                <span style={{ fontSize: 24 }}>{tmpl.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{tmpl.name}</span>
                <span style={{ fontSize: 10, color: T.textMuted }}>{tmpl.exercises.length} ex</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workout logs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.textMuted }}>Loading…</div>
      ) : logs.length > 0 ? (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            {isToday ? "Today's workouts" : "Workouts this day"}
          </div>
          {logs.map(log => (
            <WorkoutHistoryCard key={log.id} log={log} onDelete={deleteLog} />
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            {isToday ? 'No workouts yet today' : 'No workouts this day'}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            {isToday ? 'Tap "Start workout" to begin tracking' : 'Switch to today to log a workout'}
          </div>
        </Card>
      )}
    </div>
  )
}
