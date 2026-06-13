import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { askClaude } from '../lib/claude'
import { WORKOUTS, WORKOUT_CATEGORIES } from '../lib/workouts'

const C = {
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.12)', goldDark: '#8B6914',
  dark: '#0F0F0F', surface: '#1A1A1A', surfaceLight: '#242424',
  border: 'rgba(201,168,76,0.2)', borderStrong: 'rgba(201,168,76,0.4)',
  text: '#F0EDE6', textMuted: '#888880',
  green: '#4CAF72', greenLight: 'rgba(76,175,114,0.15)',
  red: '#E05252', blue: '#5B9BD5', amber: '#D4924A',
}

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
    <button onClick={onClick} disabled={disabled} style={{ padding: '10px 20px', borderRadius: 24, background: outline ? 'transparent' : disabled ? C.surfaceLight : C.gold, color: outline ? C.gold : disabled ? C.textMuted : C.dark, border: outline ? `1px solid ${C.gold}` : 'none', fontSize: 13, fontWeight: 500, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
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

  const saveAsPlan = () => {
    onSavePlan({
      title: workout.name,
      exercises: workout.exercises,
      type: workout.type,
      duration: workout.duration,
      cal: workout.cal,
    })
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

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <GoldBtn onClick={logWorkout} disabled={logging || logged} style={{ flex: 1, padding: 14, fontSize: 14 }}>
          {logged ? '✓ Logged!' : logging ? 'Logging...' : '▶ Start & log workout'}
        </GoldBtn>
        <GoldBtn onClick={saveAsPlan} outline style={{ flex: 1, padding: 14, fontSize: 14 }}>
          + Save to my plans
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
      user_id: userId,
      name,
      type,
      duration_minutes: parseInt(duration) || 45,
      exercises: exerciseList,
    })
    setSaving(false)
    onSaved()
  }

  const inp = (val, set, placeholder, type = 'text', style = {}) => (
    <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
      style={{ padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', width: '100%', ...style }} />
  )

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Build custom workout</div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Workout name</div>
          {inp(name, setName, 'e.g. My Monday Push Day')}
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
            {inp(duration, setDuration, '45', 'number')}
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

// ── Save Plan Modal ────────────────────────────────────────────────────────

function SavePlanModal({ plan, userId, onClose, onSaved }) {
  const [planName, setPlanName] = useState(plan?.title || '')
  const [daysPerWeek, setDaysPerWeek] = useState('3')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('saved_plans').insert({
      user_id: userId,
      title: planName,
      content: plan?.content || plan?.exercises?.join('\n') || '',
      plan_type: plan?.type || 'workout',
      days_per_week: parseInt(daysPerWeek),
      is_active: true,
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, border: `1px solid ${C.borderStrong}` }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>Save to my plans</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Plan name</div>
          <input value={planName} onChange={e => setPlanName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Days per week</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['2','3','4','5','6'].map(d => (
              <button key={d} onClick={() => setDaysPerWeek(d)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${daysPerWeek === d ? C.gold : C.border}`, background: daysPerWeek === d ? C.goldLight : 'transparent', color: daysPerWeek === d ? C.gold : C.textMuted, fontSize: 13, cursor: 'pointer' }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 20, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <GoldBtn onClick={save} disabled={saving || !planName.trim()} style={{ flex: 1, padding: 12, fontSize: 13 }}>
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
      ) : plans.map(plan => (
        <Card key={plan.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{plan.title}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{plan.days_per_week} days/week · {plan.plan_type}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => toggleActive(plan)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: `1px solid ${plan.is_active ? C.green : C.border}`, background: plan.is_active ? C.greenLight : 'transparent', color: plan.is_active ? C.green : C.textMuted, cursor: 'pointer' }}>
                {plan.is_active ? 'Active' : 'Paused'}
              </button>
              <button onClick={() => deletePlan(plan.id)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
          </div>
          {plan.content && (
            <>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, whiteSpace: 'pre-line', maxHeight: expanded === plan.id ? 'none' : 80, overflow: 'hidden' }}>
                {plan.content}
              </div>
              {plan.content.length > 200 && (
                <button onClick={() => setExpanded(expanded === plan.id ? null : plan.id)} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 12, cursor: 'pointer', marginTop: 6 }}>
                  {expanded === plan.id ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

// ── AI Plan Generator ──────────────────────────────────────────────────────

function AIPlanGenerator({ userId, onBack }) {
  const [goal, setGoal] = useState('')
  const [aiPlan, setAiPlan] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saved, setSaved] = useState(false)

  const generate = async () => {
    setAiLoading(true); setAiPlan(''); setSaved(false)
    const plan = await askClaude(
      'You are an expert personal trainer. Create a concise weekly workout plan. Plain text only, no markdown symbols or asterisks. Under 250 words. Number each day clearly.',
      `Create a weekly workout plan for: ${goal}`
    )
    setAiPlan(plan)
    setAiLoading(false)
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>← Back</button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 6 }}>AI Workout Plan</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Describe your goal and get a personalized weekly plan</div>

      <Card style={{ marginBottom: 16 }}>
        <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3}
          placeholder="e.g. Build muscle and lose fat, 4 days a week, I have access to a full gym, intermediate level..."
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.6, marginBottom: 12 }} />
        <GoldBtn onClick={generate} disabled={aiLoading || !goal.trim()} style={{ width: '100%', padding: 13 }}>
          {aiLoading ? 'Generating plan...' : 'Generate my plan ✨'}
        </GoldBtn>
      </Card>

      {aiLoading && (
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <Spinner />
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>AI is building your personalized plan...</div>
        </Card>
      )}

      {aiPlan && !aiLoading && (
        <Card style={{ borderColor: C.borderStrong }}>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 16 }}>{aiPlan}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <GoldBtn onClick={() => setShowSaveModal(true)} disabled={saved} style={{ flex: 1, padding: 12, fontSize: 13 }}>
              {saved ? '✓ Saved to my plans' : '+ Save this plan'}
            </GoldBtn>
            <GoldBtn onClick={generate} outline style={{ flex: 1, padding: 12, fontSize: 13 }}>
              Regenerate ↺
            </GoldBtn>
          </div>
        </Card>
      )}

      {showSaveModal && (
        <SavePlanModal
          plan={{ title: goal.slice(0, 40), content: aiPlan, type: 'workout' }}
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
  const [view, setView] = useState('browse') // browse | detail | custom | saved | ai
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

  const filtered = [...WORKOUTS, ...customWorkouts.map(w => ({
    id: `custom-${w.id}`, name: w.name, type: w.type, duration: w.duration_minutes,
    cal: Math.round(w.duration_minutes * 7), level: 'Custom', exercises: w.exercises || [], isCustom: true
  }))].filter(w => {
    const matchType = filter === 'All' || w.type === filter
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  if (view === 'detail' && selected) return (
    <WorkoutDetail workout={selected} userId={userId} onBack={() => setView('browse')}
      onSavePlan={(plan) => { setSavePlan(plan); setView('browse') }} />
  )
  if (view === 'custom') return <CustomWorkoutBuilder userId={userId} onBack={() => setView('browse')} onSaved={() => { setView('browse'); }} />
  if (view === 'saved') return <SavedPlans userId={userId} onBack={() => setView('browse')} />
  if (view === 'ai') return <AIPlanGenerator userId={userId} onBack={() => setView('browse')} />

  return (
    <div>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'AI Plan', icon: '✨', action: () => setView('ai') },
          { label: 'Build custom', icon: '🔧', action: () => setView('custom') },
          { label: `My plans${savedCount > 0 ? ` (${savedCount})` : ''}`, icon: '📋', action: () => setView('saved') },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{ padding: '12px 8px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search workouts..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', marginBottom: 14 }} />

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {WORKOUT_CATEGORIES.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === t ? C.gold : C.border}`, background: filter === t ? C.gold : 'transparent', color: filter === t ? C.dark : C.textMuted, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{t}</button>
        ))}
      </div>

      {/* Workout count */}
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{filtered.length} workout{filtered.length !== 1 ? 's' : ''}</div>

      {/* Workout grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(w => (
          <Card key={w.id} onClick={() => { setSelected(w); setView('detail') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: `${TYPE_COLORS[w.type] || C.gold}22`, color: TYPE_COLORS[w.type] || C.gold, fontWeight: 500 }}>{w.type}</span>
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
