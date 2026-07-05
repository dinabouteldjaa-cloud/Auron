import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { toUserDateStr } from '../lib/dateUtils.js'

// ─────────────────────────────────────────────
// Exercise library
// ─────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  Chest: [
    { name:'Bench Press',        icon:'🏋️', muscles:'Chest, Triceps, Shoulders' },
    { name:'Incline Bench Press',icon:'🏋️', muscles:'Upper Chest, Shoulders'   },
    { name:'Decline Bench Press',icon:'🏋️', muscles:'Lower Chest'              },
    { name:'Push Ups',           icon:'💪', muscles:'Chest, Triceps'           },
    { name:'Chest Fly',          icon:'🦋', muscles:'Chest'                    },
    { name:'Cable Crossover',    icon:'🦋', muscles:'Chest'                    },
    { name:'Dips',               icon:'💪', muscles:'Chest, Triceps'           },
    { name:'Pec Deck',           icon:'🦋', muscles:'Chest'                    },
  ],
  Back: [
    { name:'Pull Ups',           icon:'💪', muscles:'Lats, Biceps'             },
    { name:'Chin Ups',           icon:'💪', muscles:'Lats, Biceps'             },
    { name:'Deadlift',           icon:'🏋️', muscles:'Full Back, Hamstrings'    },
    { name:'Bent Over Row',      icon:'🏋️', muscles:'Back, Biceps'             },
    { name:'T-Bar Row',          icon:'🏋️', muscles:'Mid Back'                 },
    { name:'Lat Pulldown',       icon:'💪', muscles:'Lats'                     },
    { name:'Seated Cable Row',   icon:'🚣', muscles:'Mid Back'                 },
    { name:'Single Arm Row',     icon:'🏋️', muscles:'Back, Biceps'             },
    { name:'Face Pull',          icon:'💪', muscles:'Rear Delts, Upper Back'   },
    { name:'Hyperextension',     icon:'🏋️', muscles:'Lower Back'               },
  ],
  Legs: [
    { name:'Squat',              icon:'🏋️', muscles:'Quads, Glutes, Hamstrings'},
    { name:'Front Squat',        icon:'🏋️', muscles:'Quads'                   },
    { name:'Romanian Deadlift',  icon:'🏋️', muscles:'Hamstrings, Glutes'       },
    { name:'Leg Press',          icon:'🦵', muscles:'Quads, Glutes'            },
    { name:'Lunges',             icon:'🦵', muscles:'Quads, Glutes'            },
    { name:'Bulgarian Split Squat',icon:'🦵',muscles:'Quads, Glutes'           },
    { name:'Leg Curl',           icon:'🦵', muscles:'Hamstrings'               },
    { name:'Leg Extension',      icon:'🦵', muscles:'Quads'                    },
    { name:'Calf Raises',        icon:'🦵', muscles:'Calves'                   },
    { name:'Hip Thrust',         icon:'🦵', muscles:'Glutes'                   },
    { name:'Step Ups',           icon:'🦵', muscles:'Quads, Glutes'            },
  ],
  Shoulders: [
    { name:'Overhead Press',     icon:'🏋️', muscles:'Shoulders, Triceps'       },
    { name:'Arnold Press',       icon:'🏋️', muscles:'All Delts'                },
    { name:'Lateral Raise',      icon:'💪', muscles:'Side Delts'               },
    { name:'Front Raise',        icon:'💪', muscles:'Front Delts'              },
    { name:'Reverse Fly',        icon:'🦋', muscles:'Rear Delts'               },
    { name:'Shrugs',             icon:'🏋️', muscles:'Traps'                    },
    { name:'Cable Lateral Raise',icon:'💪', muscles:'Side Delts'               },
  ],
  Arms: [
    { name:'Bicep Curl',         icon:'💪', muscles:'Biceps'                   },
    { name:'Hammer Curl',        icon:'💪', muscles:'Biceps, Forearms'         },
    { name:'Preacher Curl',      icon:'💪', muscles:'Biceps'                   },
    { name:'Concentration Curl', icon:'💪', muscles:'Biceps'                   },
    { name:'Tricep Pushdown',    icon:'💪', muscles:'Triceps'                  },
    { name:'Skull Crushers',     icon:'🏋️', muscles:'Triceps'                  },
    { name:'Overhead Tricep Ext',icon:'💪', muscles:'Triceps'                  },
    { name:'Close Grip Bench',   icon:'🏋️', muscles:'Triceps, Chest'           },
    { name:'Wrist Curl',         icon:'💪', muscles:'Forearms'                 },
  ],
  Core: [
    { name:'Plank',              icon:'🧘', muscles:'Core',          timed:true },
    { name:'Side Plank',         icon:'🧘', muscles:'Obliques',      timed:true },
    { name:'Crunches',           icon:'💪', muscles:'Abs'                      },
    { name:'Sit Ups',            icon:'💪', muscles:'Abs'                      },
    { name:'Leg Raises',         icon:'🦵', muscles:'Lower Abs'                },
    { name:'Russian Twist',      icon:'🔄', muscles:'Obliques'                 },
    { name:'Ab Wheel Rollout',   icon:'⚙️', muscles:'Core'                     },
    { name:'Hollow Hold',        icon:'🧘', muscles:'Core',          timed:true },
    { name:'Mountain Climbers',  icon:'🏔️', muscles:'Core, Cardio',  timed:true },
    { name:'Dead Bug',           icon:'🐛', muscles:'Core'                     },
    { name:'Cable Crunch',       icon:'💪', muscles:'Abs'                      },
  ],
  Cardio: [
    { name:'Running',            icon:'🏃', muscles:'Full Body',    timed:true },
    { name:'Cycling',            icon:'🚴', muscles:'Legs, Cardio', timed:true },
    { name:'Jump Rope',          icon:'🪢', muscles:'Full Body',    timed:true },
    { name:'Swimming',           icon:'🏊', muscles:'Full Body',    timed:true },
    { name:'Rowing Machine',     icon:'🚣', muscles:'Full Body',    timed:true },
    { name:'HIIT',               icon:'⚡', muscles:'Full Body',    timed:true },
    { name:'Walking',            icon:'🚶', muscles:'Legs',         timed:true },
    { name:'Elliptical',         icon:'🏃', muscles:'Full Body',    timed:true },
    { name:'Stair Climber',      icon:'🪜', muscles:'Legs, Cardio', timed:true },
    { name:'Battle Ropes',       icon:'🔗', muscles:'Upper Body',   timed:true },
  ],
}

