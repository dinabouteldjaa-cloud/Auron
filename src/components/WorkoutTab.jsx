import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { toUserDateStr } from '../lib/dateUtils.js'
import {
  EXERCISES, LIBRARY_WORKOUTS, SPORTS, LEVEL_COLOR,
  getExercise,
} from '../lib/workoutData.js'

const C = T

// ─────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{ background:C.surface, borderRadius:18, border:`1px solid ${C.divider}`, boxShadow:C.shadowCard, padding:'16px 18px', ...style }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{children}</div>
}
function BackBtn({ onBack, label='Back' }) {
  return (
    <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', marginBottom:20, padding:0 }}>
      ‹ {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// Exercise How-To expandable
// ─────────────────────────────────────────────
function ExerciseHowTo({ ex }) {
  const [open, setOpen] = useState(false)
  const data = getExercise(ex.name)
  if (!data.howTo?.length) return null
  return (
    <div style={{ marginTop:8 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background:'none', border:'none', color:C.purple, fontSize:12, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
        {open ? '▲ Hide' : '▼ How to perform'}
      </button>
      {open && (
        <div style={{ marginTop:10, padding:'12px 14px', background:C.purpleLight, borderRadius:12 }}>
          <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:6 }}>
            {data.howTo.map((step, i) => (
              <li key={i} style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{step}</li>
            ))}
          </ol>
          {data.tips && (
            <div style={{ marginTop:10, fontSize:11, color:C.purple, fontStyle:'italic', borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              💡 {data.tips}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Library — Sports → Workouts → Detail
// ─────────────────────────────────────────────
function LibraryTab({ onUseAsTemplate }) {
  const [sport,   setSport]   = useState(null) // selected sport id
  const [workout, setWorkout] = useState(null) // selected workout

  // ── Workout detail ────────────────────────
  if (workout) {
    const exercises = workout.exercises.map(name => getExercise(name))
    return (
      <div>
        <BackBtn onBack={() => setWorkout(null)} />
        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg, ${SPORTS.find(s=>s.id===workout.sport)?.color||C.purple}, ${SPORTS.find(s=>s.id===workout.sport)?.color||C.purple}BB)`, borderRadius:20, padding:'22px 20px', marginBottom:20, color:'#fff' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>{workout.icon}</div>
          <div style={{ fontSize:22, fontWeight:700 }}>{workout.name}</div>
          <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>{workout.description}</div>
          <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
            {[
              { label:'Duration', value:workout.duration },
              { label:'Level',    value:workout.level    },
              { label:'Muscles',  value:workout.muscles  },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:13, fontWeight:700 }}>{s.value}</div>
                <div style={{ fontSize:10, opacity:0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise list with how-to */}
        <Label>Exercises ({exercises.length})</Label>
        <Card style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ padding:'14px 16px', borderBottom: i < exercises.length-1 ? `1px solid ${C.divider}` : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {ex.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{ex.muscles}{ex.timed ? ' · Timed' : ' · Sets & Reps'}</div>
                </div>
              </div>
              <ExerciseHowTo ex={ex} />
            </div>
          ))}
        </Card>

        {/* CTAs */}
        <button onClick={() => onUseAsTemplate(workout)}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.purple, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
          ✦ Use as template — add to My Plans
        </button>
        <button onClick={() => onUseAsTemplate({ ...workout, startNow:true })}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.greenLight, border:`1px solid ${C.green}44`, color:C.green, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          ▶ Start this workout now
        </button>
      </div>
    )
  }

  // ── Sport workouts list ───────────────────
  if (sport) {
    const workouts = LIBRARY_WORKOUTS.filter(w => w.sport === sport)
    const s = SPORTS.find(s => s.id === sport)
    return (
      <div>
        <BackBtn onBack={() => setSport(null)} />
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <span style={{ fontSize:32 }}>{s.icon}</span>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{s.name}</div>
        </div>
        {workouts.length === 0 ? (
          <Card style={{ textAlign:'center', padding:'30px 20px', color:C.textMuted }}>
            Coming soon — more workouts being added.
          </Card>
        ) : (
          workouts.map(w => (
            <button key={w.id} onClick={() => setWorkout(w)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', marginBottom:10, boxShadow:C.shadowCard }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{w.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{w.name}</span>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${LEVEL_COLOR[w.level]}22`, color:LEVEL_COLOR[w.level], fontWeight:600 }}>{w.level}</span>
                </div>
                <div style={{ fontSize:12, color:C.textMuted }}>{w.muscles}</div>
                <div style={{ fontSize:11, color:C.purple, marginTop:3 }}>⏱ {w.duration} · {w.exercises.length} exercises</div>
              </div>
              <span style={{ fontSize:20, color:C.textDim }}>›</span>
            </button>
          ))
        )}
      </div>
    )
  }

  // ── Sports grid ───────────────────────────
  return (
    <div>
      <Label>Choose a sport</Label>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {SPORTS.filter(s => s.id !== 'custom').map(s => {
          const count = LIBRARY_WORKOUTS.filter(w => w.sport === s.id).length
          return (
            <button key={s.id} onClick={() => setSport(s.id)}
              style={{ padding:'20px 16px', borderRadius:18, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', boxShadow:C.shadowCard, display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:32 }}>{s.icon}</span>
              <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{s.name}</div>
              <div style={{ fontSize:11, color:C.textMuted }}>{count} workout{count !== 1 ? 's' : ''}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// My Plans — CRUD
// ─────────────────────────────────────────────
function ExercisePickerModal({ onAdd, onClose }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(Object.values(EXERCISES).map(e => e.category))]
  const all = Object.entries(EXERCISES).map(([name, ex]) => ({ name, ...ex }))
  const filtered = search
    ? all.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.toLowerCase().includes(search.toLowerCase()))
    : category === 'All' ? all : all.filter(e => e.category === category)

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.6)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px 12px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.divider, margin:'0 auto 16px' }} />
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:12 }}>Add Exercise</div>
          <div style={{ position:'relative', marginBottom:10 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or muscle..." autoFocus
              style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
          </div>
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:11, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${category===cat?C.purple:C.border}`, background:category===cat?C.purpleLight:'transparent', color:category===cat?C.purple:C.textMuted, fontWeight:category===cat?600:400 }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px 24px' }}>
          {filtered.map((ex, i) => (
            <button key={i} onClick={() => { onAdd(ex); onClose() }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`1px solid ${C.divider}`, background:'none', border:'none', borderBottom:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{ex.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{ex.category} · {ex.muscles}</div>
              </div>
              <span style={{ fontSize:20, color:C.purple }}>+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlanEditor({ plan, onSave, onCancel }) {
  const [name,       setName]       = useState(plan?.name || '')
  const [exercises,  setExercises]  = useState(plan?.exercises || [])
  const [showPicker, setShowPicker] = useState(false)
  const [notes,      setNotes]      = useState(plan?.notes || '')

  const addExercise = (ex) => setExercises(prev => [...prev, { name:ex.name, icon:ex.icon, muscles:ex.muscles, timed:ex.timed||false, sets:3, reps:ex.timed?30:10, notes:'' }])
  const removeEx    = (i)  => setExercises(prev => prev.filter((_,j) => j!==i))
  const updateEx    = (i, field, val) => setExercises(prev => prev.map((e,j) => j===i ? {...e, [field]:val} : e))
  const moveUp      = (i)  => { if(i===0) return; const a=[...exercises]; [a[i-1],a[i]]=[a[i],a[i-1]]; setExercises(a) }
  const moveDown    = (i)  => { if(i===exercises.length-1) return; const a=[...exercises]; [a[i],a[i+1]]=[a[i+1],a[i]]; setExercises(a) }

  return (
    <div>
      <BackBtn onBack={onCancel} />
      <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:20 }}>
        {plan ? 'Edit Plan' : 'New Plan'}
      </div>

      {/* Name */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>Plan name *</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Push Day"
          style={{ width:'100%', padding:'11px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:15, fontWeight:600, outline:'none' }} />
      </div>

      {/* Exercises */}
      <Label>Exercises ({exercises.length})</Label>
      {exercises.map((ex, i) => (
        <div key={i} style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ fontSize:20 }}>{ex.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
              <div style={{ fontSize:11, color:C.textMuted }}>{ex.muscles}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => moveUp(i)}   style={{ padding:'4px 8px', borderRadius:8, background:C.surfaceMid, border:'none', color:C.textMuted, cursor:'pointer', fontSize:12 }}>↑</button>
              <button onClick={() => moveDown(i)} style={{ padding:'4px 8px', borderRadius:8, background:C.surfaceMid, border:'none', color:C.textMuted, cursor:'pointer', fontSize:12 }}>↓</button>
              <button onClick={() => removeEx(i)} style={{ padding:'4px 8px', borderRadius:8, background:C.redLight,   border:'none', color:C.red,      cursor:'pointer', fontSize:12 }}>✕</button>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>Sets</div>
              <input type="number" value={ex.sets} onChange={e => updateEx(i,'sets',e.target.value)}
                style={{ width:'100%', padding:'7px 10px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{ex.timed ? 'Sec' : 'Reps'}</div>
              <input type="number" value={ex.reps} onChange={e => updateEx(i,'reps',e.target.value)}
                style={{ width:'100%', padding:'7px 10px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:2 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>Note</div>
              <input value={ex.notes||''} onChange={e => updateEx(i,'notes',e.target.value)} placeholder="Optional"
                style={{ width:'100%', padding:'7px 10px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none' }} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => setShowPicker(true)}
        style={{ width:'100%', padding:12, borderRadius:14, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:16 }}>
        + Add exercise
      </button>

      {/* Plan notes */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>Plan notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
          style={{ width:'100%', padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', lineHeight:1.5 }} />
      </div>

      <button onClick={() => onSave({ name:name.trim(), exercises, notes:notes.trim() })} disabled={!name.trim() || exercises.length===0}
        style={{ width:'100%', padding:14, borderRadius:16, background:name.trim()&&exercises.length>0?C.purple:C.surfaceMid, border:'none', color:name.trim()&&exercises.length>0?'#fff':C.textDim, fontSize:15, fontWeight:700, cursor:name.trim()&&exercises.length>0?'pointer':'default' }}>
        {plan ? 'Save changes' : 'Create plan'}
      </button>

      {showPicker && <ExercisePickerModal onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

function MyPlansTab({ userId, onStartPlan, preloadPlan, onPreloadConsumed }) {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)  // null | 'new' | plan object
  const consumedRef = useRef(false)

  useEffect(() => { fetchPlans() }, [userId])

  // Auto-open editor when coming from library "Use as template"
  useEffect(() => {
    if (preloadPlan && !consumedRef.current) {
      consumedRef.current = true
      setEditing({ preload: preloadPlan })
      onPreloadConsumed?.()
    }
  }, [preloadPlan])

  const fetchPlans = async () => {
    if (!userId) return
    const { data } = await supabase.from('workout_plans').select('*').eq('user_id', userId).order('created_at', { ascending:false })
    setPlans(data || [])
    setLoading(false)
  }

  const savePlan = async (data) => {
    const planData = editing?.id
      ? { ...data, updated_at: new Date().toISOString() }
      : { user_id: userId, ...data, created_at: new Date().toISOString() }

    if (editing?.id) {
      await supabase.from('workout_plans').update(planData).eq('id', editing.id)
    } else {
      await supabase.from('workout_plans').insert(planData)
    }
    setEditing(null)
    fetchPlans()
  }

  const deletePlan = async (id) => {
    await supabase.from('workout_plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  // ── Plan editor ───────────────────────────
  if (editing) {
    const initialPlan = editing.preload
      ? { name: editing.preload.name, exercises: editing.preload.exercises.map(name => {
          const ex = { name, ...{ icon:'💪', muscles:'', timed:false, ...( Object.values(EXERCISES).find(e=>e.name===name)||{}) } }
          return { name:ex.name, icon:ex.icon, muscles:ex.muscles, timed:ex.timed||false, sets:3, reps:ex.timed?30:10, notes:'' }
        }), notes: '' }
      : editing.id ? editing
      : null

    return (
      <PlanEditor
        plan={initialPlan}
        onSave={savePlan}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <button onClick={() => setEditing('new')}
        style={{ width:'100%', padding:14, borderRadius:16, background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        ✦ Create new plan
      </button>

      {loading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : plans.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>No plans yet</div>
          <div style={{ fontSize:13, color:C.textMuted }}>Create your own or use a library workout as a template.</div>
        </Card>
      ) : (
        plans.map(plan => (
          <div key={plan.id} style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.divider}`, padding:'14px 16px', marginBottom:10, boxShadow:C.shadowCard }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <div style={{ width:44, height:44, borderRadius:13, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📋</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{plan.name}</div>
                <div style={{ fontSize:12, color:C.textMuted }}>{plan.exercises?.length||0} exercises</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => onStartPlan(plan)}
                style={{ flex:2, padding:'10px', borderRadius:12, background:C.green, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                ▶ Start
              </button>
              <button onClick={() => setEditing(plan)}
                style={{ flex:1, padding:'10px', borderRadius:12, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:13, fontWeight:500, cursor:'pointer' }}>
                Edit
              </button>
              <button onClick={() => deletePlan(plan.id)}
                style={{ flex:1, padding:'10px', borderRadius:12, background:C.redLight, border:'none', color:C.red, fontSize:13, fontWeight:500, cursor:'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Set row in active session
// ─────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, timed }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0' }}>
      <div style={{ width:26, height:26, borderRadius:'50%', background:set.done?C.green:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:set.done?'#fff':C.purple, flexShrink:0, cursor:'pointer' }}
        onClick={() => onChange({...set, done:!set.done})}>
        {set.done?'✓':idx+1}
      </div>
      {timed ? (
        <input type="number" value={set.duration||''} onChange={e => onChange({...set,duration:e.target.value})}
          placeholder="sec" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
      ) : (
        <>
          <input type="number" value={set.weight||''} onChange={e => onChange({...set,weight:e.target.value})}
            placeholder="kg" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
          <span style={{ color:C.textDim, fontSize:13 }}>×</span>
          <input type="number" value={set.reps||''} onChange={e => onChange({...set,reps:e.target.value})}
            placeholder="reps" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
        </>
      )}
      <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:16, cursor:'pointer', padding:'0 4px' }}>✕</button>
    </div>
  )
}

function SessionExerciseCard({ ex, onUpdate, onRemove }) {
  const data    = getExercise(ex.name)
  const timed   = data.timed || ex.timed
  const doneSets = ex.sets.filter(s => s.done).length
  const allDone  = doneSets === ex.sets.length && ex.sets.length > 0

  const addSet    = () => { const p=ex.sets[ex.sets.length-1]||{}; onUpdate({...ex, sets:[...ex.sets,{weight:p.weight||'',reps:p.reps||'',duration:p.duration||'',done:false}]}) }
  const updateSet = (i,s) => { const sets=[...ex.sets]; sets[i]=s; onUpdate({...ex,sets}) }
  const removeSet = (i)   => onUpdate({...ex, sets:ex.sets.filter((_,j)=>j!==i)})

  return (
    <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${allDone?C.green+'66':C.divider}`, marginBottom:12, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:allDone?C.greenLight:'transparent' }}>
        <div style={{ width:42, height:42, borderRadius:12, background:allDone?C.greenLight:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{data.icon||'💪'}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{ex.name}</div>
          <div style={{ fontSize:11, color:C.textMuted }}>{data.muscles} · {doneSets}/{ex.sets.length} sets</div>
        </div>
        <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'0 16px 12px' }}>
        <div style={{ display:'flex', gap:8, fontSize:10, color:C.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4, paddingLeft:34 }}>
          {timed ? <span style={{flex:1,textAlign:'center'}}>Duration (sec)</span> : <><span style={{flex:1,textAlign:'center'}}>Weight (kg)</span><span style={{width:16}}/><span style={{flex:1,textAlign:'center'}}>Reps</span></>}
          <span style={{width:24}}/>
        </div>
        {ex.sets.map((set,i) => (
          <SetRow key={i} set={set} idx={i} timed={timed} onChange={s=>updateSet(i,s)} onRemove={()=>removeSet(i)} />
        ))}
        <button onClick={addSet} style={{ width:'100%', padding:'8px', marginTop:8, borderRadius:10, background:C.purpleLight, border:`1px dashed ${C.purple}55`, color:C.purple, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Add set
        </button>
      </div>
      <ExerciseHowTo ex={data} />
      {data.howTo?.length > 0 && <div style={{ height:8 }} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Active session — timer only starts on Begin
// ─────────────────────────────────────────────
function WorkoutSession({ userId, timezone, plan, onSave, onCancel }) {
  // Build initial exercises from plan
  const initExercises = () => (plan?.exercises || []).map(ex => {
    const data = getExercise(typeof ex === 'string' ? ex : ex.name)
    const sets  = parseInt(ex.sets) || 3
    return {
      name: data.name || ex,
      timed: data.timed,
      sets: Array.from({ length: sets }, () => ({
        weight:'', reps: String(ex.reps||10), duration: String(ex.reps||30), done:false
      })),
    }
  })

  const [exercises,  setExercises]  = useState(initExercises)
  const [name,       setName]       = useState(plan?.name || '')
  const [notes,      setNotes]      = useState('')
  const [started,    setStarted]    = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const startRef = useRef(null)

  useEffect(() => {
    if (!started) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [started])

  const beginWorkout = () => { startRef.current = Date.now(); setStarted(true) }
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const addExercise  = ex  => setExercises(prev => [...prev, { name:ex.name, timed:ex.timed||false, sets:[{weight:'',reps:'',duration:'',done:false}] }])
  const updateEx     = (i, ex) => setExercises(prev => prev.map((e,j) => j===i ? ex : e))
  const removeEx     = i   => setExercises(prev => prev.filter((_,j) => j!==i))

  const doneSets = exercises.reduce((s,e) => s+e.sets.filter(s=>s.done).length, 0)
  const totalVol = exercises.reduce((s,e) => s+e.sets.filter(s=>s.done).reduce((sv,set) => sv+(parseFloat(set.weight)||0)*(parseInt(set.reps)||1),0),0)
  const today    = toUserDateStr(timezone)

  const handleSave = async () => {
    setSaving(true)
    const workoutName = name.trim() || exercises.map(e=>e.name).join(', ').slice(0,60) || 'Workout'
    const minutes     = started ? Math.max(1, Math.round(elapsed/60)) : 0
    await supabase.from('workout_logs').insert({
      user_id: userId, log_date: today,
      workout_name: workoutName, workout_type: exercises[0] ? getExercise(exercises[0].name).category : 'General',
      duration_minutes: minutes, calories_burned: Math.round(minutes*6),
      exercises: exercises.map(ex => ({
        name: ex.name, category: getExercise(ex.name).category,
        sets: ex.sets.filter(s=>s.done).map(s=>({ weight:parseFloat(s.weight)||null, reps:parseInt(s.reps)||null, duration:parseInt(s.duration)||null })),
      })),
      notes: notes.trim()||null,
    })
    setSaving(false)
    onSave()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, borderRadius:20, padding:'20px', marginBottom:16, color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, opacity:0.8 }}>{started ? 'Active workout' : 'Ready to start'}</div>
          <div style={{ fontSize:26, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
            {started ? fmt(elapsed) : '00:00'}
          </div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name your workout..."
          style={{ width:'100%', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'10px 14px', color:'#fff', fontSize:15, fontWeight:600, outline:'none', marginBottom: started ? 14 : 0 }} />
        {started && (
          <div style={{ display:'flex', gap:20, fontSize:13 }}>
            <div><span style={{fontWeight:700}}>{exercises.length}</span><span style={{opacity:0.7}}> exercises</span></div>
            <div><span style={{fontWeight:700}}>{doneSets}</span><span style={{opacity:0.7}}> sets done</span></div>
            {totalVol>0 && <div><span style={{fontWeight:700}}>{Math.round(totalVol)}</span><span style={{opacity:0.7}}> kg total</span></div>}
          </div>
        )}
      </div>

      {/* Begin button — only shown before starting */}
      {!started && (
        <button onClick={beginWorkout}
          style={{ width:'100%', padding:16, borderRadius:18, background:C.green, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:16, boxShadow:`0 4px 20px ${C.green}44` }}>
          ▶ Begin workout — start timer
        </button>
      )}

      {/* Exercises */}
      {exercises.map((ex,i) => (
        <SessionExerciseCard key={i} ex={ex} onUpdate={ex=>updateEx(i,ex)} onRemove={()=>removeEx(i)} />
      ))}

      <button onClick={() => setShowPicker(true)}
        style={{ width:'100%', padding:13, borderRadius:16, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:12 }}>
        + Add exercise
      </button>

      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Session notes (optional)..."
        style={{ width:'100%', padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', marginBottom:14, lineHeight:1.5 }} />

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onCancel} style={{ flex:1, padding:12, borderRadius:16, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex:2, padding:12, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:saving?'default':'pointer' }}>
          {saving ? 'Saving…' : started ? `✓ Finish · ${fmt(elapsed)}` : '✓ Log workout (no timer)'}
        </button>
      </div>

      {showPicker && <ExercisePickerModal onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Workout log history card
// ─────────────────────────────────────────────
function WorkoutHistoryCard({ log, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  return (
    <Card style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:C.greenLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💪</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{log.workout_name}</div>
          <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
            {[log.duration_minutes&&`${log.duration_minutes} min`, log.calories_burned&&`${log.calories_burned} kcal`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {log.exercises?.length>0 && (
            <button onClick={() => setExpanded(e=>!e)} style={{ padding:'6px 12px', borderRadius:10, background:C.purpleLight, border:'none', color:C.purple, fontSize:12, cursor:'pointer' }}>
              {expanded ? '▲' : `${log.exercises.length} ex`}
            </button>
          )}
          {!confirm
            ? <button onClick={() => setConfirm(true)} style={{ padding:'6px 10px', borderRadius:10, background:C.redLight, border:'none', color:C.red, fontSize:12, cursor:'pointer' }}>✕</button>
            : <button onClick={() => onDelete(log.id)} style={{ padding:'6px 10px', borderRadius:10, background:C.red, border:'none', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>Delete?</button>
          }
        </div>
      </div>
      {expanded && log.exercises?.length>0 && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.divider}`, paddingTop:12 }}>
          {log.exercises.map((ex,i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, minWidth:140 }}>{ex.name}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>
                {ex.sets?.map((s,j) => <span key={j} style={{ marginRight:8 }}>{s.weight?`${s.weight}kg×${s.reps}`:s.duration?`${s.duration}s`:`×${s.reps}`}</span>)}
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
export default function WorkoutTab({ userId, profile }) {
  const timezone  = profile?.timezone
  const today     = toUserDateStr(timezone)

  const [tab,       setTab]       = useState('library') // library | plans | log
  const [session,   setSession]   = useState(null)      // null | plan object
  const [logs,      setLogs]      = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [preloadPlan, setPreloadPlan] = useState(null)  // from library "use as template"

  useEffect(() => { fetchLogs() }, [userId])

  const fetchLogs = async () => {
    if (!userId) return
    setLogsLoading(true)
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', today).order('created_at', { ascending:false })
    setLogs(data || [])
    setLogsLoading(false)
  }

  const deleteLog = async (id) => {
    await supabase.from('workout_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // Handle "Use as template" from library
  const handleUseAsTemplate = (workout) => {
    if (workout.startNow) {
      // Start directly
      setSession({ name: workout.name, exercises: workout.exercises })
    } else {
      // Open My Plans with pre-filled editor
      setPreloadPlan({ name: workout.name, exercises: workout.exercises })
      setTab('plans')
    }
  }

  // ── Active session ────────────────────────
  if (session) {
    return (
      <WorkoutSession
        userId={userId}
        timezone={timezone}
        plan={session}
        onSave={() => { fetchLogs(); setSession(null) }}
        onCancel={() => setSession(null)}
      />
    )
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:20, background:C.surfaceMid, borderRadius:14, padding:4 }}>
        {[['library','📚 Library'], ['plans','📋 My Plans'], ['log','📅 Today']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'9px 4px', borderRadius:11, fontSize:12, fontWeight:tab===id?700:400, cursor:'pointer', border:'none', background:tab===id?C.surface:'transparent', color:tab===id?C.purple:C.textMuted, boxShadow:tab===id?C.shadowCard:'none', transition:'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Library */}
      {tab === 'library' && (
        <LibraryTab onUseAsTemplate={handleUseAsTemplate} />
      )}

      {/* My Plans */}
      {tab === 'plans' && (
        <MyPlansTab
          userId={userId}
          onStartPlan={plan => setSession(plan)}
          preloadPlan={preloadPlan}
          onPreloadConsumed={() => setPreloadPlan(null)}
        />
      )}

      {/* Today's log */}
      {tab === 'log' && (
        <div>
          <button onClick={() => setSession({ name:'', exercises:[] })}
            style={{ width:'100%', padding:16, borderRadius:20, background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:C.shadowStrong }}>
            🏋️ Start empty workout
          </button>
          {logsLoading ? (
            <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
          ) : logs.length > 0 ? (
            <>
              <Label>Today's workouts</Label>
              {logs.map(log => <WorkoutHistoryCard key={log.id} log={log} onDelete={deleteLog} />)}
            </>
          ) : (
            <Card style={{ textAlign:'center', padding:'32px 20px' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏃</div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>No workouts logged today</div>
              <div style={{ fontSize:13, color:C.textMuted }}>Browse the Library or your Plans to get started</div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
