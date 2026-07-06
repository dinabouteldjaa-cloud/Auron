import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { toUserDateStr } from '../lib/dateUtils.js'
import { useTranslation } from '../lib/i18n.jsx'
import { EXERCISES, LIBRARY_WORKOUTS, SPORTS, SPORTS_CATEGORIES, LEVEL_COLOR, getExercise, SPORT_I18N_KEYS } from '../lib/workoutData.js'
import AuronWorkoutBuilder from './AuronWorkoutBuilder.jsx'

const C = T

// ─────────────────────────────────────────────
// Sport & workout name translation helpers
// ─────────────────────────────────────────────
function useSportT() {
  const { t } = useTranslation()
  const tSport    = id  => t(`sport.${id}`,     id)
  const tCat      = key => t(`sport.cat.${key}`, key)
  const tWorkout  = id  => t(`w.${id}`,          id)
  const tLevel    = lvl => {
    const map = { All: t('workout.level.all'), Beginner: t('workout.level.beginner'), Intermediate: t('workout.level.intermediate'), Advanced: t('workout.level.advanced') }
    return map[lvl] || lvl
  }
  // Map category string → i18n key
  const CAT_KEYS = {
    'Gym & Strength':'gym','Cardio & Running':'cardio','Water Sports':'water',
    'Mind & Body':'mind','Combat Sports':'combat','Racquet Sports':'racquet',
    'Team Sports':'team','Outdoor & Adventure':'outdoor','Dance & Performing':'dance',
    'Precision & Skill':'precision','Gymnastics & Acrobatics':'gymnastics','Equestrian':'equestrian',
  }
  const tCatName = name => t(`sport.cat.${CAT_KEYS[name]||name}`, name)
  return { tSport, tCat, tCatName, tWorkout, tLevel }
}
function Card({ children, style={} }) {
  return <div style={{ background:C.surface, borderRadius:18, border:`1px solid ${C.divider}`, boxShadow:C.shadowCard, padding:'16px 18px', ...style }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{children}</div>
}
function BackBtn({ onBack, label }) {
  return (
    <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', marginBottom:20, padding:0 }}>
      ‹ {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// How-to — no conditional return before hook
// ─────────────────────────────────────────────
function ExerciseHowTo({ name }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const data = getExercise(name)
  // Always render container but hide toggle if no data
  if (!data.howTo?.length) return null
  return (
    <div style={{ marginTop:8, paddingLeft:0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background:'none', border:'none', color:C.purple, fontSize:12, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
        {open ? t('workout.hideHowTo') : t('workout.howTo')}
      </button>
      {open && (
        <div style={{ marginTop:8, padding:'12px 14px', background:C.purpleLight, borderRadius:12 }}>
          <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:5 }}>
            {data.howTo.map((step, i) => (
              <li key={i} style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{step}</li>
            ))}
          </ol>
          {data.tips && (
            <div style={{ marginTop:8, fontSize:11, color:C.purple, fontStyle:'italic', borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              💡 {data.tips}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Library tab — Sports → Workouts → Detail
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Library tab — Sports → Workouts → Detail
// ─────────────────────────────────────────────
function LibraryTab({ onUseAsTemplate }) {
  const { t } = useTranslation()
  const { tSport, tCatName, tWorkout, tLevel } = useSportT()
  const [sport,   setSport]   = useState(null)
  const [workout, setWorkout] = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')

  const tFilterLabel = f => ({ All: t('workout.level.all'), Beginner: t('workout.level.beginner'), Intermediate: t('workout.level.intermediate'), Advanced: t('workout.level.advanced') })[f] || f

  // ── Workout detail ────────────────────────
  if (workout) {
    const exercises = workout.exercises.map(name => getExercise(name))
    const sport_obj = SPORTS.find(s => s.id === workout.sport) || {}
    return (
      <div>
        <BackBtn onBack={() => setWorkout(null)} />
        <div style={{ background:`linear-gradient(135deg, ${sport_obj.color||C.purple}, ${sport_obj.color||C.purple}BB)`, borderRadius:20, padding:'22px 20px', marginBottom:20, color:'#fff' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>{workout.icon}</div>
          <div style={{ fontSize:22, fontWeight:700 }}>{tWorkout(workout.id)}</div>
          <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>{workout.description}</div>
          <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
            {[[t('workout.duration2'), workout.duration], [t('workout.level'), tLevel(workout.level)], [t('workout.muscles'), workout.muscles]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:13, fontWeight:700 }}>{v}</div><div style={{ fontSize:10, opacity:0.7 }}>{l}</div></div>
            ))}
          </div>
        </div>

        <Label>{t('workout.exercises')} ({exercises.length})</Label>
        <Card style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ padding:'14px 16px', borderBottom: i < exercises.length-1 ? `1px solid ${C.divider}` : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{ex.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{ex.muscles}{ex.timed ? ' · Timed' : ' · Sets & Reps'}</div>
                </div>
              </div>
              <ExerciseHowTo name={ex.name} />
            </div>
          ))}
        </Card>

        <button onClick={() => onUseAsTemplate({ ...workout, startNow:true })}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
          {t('workout.startWorkoutNow')}
        </button>
        <button onClick={() => onUseAsTemplate({ ...workout, startNow:false })}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.purpleLight, border:`1px solid ${C.purple}44`, color:C.purple, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          {t('workout.saveAsTemplate')}
        </button>
      </div>
    )
  }

  // ── Sport workouts list ───────────────────
  if (sport) {
    const s        = SPORTS.find(s => s.id === sport) || {}
    const LEVELS   = ['All','Beginner','Intermediate','Advanced']
    const workouts = LIBRARY_WORKOUTS.filter(w => w.sport === sport && (filter === 'All' || w.level === filter))
    return (
      <div>
        <BackBtn onBack={() => setSport(null)} />
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <span style={{ fontSize:32 }}>{s.icon}</span>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{tSport(sport)}</div>
        </div>
        {/* Level filter */}
        <div style={{ display:'flex', gap:6, marginBottom:16 }}>
          {LEVELS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1px solid ${filter===f?C.purple:C.border}`, background:filter===f?C.purpleLight:'transparent', color:filter===f?C.purple:C.textMuted, fontWeight:filter===f?600:400 }}>
              {tFilterLabel(f)}
            </button>
          ))}
        </div>
        {workouts.length === 0 ? (
          <Card style={{ textAlign:'center', padding:'24px', color:C.textMuted }}>{t('workout.comingSoon')}</Card>
        ) : workouts.map(w => (
          <button key={w.id} onClick={() => setWorkout(w)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', marginBottom:10, boxShadow:C.shadowCard }}>
            <div style={{ width:50, height:50, borderRadius:14, background:`${s.color||C.purple}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{w.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{tWorkout(w.id)}</span>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${LEVEL_COLOR[w.level]||C.purple}22`, color:LEVEL_COLOR[w.level]||C.purple, fontWeight:600 }}>{tLevel(w.level)}</span>
              </div>
              <div style={{ fontSize:12, color:C.textMuted }}>{w.muscles}</div>
              <div style={{ fontSize:11, color:C.purple, marginTop:3 }}>⏱ {w.duration} · {w.exercises.length} {t('workout.exercises')}</div>
            </div>
            <span style={{ fontSize:20, color:C.textDim }}>›</span>
          </button>
        ))}
      </div>
    )
  }

  // ── Sports grid with search ───────────────
  const LEVELS = ['All','Beginner','Intermediate','Advanced']
  const allWorkouts = LIBRARY_WORKOUTS.filter(w =>
    (filter === 'All' || w.level === filter) &&
    (search === '' || w.name.toLowerCase().includes(search.toLowerCase()) || w.muscles.toLowerCase().includes(search.toLowerCase()))
  )
  const showSearch = search.length > 0

  return (
    <div>
      {/* Search + filter */}
      <div style={{ position:'relative', marginBottom:12 }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('workout.searchPlaceholder')}
          style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto' }}>
        {LEVELS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${filter===f?C.purple:C.border}`, background:filter===f?C.purpleLight:'transparent', color:filter===f?C.purple:C.textMuted, fontWeight:filter===f?600:400 }}>
            {tFilterLabel(f)}
          </button>
        ))}
      </div>

      {/* Search results */}
      {showSearch ? (
        <div>
          <Label>{allWorkouts.length} {t('workout.results','results')}</Label>
          {allWorkouts.map(w => {
            const s = SPORTS.find(s => s.id === w.sport) || {}
            return (
              <button key={w.id} onClick={() => setWorkout(w)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', marginBottom:10, boxShadow:C.shadowCard }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${s.color||C.purple}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{w.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{tWorkout(w.id)}</span>
                    <span style={{ fontSize:10, padding:'2px 6px', borderRadius:20, background:`${LEVEL_COLOR[w.level]||C.purple}22`, color:LEVEL_COLOR[w.level]||C.purple, fontWeight:600 }}>{tLevel(w.level)}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{tSport(w.sport)} · {w.muscles}</div>
                  <div style={{ fontSize:11, color:C.purple }}>⏱ {w.duration} · {w.exercises.length} {t('workout.exercises')}</div>
                </div>
                <span style={{ fontSize:20, color:C.textDim }}>›</span>
              </button>
            )
          })}
          {allWorkouts.length === 0 && <Card style={{ textAlign:'center', padding:24, color:C.textMuted }}>{t('workout.noResults','')} "{search}"</Card>}
        </div>
      ) : (
      /* Sports categorized grid */
        <div>
          {SPORTS_CATEGORIES.map(cat => (
            <div key={cat.category} style={{ marginBottom:24 }}>
              <Label>{tCatName(cat.category)}</Label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {cat.sports.map(s => {
                  const count = LIBRARY_WORKOUTS.filter(w => w.sport === s.id && (filter==='All'||w.level===filter)).length
                  return (
                    <button key={s.id} onClick={() => setSport(s.id)}
                      style={{ padding:'14px 12px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', boxShadow:C.shadowCard, display:'flex', flexDirection:'column', gap:5 }}>
                      <span style={{ fontSize:26 }}>{s.icon}</span>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, lineHeight:1.2 }}>{tSport(s.id)}</div>
                      <div style={{ fontSize:10, color:count>0?C.purple:C.textDim }}>
                        {count>0 ? `${count} ${count===1?t('workout.workout1','workout'):t('workout.workouts','workouts')}` : t('workout.comingSoon')}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Exercise picker modal
// ─────────────────────────────────────────────
function ExercisePickerModal({ onAdd, onClose }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const all        = Object.entries(EXERCISES).map(([name, ex]) => ({ name, ...ex }))
  const categories = [t('workout.level.all'), ...new Set(all.map(e => e.category))]
  const filtered   = search
    ? all.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscles||'').toLowerCase().includes(search.toLowerCase()))
    : category === t('workout.level.all') ? all : all.filter(e => e.category === category)

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.6)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px 12px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.divider, margin:'0 auto 16px' }} />
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:12 }}>Add Exercise</div>
          <div style={{ position:'relative', marginBottom:10 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="{t('workout.searchExPlaceholder')}" autoFocus
              style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
          </div>
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'6px 12px', borderRadius:20, fontSize:11, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${category===cat?C.purple:C.border}`, background:category===cat?C.purpleLight:'transparent', color:category===cat?C.purple:C.textMuted, fontWeight:category===cat?600:400 }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px 24px' }}>
          {filtered.map((ex, i) => (
            <button key={i} onClick={() => { onAdd(ex); onClose() }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 0', background:'none', border:'none', borderBottom:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left' }}>
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

// ─────────────────────────────────────────────
// Plan editor (My Plans)
// ─────────────────────────────────────────────
const DAYS = [
  { key:'mon', label:'Mon' },
  { key:'tue', label:'Tue' },
  { key:'wed', label:'Wed' },
  { key:'thu', label:'Thu' },
  { key:'fri', label:'Fri' },
  { key:'sat', label:'Sat' },
  { key:'sun', label:'Sun' },
]

function PlanEditor({ plan, onSave, onCancel }) {
  const { t } = useTranslation()
  const [name,       setName]       = useState(plan?.name || '')
  const [exercises,  setExercises]  = useState(
    (plan?.exercises || []).map(ex => ({
      name: ex.name || ex,
      icon: ex.icon || getExercise(ex.name||ex).icon || '💪',
      muscles: ex.muscles || getExercise(ex.name||ex).muscles || '',
      timed: ex.timed || getExercise(ex.name||ex).timed || false,
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      notes: ex.notes || '',
    }))
  )
  const [showPicker, setShowPicker] = useState(false)
  const [notes,      setNotes]      = useState(plan?.notes || '')

  // Schedule
  const initSched = plan?.schedule || null
  const [schedEnabled, setSchedEnabled] = useState(!!initSched)
  const [schedDays,    setSchedDays]    = useState(initSched?.days || [])
  const [schedTime,    setSchedTime]    = useState(initSched?.time || '08:00')

  const toggleDay = day => setSchedDays(prev =>
    prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
  )

  const addEx    = ex  => setExercises(prev => [...prev, { name:ex.name, icon:ex.icon||'💪', muscles:ex.muscles||'', timed:ex.timed||false, sets:3, reps:ex.timed?30:10, notes:'' }])
  const removeEx = i   => setExercises(prev => prev.filter((_,j)=>j!==i))
  const updateEx = (i,f,v) => setExercises(prev => prev.map((e,j)=>j===i?{...e,[f]:v}:e))
  const moveUp   = i   => { if(i===0)return; const a=[...exercises]; [a[i-1],a[i]]=[a[i],a[i-1]]; setExercises(a) }
  const moveDown = i   => { if(i===exercises.length-1)return; const a=[...exercises]; [a[i],a[i+1]]=[a[i+1],a[i]]; setExercises(a) }

  const canSave  = name.trim() && exercises.length > 0

  const handleSave = () => {
    const schedule = schedEnabled && schedDays.length > 0
      ? { days: schedDays, time: schedTime, active: true }
      : null
    onSave({ name: name.trim(), exercises, notes: notes.trim(), schedule })
  }

  return (
    <div>
      <BackBtn onBack={onCancel} />
      <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:20 }}>
        {plan?.id ? t('workout.editPlan') : t('workout.newPlan')}
      </div>

      {/* Name */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>{t('workout.planName')}</div>
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
              <button onClick={() => removeEx(i)} style={{ padding:'4px 8px', borderRadius:8, background:C.redLight, border:'none', color:C.red, cursor:'pointer', fontSize:12 }}>✕</button>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>Sets</div>
              <input type="number" value={ex.sets} onChange={e=>updateEx(i,'sets',e.target.value)}
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{ex.timed?'Sec':'Reps'}</div>
              <input type="number" value={ex.reps} onChange={e=>updateEx(i,'reps',e.target.value)}
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:2 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>Note</div>
              <input value={ex.notes||''} onChange={e=>updateEx(i,'notes',e.target.value)} placeholder="Optional"
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:12, outline:'none' }} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => setShowPicker(true)}
        style={{ width:'100%', padding:12, borderRadius:14, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:16 }}>
        + Add exercise
      </button>

      {/* Notes */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>{t('workout.planNotes')}</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder={t('workout.optional')}
          style={{ width:'100%', padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', lineHeight:1.5 }} />
      </div>

      {/* Schedule section */}
      <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.divider}`, padding:'16px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: schedEnabled ? 16 : 0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{t('workout.scheduleTitle')}</div>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
              {schedEnabled ? t('workout.scheduleEnabled') : t('workout.scheduleDisabled')}
            </div>
          </div>
          {/* Toggle */}
          <div onClick={() => setSchedEnabled(e => !e)}
            style={{ width:48, height:28, borderRadius:14, background:schedEnabled?C.purple:C.border, cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: schedEnabled?23:3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        {schedEnabled && (
          <>
            {/* Day picker */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, marginBottom:8 }}>Days</div>
              <div style={{ display:'flex', gap:6 }}>
                {DAYS.map(d => {
                  const active = schedDays.includes(d.key)
                  return (
                    <button key={d.key} onClick={() => toggleDay(d.key)}
                      style={{ flex:1, padding:'9px 0', borderRadius:10, border:`1px solid ${active?C.purple:C.border}`, background:active?C.purple:'transparent', color:active?'#fff':C.textMuted, fontSize:11, fontWeight:active?700:400, cursor:'pointer', transition:'all 0.15s' }}>
                      {d.label}
                    </button>
                  )
                })}
              </div>
              {schedDays.length === 0 && (
                <div style={{ fontSize:11, color:C.red, marginTop:6 }}>{t('workout.selectAtLeastOne')}</div>
              )}
            </div>

            {/* Time picker */}
            <div>
              <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, marginBottom:8 }}>{t('workout.scheduleTime')}</div>
              <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                style={{ padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:15, fontWeight:600, outline:'none', cursor:'pointer' }} />
              <div style={{ fontSize:11, color:C.textDim, marginTop:6 }}>{t('workout.scheduleTimeHint')}</div>
            </div>
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={!canSave}
        style={{ width:'100%', padding:14, borderRadius:16, background:canSave?C.purple:C.surfaceMid, border:'none', color:canSave?'#fff':C.textDim, fontSize:15, fontWeight:700, cursor:canSave?'pointer':'default' }}>
        {plan?.id ? t('workout.saveChanges') : t('workout.createPlan2')}
      </button>

      {showPicker && <ExercisePickerModal onAdd={addEx} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// My Plans tab
// ─────────────────────────────────────────────
function MyPlansTab({ userId, onStartPlan, preloadPlan, onPreloadConsumed, onBuildWithAuron }) {
  const { t } = useTranslation()
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const consumedRef = useRef(false)

  useEffect(() => { fetchPlans() }, [userId])
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
    if (editing?.id) {
      await supabase.from('workout_plans').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('workout_plans').insert({ user_id: userId, ...data, created_at: new Date().toISOString() })
    }
    setEditing(null)
    fetchPlans()
  }

  const deletePlan = async (id) => {
    await supabase.from('workout_plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (editing) {
    const initPlan = editing.preload
      ? { name: editing.preload.name, exercises: editing.preload.exercises.map(name => {
          const ex = getExercise(name)
          return { name, icon:ex.icon||'💪', muscles:ex.muscles||'', timed:ex.timed||false, sets:3, reps:ex.timed?30:10, notes:'' }
        }), notes:'' }
      : editing.id ? editing : null
    return <PlanEditor plan={initPlan} onSave={savePlan} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <button onClick={() => setEditing('new')}
        style={{ width:'100%', padding:14, borderRadius:16, background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        {t('workout.createPlan')}
      </button>
      <button onClick={onBuildWithAuron}
        style={{ width:'100%', padding:14, borderRadius:16, background:C.surface, border:`2px solid ${C.purple}`, color:C.purple, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:C.shadowCard }}>
        {t('workout.buildWithAuron')}
      </button>
      {loading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : plans.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>No plans yet</div>
          <div style={{ fontSize:13, color:C.textMuted }}>Create from scratch or save a Library workout as a plan.</div>
        </Card>
      ) : plans.map(plan => (
        <div key={plan.id} style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.divider}`, padding:'14px 16px', marginBottom:10, boxShadow:C.shadowCard }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📋</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{plan.name}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{plan.exercises?.length||0} exercises</div>
              {plan.schedule?.days?.length > 0 && (
                <div style={{ fontSize:11, color:C.purple, marginTop:3, display:'flex', alignItems:'center', gap:4 }}>
                  <span>📅</span>
                  <span>{plan.schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(' · ')}</span>
                  {plan.schedule.time && <span>at {plan.schedule.time}</span>}
                </div>
              )}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onStartPlan(plan)} style={{ flex:2, padding:'10px', borderRadius:12, background:C.green, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>▶ Start</button>
            <button onClick={() => setEditing(plan)} style={{ flex:1, padding:'10px', borderRadius:12, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:13, cursor:'pointer' }}>Edit</button>
            <button onClick={() => deletePlan(plan.id)} style={{ flex:1, padding:'10px', borderRadius:12, background:C.redLight, border:'none', color:C.red, fontSize:13, cursor:'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Rest Timer — fullscreen overlay
// ─────────────────────────────────────────────
function RestTimer({ duration, onDone }) {
  const [remaining, setRemaining] = useState(duration)
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => {
      if (r <= 1) { clearInterval(id); onDone?.(); return 0 }
      return r - 1
    }), 1000)
    return () => clearInterval(id)
  }, [])
  const pct = (remaining / duration) * 100
  const r = 54
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(26,20,50,0.92)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
      <div style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.7)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Rest</div>
      <div style={{ position:'relative', width:160, height:160 }}>
        <svg viewBox="0 0 120 120" style={{ width:160, height:160, transform:'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={C.purple} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:52, fontWeight:700, color:'#fff', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{remaining}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:4 }}>seconds</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={() => setRemaining(r => Math.max(0, r - 15))}
          style={{ padding:'10px 20px', borderRadius:20, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', fontSize:14, cursor:'pointer' }}>-15s</button>
        <button onClick={onDone}
          style={{ padding:'10px 32px', borderRadius:20, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>Skip rest</button>
        <button onClick={() => setRemaining(r => r + 15)}
          style={{ padding:'10px 20px', borderRadius:20, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', fontSize:14, cursor:'pointer' }}>+15s</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Number input sheet — slides up from bottom
// ─────────────────────────────────────────────
function NumberSheet({ label, value, onConfirm, onClose }) {
  const { t } = useTranslation()
  const [val, setVal] = useState(String(value || ''))
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:C.surface, borderRadius:'24px 24px 0 0', padding:'20px 24px 40px', width:'100%', maxWidth:420 }}>
        <div style={{ width:40, height:4, borderRadius:2, background:C.divider, margin:'0 auto 20px' }} />
        <div style={{ fontSize:13, color:C.textMuted, textAlign:'center', marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:24 }}>
          <button onClick={() => setVal(v => String(Math.max(0, (parseFloat(v)||0) - 1)))}
            style={{ width:44, height:44, borderRadius:'50%', background:C.surfaceMid, border:'none', fontSize:22, color:C.purple, cursor:'pointer', fontWeight:700 }}>−</button>
          <div style={{ fontSize:48, fontWeight:800, color:C.text, minWidth:120, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>
            {val || '0'}
          </div>
          <button onClick={() => setVal(v => String((parseFloat(v)||0) + 1))}
            style={{ width:44, height:44, borderRadius:'50%', background:C.surfaceMid, border:'none', fontSize:22, color:C.purple, cursor:'pointer', fontWeight:700 }}>+</button>
        </div>
        {/* Quick values */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20 }}>
          {(label.includes('kg') ? [20,40,60,80,100] : label.includes('sec') ? [20,30,45,60,90] : [6,8,10,12,15]).map(n => (
            <button key={n} onClick={() => setVal(String(n))}
              style={{ padding:'6px 12px', borderRadius:20, background:String(val)===String(n)?C.purpleLight:C.surfaceMid, border:`1px solid ${String(val)===String(n)?C.purple:C.border}`, color:String(val)===String(n)?C.purple:C.textMuted, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {n}
            </button>
          ))}
        </div>
        <button onClick={() => { onConfirm(val); onClose() }}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.purple, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>
          Confirm
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SetRow — clean row, tap weight/reps to edit
// ─────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, timed, onDone }) {
  const [sheet, setSheet] = useState(null) // null | 'weight' | 'reps' | 'duration'

  const markDone = () => {
    const newDone = !set.done
    onChange({ ...set, done: newDone })
    if (newDone) onDone?.()
  }

  const bgRow = set.done
    ? 'rgba(46,204,113,0.06)'
    : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:0, background:bgRow, borderRadius:10, marginBottom:2 }}>
        {/* Set badge */}
        <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'center', paddingLeft:4 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:set.done?C.green:C.surfaceMid, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:set.done?'#fff':C.textMuted }}>
            {set.done ? '✓' : idx+1}
          </div>
        </div>

        {timed ? (
          <button onClick={() => setSheet('duration')}
            style={{ flex:1, padding:'12px 8px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.duration?C.text:C.textDim }}>
              {set.duration || '—'}
            </span>
            <span style={{ fontSize:12, color:C.textMuted }}> s</span>
          </button>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center' }}>
            <button onClick={() => setSheet('weight')}
              style={{ flex:1, padding:'12px 6px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.weight?C.text:C.textDim }}>
                {set.weight || '—'}
              </span>
              <span style={{ fontSize:12, color:C.textMuted }}> kg</span>
            </button>
            <span style={{ color:C.border, fontSize:18, fontWeight:300 }}>×</span>
            <button onClick={() => setSheet('reps')}
              style={{ flex:1, padding:'12px 6px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.reps?C.text:C.textDim }}>
                {set.reps || '—'}
              </span>
              <span style={{ fontSize:12, color:C.textMuted }}> reps</span>
            </button>
          </div>
        )}

        {/* Done button */}
        <button onClick={markDone}
          style={{ width:44, height:44, borderRadius:12, background:set.done?C.green:C.purpleLight, border:'none', color:set.done?'#fff':C.purple, fontSize:set.done?16:13, fontWeight:700, cursor:'pointer', flexShrink:0, margin:'4px 4px 4px 0' }}>
          {set.done ? '✓' : '→'}
        </button>
      </div>

      {sheet === 'weight'   && <NumberSheet label="Weight (kg)"    value={set.weight}   onConfirm={v => onChange({...set, weight:v})}   onClose={() => setSheet(null)} />}
      {sheet === 'reps'     && <NumberSheet label="Reps"           value={set.reps}     onConfirm={v => onChange({...set, reps:v})}     onClose={() => setSheet(null)} />}
      {sheet === 'duration' && <NumberSheet label="Duration (sec)" value={set.duration} onConfirm={v => onChange({...set, duration:v})} onClose={() => setSheet(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────
// Session exercise card — premium look
// ─────────────────────────────────────────────
function SessionExCard({ ex, onUpdate, onRemove, restDuration }) {
  const data     = getExercise(ex.name)
  const timed    = data.timed || ex.timed
  const [showRest, setShowRest] = useState(false)

  const doneSets = ex.sets.filter(s => s.done).length
  const allDone  = ex.sets.length > 0 && doneSets === ex.sets.length

  const addSet = () => {
    const p = ex.sets[ex.sets.length - 1] || {}
    onUpdate({ ...ex, sets: [...ex.sets, { weight:p.weight||'', reps:p.reps||'', duration:p.duration||'', done:false }] })
  }
  const updateSet = (i, s) => {
    const sets = [...ex.sets]; sets[i] = s; onUpdate({ ...ex, sets })
  }
  const removeSet = i => onUpdate({ ...ex, sets: ex.sets.filter((_,j) => j!==i) })

  return (
    <>
      {showRest && <RestTimer duration={restDuration} onDone={() => setShowRest(false)} />}

      <div style={{ background:C.surface, borderRadius:20, border:`1px solid ${allDone?C.green+'55':C.divider}`, marginBottom:16, overflow:'hidden', boxShadow:allDone?`0 0 0 2px ${C.green}22`:C.shadowCard }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px 10px', borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ width:42, height:42, borderRadius:12, background:allDone?`${C.green}18`:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {data.icon || '💪'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{ex.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
              <span style={{ fontSize:11, color:C.textMuted }}>{data.muscles}</span>
              <span style={{ fontSize:11, color:allDone?C.green:doneSets>0?C.amber:C.textDim }}>· {doneSets}/{ex.sets.length} done</span>
            </div>
          </div>
          <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:18, cursor:'pointer', padding:'4px' }}>✕</button>
        </div>

        {/* Column headers */}
        <div style={{ display:'flex', alignItems:'center', padding:'6px 4px 2px', borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ width:44, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>SET</div>
          {timed ? (
            <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>DURATION</div>
          ) : (
            <>
              <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>KG</div>
              <div style={{ width:16 }} />
              <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>REPS</div>
            </>
          )}
          <div style={{ width:52 }} />
        </div>

        {/* Sets */}
        <div style={{ padding:'4px 8px 8px' }}>
          {ex.sets.map((set, i) => (
            <SetRow key={i} set={set} idx={i} timed={timed}
              onChange={s => updateSet(i, s)}
              onRemove={() => removeSet(i)}
              onDone={() => restDuration > 0 && setShowRest(true)}
            />
          ))}
          <button onClick={addSet}
            style={{ width:'100%', padding:'9px', marginTop:6, borderRadius:10, background:C.surfaceMid, border:`1px dashed ${C.border}`, color:C.textMuted, fontSize:13, fontWeight:500, cursor:'pointer' }}>
            {t('workout.addSet')}
          </button>
        </div>

        {/* How to */}
        <div style={{ padding:'0 16px 4px', borderTop:`1px solid ${C.divider}` }}>
          <ExerciseHowTo name={ex.name} />
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// Fullscreen exercise view
// ─────────────────────────────────────────────
function FullscreenExercise({ exercise, setIdx, totalSets, elapsed, paused, onTogglePause, onSetDone, onPrev, onNext, onFinish, restSecs, saving, fmt, isLast }) {
  const { t } = useTranslation()
  const data      = getExercise(exercise.name)
  const timed     = data.timed || exercise.timed
  const set       = exercise.sets[setIdx]
  const [showHow, setShowHow] = useState(false)
  const [sheet,   setSheet]   = useState(null)
  const [showRest,setShowRest]= useState(false)
  const [weight,  setWeight]  = useState(set?.weight || '')
  const [reps,    setReps]    = useState(set?.reps   || '')
  const [dur,     setDur]     = useState(set?.duration || '')

  // Sync local state when set changes
  useEffect(() => {
    setWeight(set?.weight || '')
    setReps(set?.reps || '')
    setDur(set?.duration || '')
    setShowHow(false)
    setShowRest(false)
  }, [setIdx, exercise.name])

  const handleDone = () => {
    onSetDone({ weight, reps, duration: dur })
    if (restSecs > 0 && !(isLast && setIdx === totalSets - 1)) setShowRest(true)
    else if (!isLast || setIdx < totalSets - 1) {}
  }

  const doneCount = exercise.sets.filter(s => s.done).length

  return (
    <div style={{ position:'fixed', inset:0, background:C.pageBg||'#F0EFF8', zIndex:200, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', overflow:'hidden' }}>
      {showRest && (
        <RestTimer duration={restSecs} onDone={() => { setShowRest(false); onNext?.() }} />
      )}
      {sheet && (
        <NumberSheet
          label={sheet==='weight'?'Weight (kg)':sheet==='reps'?'Reps':'Duration (sec)'}
          value={sheet==='weight'?weight:sheet==='reps'?reps:dur}
          onConfirm={v => { if(sheet==='weight') setWeight(v); else if(sheet==='reps') setReps(v); else setDur(v) }}
          onClose={() => setSheet(null)}
        />
      )}

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 8px', flexShrink:0 }}>
        <button onClick={onFinish} style={{ background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
          ✕ End
        </button>
        <div style={{ fontSize:15, fontWeight:700, color:C.purple, fontVariantNumeric:'tabular-nums' }}>{fmt(elapsed)}</div>
        <button onClick={onTogglePause} style={{ background:C.purpleLight, border:'none', borderRadius:10, padding:'6px 14px', color:C.purple, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {paused ? t('workout.resume') : t('workout.pause')}
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display:'flex', gap:6, padding:'0 20px 12px', flexShrink:0, overflowX:'auto' }}>
        {exercise.sets.map((s, i) => (
          <div key={i} style={{ width: i===setIdx?24:8, height:8, borderRadius:4, background:s.done?C.green:i===setIdx?C.purple:C.border, transition:'all 0.2s', flexShrink:0 }} />
        ))}
      </div>

      {/* Main content — scrollable */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
        {/* Exercise name + icon */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>{data.icon||'💪'}</div>
          <div style={{ fontSize:26, fontWeight:800, color:C.text, lineHeight:1.2, marginBottom:6 }}>{exercise.name}</div>
          <div style={{ fontSize:13, color:C.textMuted }}>{data.muscles}</div>
          <div style={{ fontSize:13, color:C.purple, fontWeight:600, marginTop:4 }}>
            Set {setIdx+1} of {totalSets} · {doneCount} done
          </div>
        </div>

        {/* Weight & Reps — big tap targets */}
        {timed ? (
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:13, color:C.textMuted, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Duration</div>
            <button onClick={() => setSheet('duration')}
              style={{ background:C.surface, border:`2px solid ${C.purple}`, borderRadius:20, padding:'20px 40px', cursor:'pointer', boxShadow:C.shadowCard }}>
              <span style={{ fontSize:52, fontWeight:800, color:dur?C.purple:C.textDim, fontVariantNumeric:'tabular-nums' }}>{dur||'—'}</span>
              <span style={{ fontSize:20, color:C.textMuted, marginLeft:6 }}>sec</span>
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:16, justifyContent:'center', alignItems:'center', marginBottom:32 }}>
            {/* Weight */}
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Weight</div>
              <button onClick={() => setSheet('weight')}
                style={{ width:'100%', background:C.surface, border:`2px solid ${weight?C.purple:C.border}`, borderRadius:18, padding:'18px 12px', cursor:'pointer', boxShadow:C.shadowCard }}>
                <div style={{ fontSize:40, fontWeight:800, color:weight?C.purple:C.textDim, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{weight||'—'}</div>
                <div style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>kg</div>
              </button>
            </div>

            <div style={{ fontSize:28, color:C.border, fontWeight:300, flexShrink:0, marginTop:8 }}>×</div>

            {/* Reps */}
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Reps</div>
              <button onClick={() => setSheet('reps')}
                style={{ width:'100%', background:C.surface, border:`2px solid ${reps?C.purple:C.border}`, borderRadius:18, padding:'18px 12px', cursor:'pointer', boxShadow:C.shadowCard }}>
                <div style={{ fontSize:40, fontWeight:800, color:reps?C.purple:C.textDim, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{reps||'—'}</div>
                <div style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>reps</div>
              </button>
            </div>
          </div>
        )}

        {/* How to perform */}
        {data.howTo?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <button onClick={() => setShowHow(h=>!h)}
              style={{ width:'100%', background:C.surface, border:`1px solid ${C.divider}`, borderRadius:14, padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:C.shadowCard }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>📋</span>
                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>How to perform</span>
              </div>
              <span style={{ color:C.purple, fontSize:16 }}>{showHow?'▲':'▼'}</span>
            </button>
            {showHow && (
              <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, padding:'16px', marginTop:8 }}>
                <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:10 }}>
                  {data.howTo.map((step,i) => (
                    <li key={i} style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{step}</li>
                  ))}
                </ol>
                {data.tips && (
                  <div style={{ marginTop:12, fontSize:12, color:C.purple, fontStyle:'italic', borderTop:`1px solid ${C.divider}`, paddingTop:10 }}>
                    💡 {data.tips}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ height:120 }} />
      </div>

      {/* Bottom action bar — fixed */}
      <div style={{ padding:'12px 20px 32px', background:C.pageBg||'#F0EFF8', borderTop:`1px solid ${C.divider}`, flexShrink:0 }}>
        <button onClick={handleDone}
          style={{ width:'100%', padding:'18px', borderRadius:20, background:`linear-gradient(135deg, ${C.green}, #1aad6b)`, border:'none', color:'#fff', fontSize:18, fontWeight:800, cursor:'pointer', letterSpacing:'0.02em', boxShadow:`0 6px 24px ${C.green}44` }}>
          {isLast && setIdx === totalSets - 1 ? t('workout.finishWorkout') : t('workout.doneMark')}
        </button>
        {/* Skip */}
        {!(isLast && setIdx === totalSets - 1) && (
          <button onClick={() => onNext?.()}
            style={{ width:'100%', marginTop:8, padding:'10px', background:'none', border:'none', color:C.textMuted, fontSize:13, cursor:'pointer' }}>
            Skip this set →
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Active session — orchestrates fullscreen flow
// ─────────────────────────────────────────────
function WorkoutSession({ userId, timezone, plan, onSave, onCancel }) {
  const { t } = useTranslation()
  const fromLibrary = !!plan?.fromLibrary

  const initExercises = () => (plan?.exercises || []).map(ex => {
    const name  = typeof ex === 'string' ? ex : (ex.name || ex)
    const data  = getExercise(name)
    const count = parseInt(ex.sets) || 3
    return {
      name, timed: data.timed || false,
      sets: Array.from({ length: count }, () => ({
        weight: '', reps: String(parseInt(ex.reps)||10), duration: String(parseInt(ex.reps)||30), done: false
      })),
    }
  })

  const [exercises,  setExercises]  = useState(initExercises)
  const [name,       setName]       = useState(plan?.name || '')
  const [notes,      setNotes]      = useState('')
  const [started,    setStarted]    = useState(false)
  const [paused,     setPaused]     = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [restSecs,   setRestSecs]   = useState(60)
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)
  // Fullscreen navigation state
  const [activeEx,   setActiveEx]   = useState(0)  // exercise index
  const [activeSet,  setActiveSet]  = useState(0)  // set index within exercise
  const startRef   = useRef(null)
  const pausedAt   = useRef(0)
  const pauseAccum = useRef(0)

  useEffect(() => {
    if (!started || paused) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current - pauseAccum.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [started, paused])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const beginWorkout = () => { startRef.current = Date.now(); setStarted(true) }
  const togglePause  = () => {
    if (!paused) { pausedAt.current = Date.now(); setPaused(true) }
    else { pauseAccum.current += Date.now() - pausedAt.current; setPaused(false) }
  }

  const addExercise  = ex => setExercises(prev => [...prev, { name:ex.name, timed:getExercise(ex.name).timed||false, sets:[{weight:'',reps:'',duration:'',done:false}] }])
  const updateEx     = (i, ex) => setExercises(prev => prev.map((e,j)=>j===i?ex:e))
  const removeEx     = i => setExercises(prev => prev.filter((_,j)=>j!==i))
  const today        = toUserDateStr(timezone)
  const doneSetsTotal = exercises.reduce((s,e)=>s+e.sets.filter(s=>s.done).length,0)
  const totalVol      = exercises.reduce((s,e)=>s+e.sets.filter(s=>s.done).reduce((sv,set)=>sv+(parseFloat(set.weight)||0)*(parseInt(set.reps)||1),0),0)

  // Mark current set done and advance
  const handleSetDone = ({ weight, reps, duration }) => {
    const ex   = exercises[activeEx]
    const sets = ex.sets.map((s,i) => i===activeSet ? {...s, weight, reps, duration, done:true} : s)
    updateEx(activeEx, { ...ex, sets })

    // Advance to next set or next exercise
    if (activeSet < ex.sets.length - 1) {
      setActiveSet(s => s + 1)
    } else if (activeEx < exercises.length - 1) {
      setActiveEx(e => e + 1)
      setActiveSet(0)
    }
    // If last exercise, last set — finish prompt handled in fullscreen
  }

  const handleNext = () => {
    const ex = exercises[activeEx]
    if (activeSet < ex.sets.length - 1) setActiveSet(s => s + 1)
    else if (activeEx < exercises.length - 1) { setActiveEx(e=>e+1); setActiveSet(0) }
  }

  const isLastExAndSet = activeEx === exercises.length - 1 && activeSet === (exercises[activeEx]?.sets.length||1) - 1

  const handleSave = async () => {
    setSaving(true)
    const workoutName = name.trim() || exercises.map(e=>e.name).join(', ').slice(0,60) || 'Workout'
    const minutes     = started ? Math.max(1, Math.round(elapsed/60)) : 0
    await supabase.from('workout_logs').insert({
      user_id: userId, log_date: today,
      workout_name: workoutName, workout_type: exercises[0]?getExercise(exercises[0].name).category:'General',
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

  // ── Pre-start screen ─────────────────────────
  if (!started) {
    return (
      <div>
        <BackBtn onBack={onCancel} label="Cancel" />
        <div style={{ background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, borderRadius:20, padding:'24px 20px', marginBottom:20, color:'#fff' }}>
          {fromLibrary
            ? <div style={{ fontSize:22, fontWeight:800 }}>{name}</div>
            : <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name your workout..."
                style={{ width:'100%', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:18, fontWeight:700, outline:'none' }} />
          }
          <div style={{ fontSize:13, opacity:0.75, marginTop:8 }}>{exercises.length} exercises</div>
        </div>

        {/* Rest setting */}
        <div style={{ background:C.surface, borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, color:C.textMuted, marginRight:4 }}>{t('workout.restBetween')}</span>
          {[0,30,45,60,90,120].map(s => (
            <button key={s} onClick={() => setRestSecs(s)}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1px solid ${restSecs===s?C.purple:C.border}`, background:restSecs===s?C.purpleLight:'transparent', color:restSecs===s?C.purple:C.textMuted, fontWeight:restSecs===s?700:400 }}>
              {s===0?t('workout.restOff'):`${s}s`}
            </button>
          ))}
        </div>

        {/* Exercise list preview */}
        <Label>Exercises</Label>
        {exercises.map((ex,i) => {
          const data = getExercise(ex.name)
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{data.icon||'💪'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{ex.sets.length} sets · {data.muscles}</div>
              </div>
              <button onClick={() => removeEx(i)} style={{ background:'none', border:'none', color:C.textDim, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
          )
        })}
        <button onClick={() => setShowPicker(true)}
          style={{ width:'100%', padding:12, borderRadius:14, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:20 }}>
          {t('workout.addExercise')}
        </button>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:1, padding:14, borderRadius:16, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            {saving?t('workout.saving'):t('workout.logWithoutTimer')}
          </button>
          <button onClick={beginWorkout}
            style={{ flex:2, padding:14, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px ${C.green}44` }}>
            ▶ Begin workout
          </button>
        </div>
        {showPicker && <ExercisePickerModal onAdd={addExercise} onClose={() => setShowPicker(false)} />}
      </div>
    )
  }

  // ── Active — fullscreen exercise view ────────
  if (exercises.length === 0) return null

  // If last set of last exercise just done — show finish prompt
  const allDone = exercises.every(ex => ex.sets.every(s => s.done))
  if (allDone) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏆</div>
        <div style={{ fontSize:28, fontWeight:800, color:C.text, marginBottom:8 }}>{t('workout.allDone')}</div>
        <div style={{ fontSize:15, color:C.textMuted, marginBottom:8 }}>{fmt(elapsed)} · {doneSetsTotal} sets</div>
        {totalVol>0 && <div style={{ fontSize:13, color:C.textMuted, marginBottom:32 }}>{Math.round(totalVol)} kg total volume</div>}
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="{t('workout.sessionNotes')}"
          style={{ width:'100%', maxWidth:360, padding:'12px 14px', borderRadius:14, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', marginBottom:16 }} />
        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', maxWidth:360, padding:16, borderRadius:18, background:C.purple, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:saving?'default':'pointer' }}>
          {saving?t('workout.saving'):t('workout.saveWorkout')}
        </button>
      </div>
    )
  }

  return (
    <FullscreenExercise
      exercise={exercises[activeEx]}
      setIdx={activeSet}
      totalSets={exercises[activeEx].sets.length}
      elapsed={elapsed}
      paused={paused}
      onTogglePause={togglePause}
      onSetDone={handleSetDone}
      onNext={handleNext}
      onFinish={() => { setStarted(false) }}
      restSecs={restSecs}
      saving={saving}
      fmt={fmt}
      isLast={activeEx===exercises.length-1}
    />
  )
}

// ─────────────────────────────────────────────
// Workout history card
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
            <button onClick={()=>setExpanded(e=>!e)} style={{ padding:'6px 12px', borderRadius:10, background:C.purpleLight, border:'none', color:C.purple, fontSize:12, cursor:'pointer' }}>
              {expanded?'▲':`${log.exercises.length} ex`}
            </button>
          )}
          {!confirm
            ? <button onClick={()=>setConfirm(true)} style={{ padding:'6px 10px', borderRadius:10, background:C.redLight, border:'none', color:C.red, fontSize:12, cursor:'pointer' }}>✕</button>
            : <button onClick={()=>onDelete(log.id)} style={{ padding:'6px 10px', borderRadius:10, background:C.red, border:'none', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>Delete?</button>
          }
        </div>
      </div>
      {expanded && log.exercises?.length>0 && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.divider}`, paddingTop:12 }}>
          {log.exercises.map((ex,i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, minWidth:140 }}>{ex.name}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>
                {ex.sets?.map((s,j)=><span key={j} style={{marginRight:8}}>{s.weight?`${s.weight}kg×${s.reps}`:s.duration?`${s.duration}s`:`×${s.reps}`}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────
// Today workout tab — shows scheduled plans + logs
// ─────────────────────────────────────────────
function TodayWorkoutTab({ userId, timezone, today, logs, logsLoading, onStartEmpty, onStartPlan, onDelete }) {
  const { t } = useTranslation()
  const [plans,   setPlans]   = useState([])
  const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat']
  const todayKey = DAY_KEYS[new Date(today + 'T12:00:00').getDay()]

  useEffect(() => {
    if (!userId) return
    supabase.from('workout_plans').select('*').eq('user_id', userId)
      .then(({ data }) => setPlans(data || []))
  }, [userId])

  const scheduledToday = plans.filter(p => p.schedule?.days?.includes(todayKey))

  return (
    <div>
      {/* Scheduled plans */}
      {scheduledToday.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <Label>Scheduled for today</Label>
          {scheduledToday.map(plan => (
            <div key={plan.id} style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.purple}44`, padding:'14px 16px', marginBottom:10, boxShadow:C.shadowCard }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📋</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{plan.name}</div>
                  <div style={{ fontSize:12, color:C.purple }}>
                    {plan.exercises?.length||0} exercises{plan.schedule?.time ? ` · ${plan.schedule.time}` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => onStartPlan(plan)}
                style={{ width:'100%', padding:'11px', borderRadius:12, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                ▶ Start now
              </button>
            </div>
          ))}
        </div>
      )}

      {logsLoading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : logs.length > 0 ? (
        <>
          <Label>Today's workouts</Label>
          {logs.map(log => <WorkoutHistoryCard key={log.id} log={log} onDelete={onDelete} />)}
        </>
      ) : (
        <Card style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏃</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>
            {scheduledToday.length > 0 ? t('workout.readyStart') : t('workout.noWorkoutToday')}
          </div>
          <div style={{ fontSize:13, color:C.textMuted }}>
            {scheduledToday.length > 0 ? 'Tap "Start now" above to begin your scheduled workout.' : t('workout.noWorkoutSub')}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main WorkoutTab
// ─────────────────────────────────────────────
export default function WorkoutTab({ userId, profile }) {
  const { t } = useTranslation()
  const timezone = profile?.timezone
  const today    = toUserDateStr(timezone)

  const [tab,          setTab]          = useState('library')
  const [session,      setSession]      = useState(null)
  const [logs,         setLogs]         = useState([])
  const [logsLoading,  setLogsLoading]  = useState(true)
  const [preloadPlan,  setPreloadPlan]  = useState(null)
  const [showBuilder,  setShowBuilder]  = useState(false)
  const [planRefreshKey, setPlanRefreshKey] = useState(0)

  useEffect(() => { fetchLogs() }, [userId])

  const fetchLogs = async () => {
    if (!userId) return
    setLogsLoading(true)
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', today).order('created_at', { ascending:false })
    setLogs(data || [])
    setLogsLoading(false)
  }

  const deleteLog = async id => {
    await supabase.from('workout_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const handleUseAsTemplate = workout => {
    if (workout.startNow) {
      setSession({ name: workout.name, exercises: workout.exercises, fromLibrary: true })
    } else {
      setPreloadPlan({ name: workout.name, exercises: workout.exercises })
      setTab('plans')
    }
  }

  if (session) {
    return (
      <WorkoutSession
        userId={userId} timezone={timezone} plan={session}
        onSave={() => { fetchLogs(); setSession(null) }}
        onCancel={() => setSession(null)}
      />
    )
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:C.surfaceMid, borderRadius:14, padding:4 }}>
        {[['library',t('workout.library')],['plans',t('workout.myPlans')],['log',t('workout.today')]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, padding:'9px 4px', borderRadius:11, fontSize:12, fontWeight:tab===id?700:400, cursor:'pointer', border:'none', background:tab===id?C.surface:'transparent', color:tab===id?C.purple:C.textMuted, boxShadow:tab===id?C.shadowCard:'none', transition:'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab==='library' && <LibraryTab onUseAsTemplate={handleUseAsTemplate} />}

      {tab==='plans' && (
        <>
          {showBuilder && (
            <AuronWorkoutBuilder
              userId={userId}
              onClose={() => setShowBuilder(false)}
              onPlanSaved={() => {
                setShowBuilder(false)
                // Force MyPlansTab to refetch by remounting with key
                setPreloadPlan(prev => prev) // no-op, refetch handled inside MyPlansTab via planRefreshKey
                setPlanRefreshKey(k => k + 1)
              }}
            />
          )}
          <MyPlansTab key={planRefreshKey} userId={userId}
            onStartPlan={plan => setSession({ ...plan, fromLibrary: false })}
            preloadPlan={preloadPlan}
            onPreloadConsumed={() => setPreloadPlan(null)}
            onBuildWithAuron={() => setShowBuilder(true)}
          />
        </>
      )}

      {tab==='log' && (
        <TodayWorkoutTab
          userId={userId}
          timezone={timezone}
          today={today}
          logs={logs}
          logsLoading={logsLoading}
          onStartEmpty={() => setSession({ name:'', exercises:[], fromLibrary:false })}
          onStartPlan={plan => setSession({ ...plan, fromLibrary: false })}
          onDelete={deleteLog}
        />
      )}
    </div>
  )
}