const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(([cat, exs]) =>
  exs.map(ex => ({ ...ex, category: cat }))
)

// ─────────────────────────────────────────────
// Templates with full exercise objects
// ─────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'push', name:'Push Day', icon:'💪', tag:'Chest · Shoulders · Triceps',
    color: T.purple, bgColor: 'rgba(108,92,231,0.08)',
    exerciseNames: ['Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Tricep Pushdown','Chest Fly'],
  },
  {
    id: 'pull', name:'Pull Day', icon:'🔙', tag:'Back · Biceps · Rear Delts',
    color: T.blue, bgColor: 'rgba(74,144,226,0.08)',
    exerciseNames: ['Pull Ups','Bent Over Row','Lat Pulldown','Bicep Curl','Face Pull','Single Arm Row'],
  },
  {
    id: 'legs', name:'Leg Day', icon:'🦵', tag:'Quads · Hamstrings · Glutes',
    color: T.green, bgColor: 'rgba(46,204,113,0.08)',
    exerciseNames: ['Squat','Romanian Deadlift','Leg Press','Lunges','Leg Curl','Calf Raises'],
  },
  {
    id: 'full', name:'Full Body', icon:'🏋️', tag:'All muscle groups',
    color: T.amber, bgColor: 'rgba(245,166,35,0.08)',
    exerciseNames: ['Squat','Bench Press','Bent Over Row','Overhead Press','Deadlift','Plank'],
  },
  {
    id: 'upper', name:'Upper Body', icon:'💪', tag:'Chest · Back · Arms · Shoulders',
    color: '#E040FB', bgColor: 'rgba(224,64,251,0.08)',
    exerciseNames: ['Bench Press','Bent Over Row','Overhead Press','Bicep Curl','Tricep Pushdown','Lateral Raise'],
  },
  {
    id: 'core', name:'Core & Abs', icon:'🧘', tag:'Core · Abs · Obliques',
    color: T.red, bgColor: 'rgba(224,82,82,0.08)',
    exerciseNames: ['Plank','Crunches','Leg Raises','Russian Twist','Ab Wheel Rollout','Side Plank'],
  },
  {
    id: 'cardio', name:'Cardio', icon:'🏃', tag:'Endurance · Fat burn',
    color: '#00BCD4', bgColor: 'rgba(0,188,212,0.08)',
    exerciseNames: ['Running','Jump Rope','Mountain Climbers','Battle Ropes'],
  },
]

function resolveTemplate(tmpl) {
  return tmpl.exerciseNames.map(name => {
    const ex = ALL_EXERCISES.find(e => e.name === name) || { name, icon:'💪', muscles:'', category:'General' }
    return { ...ex, sets: [{ weight:'', reps:'', duration:'', done:false }] }
  })
}

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────
const C = T
function Card({ children, style={} }) {
  return <div style={{ background:C.surface, borderRadius:18, border:`1px solid ${C.divider}`, boxShadow:C.shadowCard, padding:'16px 18px', ...style }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{children}</div>
}

// ─────────────────────────────────────────────
// Template preview screen
// ─────────────────────────────────────────────
function TemplatePreview({ tmpl, onStart, onBack }) {
  const exercises = resolveTemplate(tmpl)
  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', marginBottom:20, padding:0 }}>
        ‹ Back
      </button>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${tmpl.color}, ${tmpl.color}BB)`, borderRadius:20, padding:'24px 20px', marginBottom:20, color:'#fff' }}>
        <div style={{ fontSize:36, marginBottom:8 }}>{tmpl.icon}</div>
        <div style={{ fontSize:22, fontWeight:700 }}>{tmpl.name}</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>{tmpl.tag}</div>
        <div style={{ display:'flex', gap:16, marginTop:16 }}>
          <div><div style={{ fontSize:18, fontWeight:700 }}>{exercises.length}</div><div style={{ fontSize:11, opacity:0.7 }}>exercises</div></div>
          <div><div style={{ fontSize:18, fontWeight:700 }}>~{exercises.length * 8}–{exercises.length * 12}</div><div style={{ fontSize:11, opacity:0.7 }}>minutes</div></div>
        </div>
      </div>

      {/* Exercise list */}
      <Label>Exercises in this workout</Label>
      <Card style={{ marginBottom:20, padding:0, overflow:'hidden' }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < exercises.length - 1 ? `1px solid ${C.divider}` : 'none' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${tmpl.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
              {ex.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
              <div style={{ fontSize:11, color:C.textMuted }}>{ex.muscles} · {ex.timed ? 'Timed' : '3 sets × 8–12 reps'}</div>
            </div>
            <div style={{ fontSize:11, color:C.textDim }}>{ex.category}</div>
          </div>
        ))}
      </Card>

      <button onClick={() => onStart(exercises)}
        style={{ width:'100%', padding:16, borderRadius:20, background:`linear-gradient(135deg, ${tmpl.color}, ${tmpl.color}BB)`, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px ${tmpl.color}44` }}>
        🏋️ Start {tmpl.name}
      </button>
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

  const filtered = search
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.toLowerCase().includes(search.toLowerCase()))
    : category === 'All' ? ALL_EXERCISES : (EXERCISE_LIBRARY[category] || []).map(e => ({ ...e, category }))

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.6)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:C.shadowStrong }}>
        <div style={{ padding:'16px 20px 12px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.divider, margin:'0 auto 16px' }} />
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:12 }}>Add Exercise</div>
          <div style={{ position:'relative', marginBottom:12 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises or muscles..." autoFocus
              style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
          </div>
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${category===cat ? C.purple : C.border}`, background:category===cat ? C.purpleLight : 'transparent', color:category===cat ? C.purple : C.textMuted, fontWeight:category===cat ? 600 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px 24px' }}>
          {search && <div style={{ fontSize:11, color:C.textDim, marginBottom:8 }}>{filtered.length} results</div>}
          {filtered.map((ex, i) => (
            <button key={i} onClick={() => { onAdd(ex); onClose() }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`1px solid ${C.divider}`, background:'none', border:'none', borderBottom:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{ex.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{ex.category} · {ex.muscles}{ex.timed ? ' · Timed' : ''}</div>
              </div>
              <span style={{ fontSize:20, color:C.purple }}>+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SetRow
// ─────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, timed }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0' }}>
      <div style={{ width:26, height:26, borderRadius:'50%', background:set.done ? C.green : C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:set.done ? '#fff' : C.purple, flexShrink:0, cursor:'pointer' }}
        onClick={() => onChange({ ...set, done:!set.done })}>
        {set.done ? '✓' : idx+1}
      </div>
      {timed ? (
        <input type="number" value={set.duration||''} onChange={e => onChange({...set, duration:e.target.value})}
          placeholder="sec" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
      ) : (
        <>
          <input type="number" value={set.weight||''} onChange={e => onChange({...set, weight:e.target.value})}
            placeholder="kg" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
          <span style={{ color:C.textDim, fontSize:13 }}>×</span>
          <input type="number" value={set.reps||''} onChange={e => onChange({...set, reps:e.target.value})}
            placeholder="reps" style={{ flex:1, padding:'8px 10px', borderRadius:10, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none', textAlign:'center' }} />
        </>
      )}
      <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:16, cursor:'pointer', padding:'0 4px' }}>✕</button>
    </div>
  )
}

// ─────────────────────────────────────────────
// ExerciseCard in session
// ─────────────────────────────────────────────
function ExerciseCard({ ex, onUpdate, onRemove }) {
  const timed    = ex.timed
  const doneSets = ex.sets.filter(s => s.done).length
  const allDone  = doneSets === ex.sets.length && ex.sets.length > 0

  const addSet = () => {
    const prev = ex.sets[ex.sets.length - 1] || {}
    onUpdate({ ...ex, sets: [...ex.sets, { weight:prev.weight||'', reps:prev.reps||'', duration:prev.duration||'', done:false }] })
  }
  const updateSet = (i, s) => { const sets=[...ex.sets]; sets[i]=s; onUpdate({...ex, sets}) }
  const removeSet = (i)    => onUpdate({ ...ex, sets: ex.sets.filter((_,j) => j!==i) })

  return (
    <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${allDone ? C.green+'66' : C.divider}`, marginBottom:12, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:allDone ? C.greenLight : 'transparent' }}>
        <div style={{ width:42, height:42, borderRadius:12, background:allDone ? C.greenLight : C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{ex.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{ex.name}</div>
          <div style={{ fontSize:11, color:C.textMuted }}>{ex.muscles} · {doneSets}/{ex.sets.length} sets</div>
        </div>
        <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'0 16px 12px' }}>
        <div style={{ display:'flex', gap:8, fontSize:10, color:C.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4, paddingLeft:34 }}>
          {timed ? <span style={{ flex:1, textAlign:'center' }}>Duration (sec)</span> : <><span style={{ flex:1, textAlign:'center' }}>Weight (kg)</span><span style={{ width:16 }}/><span style={{ flex:1, textAlign:'center' }}>Reps</span></>}
          <span style={{ width:24 }}/>
        </div>
        {ex.sets.map((set, i) => (
          <SetRow key={i} set={set} idx={i} timed={timed} onChange={s => updateSet(i,s)} onRemove={() => removeSet(i)} />
        ))}
        <button onClick={addSet} style={{ width:'100%', padding:'8px', marginTop:8, borderRadius:10, background:C.purpleLight, border:`1px dashed ${C.purple}55`, color:C.purple, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Add set
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Active session
// ─────────────────────────────────────────────
function WorkoutSession({ userId, timezone, selectedDate, initialExercises, onSave, onCancel }) {
  const [name,       setName]       = useState('')
  const [exercises,  setExercises]  = useState(initialExercises || [])
  const [showPicker, setShowPicker] = useState(!initialExercises?.length)
  const [startTime]                 = useState(Date.now())
  const [elapsed,    setElapsed]    = useState(0)
  const [notes,      setNotes]      = useState('')
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startTime])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const addExercise  = ex => setExercises(prev => [...prev, { ...ex, sets:[{ weight:'', reps:'', duration:'', done:false }] }])
  const updateEx     = (i, ex) => setExercises(prev => prev.map((e,j) => j===i ? ex : e))
  const removeEx     = i => setExercises(prev => prev.filter((_,j) => j!==i))

  const doneSets = exercises.reduce((s,e) => s + e.sets.filter(s => s.done).length, 0)
  const totalVol = exercises.reduce((s,e) => s + e.sets.filter(s => s.done).reduce((sv,set) => sv + (parseFloat(set.weight)||0)*(parseInt(set.reps)||1), 0), 0)

  const handleSave = async () => {
    setSaving(true)
    const workoutName = name.trim() || exercises.map(e => e.name).join(', ').slice(0,60) || 'Workout'
    const minutes     = Math.max(1, Math.round(elapsed/60))
    await supabase.from('workout_logs').insert({
      user_id: userId, log_date: selectedDate,
      workout_name: workoutName, workout_type: exercises[0]?.category || 'General',
      duration_minutes: minutes, calories_burned: Math.round(minutes * 6),
      exercises: exercises.map(ex => ({
        name: ex.name, category: ex.category,
        sets: ex.sets.filter(s => s.done).map(s => ({ weight:parseFloat(s.weight)||null, reps:parseInt(s.reps)||null, duration:parseInt(s.duration)||null })),
      })),
      notes: notes.trim() || null,
    })
    setSaving(false)
    onSave()
  }

  return (
    <div>
      {/* Timer header */}
      <div style={{ background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, borderRadius:20, padding:'20px', marginBottom:16, color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, opacity:0.8 }}>Active workout</div>
          <div style={{ fontSize:26, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{fmt(elapsed)}</div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name your workout..."
          style={{ width:'100%', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'10px 14px', color:'#fff', fontSize:15, fontWeight:600, outline:'none' }} />
        {exercises.length > 0 && (
          <div style={{ display:'flex', gap:20, marginTop:14, fontSize:13 }}>
            <div><span style={{ fontWeight:700 }}>{exercises.length}</span><span style={{ opacity:0.7 }}> exercises</span></div>
            <div><span style={{ fontWeight:700 }}>{doneSets}</span><span style={{ opacity:0.7 }}> sets done</span></div>
            {totalVol > 0 && <div><span style={{ fontWeight:700 }}>{Math.round(totalVol)}</span><span style={{ opacity:0.7 }}> kg total</span></div>}
          </div>
        )}
      </div>

      {/* Exercise list */}
      {exercises.map((ex, i) => (
        <ExerciseCard key={i} ex={ex} onUpdate={ex => updateEx(i,ex)} onRemove={() => removeEx(i)} />
      ))}

      {/* Add exercise button */}
      <button onClick={() => setShowPicker(true)}
        style={{ width:'100%', padding:13, borderRadius:16, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:12 }}>
        + Add exercise
      </button>

      {/* Notes */}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)..."
        style={{ width:'100%', padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', marginBottom:14, lineHeight:1.5 }} />

      {/* Actions */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onCancel}
          style={{ flex:1, padding:12, borderRadius:16, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex:2, padding:12, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:saving ? 'default' : 'pointer' }}>
          {saving ? 'Saving…' : `✓ Finish · ${fmt(elapsed)}`}
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
  const [expanded,   setExpanded]   = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <Card style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:C.greenLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💪</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{log.workout_name}</div>
          <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
            {[log.duration_minutes && `${log.duration_minutes} min`, log.calories_burned && `${log.calories_burned} kcal`, log.workout_type].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {log.exercises?.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{ padding:'6px 12px', borderRadius:10, background:C.purpleLight, border:'none', color:C.purple, fontSize:12, cursor:'pointer' }}>
              {expanded ? '▲' : `${log.exercises.length} ex`}
            </button>
          )}
          {!confirming
            ? <button onClick={() => setConfirming(true)} style={{ padding:'6px 10px', borderRadius:10, background:C.redLight, border:'none', color:C.red, fontSize:12, cursor:'pointer' }}>✕</button>
            : <button onClick={() => onDelete(log.id)} style={{ padding:'6px 10px', borderRadius:10, background:C.red, border:'none', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>Delete?</button>
          }
        </div>
      </div>
      {expanded && log.exercises?.length > 0 && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.divider}`, paddingTop:12 }}>
          {log.exercises.map((ex, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, minWidth:140 }}>{ex.name}</div>
              <div style={{ fontSize:12, color:C.textMuted, flexWrap:'wrap' }}>
                {ex.sets?.map((s,j) => (
                  <span key={j} style={{ marginRight:8 }}>
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
export default function WorkoutTab({ userId, profile }) {
  const timezone     = profile?.timezone
  const today        = toUserDateStr(timezone)

  const [view,       setView]        = useState('home') // home | preview | session
  const [logs,       setLogs]        = useState([])
  const [loading,    setLoading]     = useState(true)
  const [previewTmpl,setPreviewTmpl] = useState(null)
  const [sessionExs, setSessionExs]  = useState(null) // null = empty, array = pre-loaded

  useEffect(() => { fetchLogs() }, [userId])

  const fetchLogs = async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('workout_logs').select('*').eq('user_id', userId).eq('log_date', today)
      .order('created_at', { ascending:false })
    setLogs(data || [])
    setLoading(false)
  }

  const deleteLog = async (id) => {
    await supabase.from('workout_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const startEmpty   = () => { setSessionExs(null);     setView('session') }
  const startFromTmpl = (exercises) => { setSessionExs(exercises); setView('session') }
  const previewTmplFn = (tmpl) => { setPreviewTmpl(tmpl); setView('preview') }

  const totalMinutes = logs.reduce((s,l) => s+(l.duration_minutes||0), 0)
  const totalCal     = logs.reduce((s,l) => s+(l.calories_burned||0),  0)

  // ── Template preview ────────────────────────
  if (view === 'preview' && previewTmpl) {
    return (
      <TemplatePreview
        tmpl={previewTmpl}
        onBack={() => setView('home')}
        onStart={(exercises) => startFromTmpl(exercises)}
      />
    )
  }

  // ── Active session ──────────────────────────
  if (view === 'session') {
    return (
      <WorkoutSession
        userId={userId} timezone={timezone} selectedDate={today}
        initialExercises={sessionExs}
        onSave={() => { fetchLogs(); setView('home') }}
        onCancel={() => setView('home')}
      />
    )
  }

  // ── Home ────────────────────────────────────
  return (
    <div>
      {/* Today's summary */}
      {logs.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          {[
            { label:'Workouts', value:logs.length,   color:C.purple },
            { label:'Minutes',  value:totalMinutes,  color:C.green  },
            { label:'Kcal',     value:totalCal,      color:C.amber  },
          ].map(s => (
            <Card key={s.label} style={{ padding:'12px 14px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Start empty workout */}
      <button onClick={startEmpty}
        style={{ width:'100%', padding:16, borderRadius:20, background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:C.shadowStrong }}>
        <span style={{ fontSize:22 }}>🏋️</span> Start empty workout
      </button>

      {/* Templates */}
      <Label>Workout templates</Label>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {TEMPLATES.map(tmpl => (
          <button key={tmpl.id} onClick={() => previewTmplFn(tmpl)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', boxShadow:C.shadowCard }}>
            <div style={{ width:48, height:48, borderRadius:14, background:tmpl.bgColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
              {tmpl.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{tmpl.name}</div>
              <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>{tmpl.tag}</div>
              <div style={{ fontSize:11, color:tmpl.color, marginTop:4, fontWeight:500 }}>{tmpl.exerciseNames.length} exercises</div>
            </div>
            <span style={{ fontSize:20, color:C.textDim }}>›</span>
          </button>
        ))}
      </div>

      {/* Today's logs */}
      {loading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : logs.length > 0 ? (
        <div>
          <Label>Today's workouts</Label>
          {logs.map(log => <WorkoutHistoryCard key={log.id} log={log} onDelete={deleteLog} />)}
        </div>
      ) : (
        <Card style={{ textAlign:'center', padding:'28px 20px' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🏃</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>No workouts yet today</div>
          <div style={{ fontSize:13, color:C.textMuted }}>Pick a template above or start an empty workout</div>
        </Card>
      )}
    </div>
  )
}
