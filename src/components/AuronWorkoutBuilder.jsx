import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { AuronCharacter } from './CoachAuron'
import { getExercise } from '../lib/workoutData.js'
import { useTranslation } from '../lib/i18n.jsx'

const C = T
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const DAY_KEYS  = ['sun','mon','tue','wed','thu','fri','sat']

const MEDICAL_KEYWORDS = ['heart','cardiac','surgery','cancer','diabetes','epilepsy','pregnant','pregnancy','chronic','condition','disorder','disease','fracture','herniat','arthritis']
const hasMedicalConcern = txt => txt && MEDICAL_KEYWORDS.some(k => txt.toLowerCase().includes(k))

// ---------------------------------------------
// Question definitions — labels resolved via t() at render time
// ---------------------------------------------
const QUESTION_DEFS = [
  { id:'goal',        mood:'motivating', qKey:'q.goal.q',        subKey:'q.goal.sub',        type:'single',
    options:[{label:'Lose fat',emoji:'🔥'},{label:'Build muscle',emoji:'💪'},{label:'Improve fitness',emoji:'🏃'},{label:'Get stronger',emoji:'🏋️'},{label:'Stay healthy',emoji:'❤️'}] },
  { id:'location',    mood:'thinking',   qKey:'q.location.q',    subKey:'q.location.sub',    type:'single',
    options:[{label:'Home',emoji:'🏠'},{label:'Gym',emoji:'🏋️'},{label:'Outdoor',emoji:'🌳'},{label:'Mix',emoji:'🔄'}] },
  { id:'equipment',   mood:'workout',    qKey:'q.equipment.q',   subKey:'q.equipment.sub',   type:'single',
    options:[{label:'No equipment',emoji:'🙌'},{label:'Dumbbells',emoji:'🏋️'},{label:'Resistance bands',emoji:'〰️'},{label:'Full gym',emoji:'💪'},{label:'Other',emoji:'⚙️'}] },
  { id:'days',        mood:'habit',      qKey:'q.days.q',        subKey:'q.days.sub',        type:'single',
    options:[{label:'2 days',emoji:'🗓️'},{label:'3 days',emoji:'🗓️'},{label:'4 days',emoji:'🗓️'},{label:'5 days',emoji:'🗓️'},{label:'6 days',emoji:'🗓️'}] },
  { id:'duration',    mood:'thinking',   qKey:'q.duration.q',    subKey:'q.duration.sub',    type:'single',
    options:[{label:'15 minutes',emoji:'⚡'},{label:'30 minutes',emoji:'🕐'},{label:'45 minutes',emoji:'🕐'},{label:'60 minutes',emoji:'🕐'}] },
  { id:'level',       mood:'greeting',   qKey:'q.level.q',       subKey:'q.level.sub',       type:'single',
    options:[{label:'Beginner',emoji:'🌱'},{label:'Intermediate',emoji:'⚡'},{label:'Advanced',emoji:'🔥'}] },
  { id:'focus',       mood:'workout',    qKey:'q.focus.q',       subKey:'q.focus.sub',       type:'multi',
    options:[{label:'Arms',emoji:'💪'},{label:'Chest',emoji:'🦋'},{label:'Shoulders',emoji:'🏋️'},{label:'Back',emoji:'🔙'},{label:'Legs',emoji:'🦵'},{label:'Core',emoji:'🧘'},{label:'Full body',emoji:'⭐'}] },
  { id:'limitations', mood:'concerned',  qKey:'q.limitations.q', subKey:'q.limitations.sub', type:'text', placeholderKey:'q.limitations.placeholder' },
  { id:'request',     mood:'thinking',   qKey:'q.request.q',     subKey:'q.request.sub',     type:'text', placeholderKey:'q.request.placeholder' },
]

// ---------------------------------------------
// Progress bar
// ---------------------------------------------
function ProgressBar({ current, total }) {
  return (
    <div style={{ height:4, background:C.border, borderRadius:2, overflow:'hidden', width:'100%' }}>
      <div style={{ height:'100%', width:`${(current/total)*100}%`, background:C.purple, borderRadius:2, transition:'width 0.3s ease' }} />
    </div>
  )
}

// ---------------------------------------------
// Question screen — uses t() for every string
// ---------------------------------------------
function QuestionScreen({ qDef, value, onChange, onNext, onBack, onClose, idx, total }) {
  const { t } = useTranslation()
  const canNext = qDef.type === 'text' ? true : qDef.type === 'multi' ? (value||[]).length > 0 : !!value
  const isLast  = idx === total - 1

  return (
    <div style={{ position:'fixed', inset:0, background:C.pageBg||'#F0EFF8', zIndex:300, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto' }}>
      <div style={{ padding:'20px 20px 12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          {idx > 0
            ? <button onClick={onBack} style={{ background:'none', border:'none', color:C.textMuted, fontSize:22, cursor:'pointer', padding:0, lineHeight:1, minWidth:28 }}>‹</button>
            : <div style={{ minWidth:28 }} />
          }
          <div style={{ flex:1 }}><ProgressBar current={idx+1} total={total} /></div>
          <div style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>{idx+1}/{total}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.textMuted, fontSize:18, cursor:'pointer', padding:'0 0 0 8px', lineHeight:1 }}>✕</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
          <AuronCharacter mood={qDef.mood} size="hero" />
        </div>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:800, color:C.text, lineHeight:1.3, marginBottom:8 }}>{t(qDef.qKey)}</div>
          <div style={{ fontSize:14, color:C.textMuted }}>{t(qDef.subKey)}</div>
        </div>

        {/* Single choice */}
        {qDef.type === 'single' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {qDef.options.map(opt => {
              const sel = value === opt.label
              return (
                <button key={opt.label} onClick={() => onChange(opt.label)}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:16, cursor:'pointer', textAlign:'left', border:`2px solid ${sel?C.purple:C.divider}`, background:sel?C.purpleLight:C.surface, transition:'all 0.15s', boxShadow:sel?`0 0 0 1px ${C.purple}`:C.shadowCard }}>
                  <span style={{ fontSize:24 }}>{opt.emoji}</span>
                  <span style={{ fontSize:15, fontWeight:sel?700:500, color:sel?C.purple:C.text }}>
                    {t(`opt.${opt.label}`, opt.label)}
                  </span>
                  {sel && <span style={{ marginLeft:'auto', color:C.purple, fontSize:18 }}>✓</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Multi choice */}
        {qDef.type === 'multi' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {qDef.options.map(opt => {
              const arr = value || []
              const sel = arr.includes(opt.label)
              return (
                <button key={opt.label} onClick={() => onChange(sel ? arr.filter(v=>v!==opt.label) : [...arr, opt.label])}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 10px', borderRadius:16, cursor:'pointer', border:`2px solid ${sel?C.purple:C.divider}`, background:sel?C.purpleLight:C.surface, transition:'all 0.15s', boxShadow:sel?`0 0 0 1px ${C.purple}`:C.shadowCard }}>
                  <span style={{ fontSize:28 }}>{opt.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?C.purple:C.text, textAlign:'center' }}>
                    {t(`opt.${opt.label}`, opt.label)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Free text */}
        {qDef.type === 'text' && (
          <div>
            <textarea value={value||''} onChange={e=>onChange(e.target.value)}
              placeholder={t(qDef.placeholderKey)} rows={4}
              style={{ width:'100%', padding:'14px 16px', borderRadius:16, background:C.surface, border:`2px solid ${C.divider}`, color:C.text, fontSize:14, outline:'none', resize:'none', lineHeight:1.6, fontFamily:'inherit', boxSizing:'border-box', boxShadow:C.shadowCard }}
              onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.divider} />
            <div style={{ fontSize:12, color:C.textDim, marginTop:6 }}>{t('builder.skip')}</div>
          </div>
        )}
        <div style={{ height:100 }} />
      </div>

      <div style={{ padding:'12px 24px 36px', background:C.pageBg||'#F0EFF8', borderTop:`1px solid ${C.divider}`, flexShrink:0 }}>
        <button onClick={onNext} disabled={!canNext}
          style={{ width:'100%', padding:'16px', borderRadius:20, background:canNext?C.purple:C.surfaceMid, border:'none', color:canNext?'#fff':C.textDim, fontSize:16, fontWeight:700, cursor:canNext?'pointer':'default', transition:'all 0.15s' }}>
          {isLast ? t('builder.build') : t('builder.next')}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------
// Generating screen
// ---------------------------------------------
function GeneratingScreen() {
  const { t } = useTranslation()
  return (
    <div style={{ position:'fixed', inset:0, background:`linear-gradient(160deg, ${C.purpleDark||'#3D2B8E'} 0%, ${C.pageBg||'#F0EFF8'} 100%)`, zIndex:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, maxWidth:480, margin:'0 auto' }}>
      <AuronCharacter mood="workout" size="hero" />
      <div style={{ fontSize:24, fontWeight:800, color:C.text, marginTop:24, marginBottom:8, textAlign:'center' }}>{t('builder.generating')}</div>
      <div style={{ fontSize:14, color:C.textMuted, textAlign:'center', marginBottom:36, maxWidth:280 }}>{t('builder.genSub')}</div>
      <div style={{ display:'flex', gap:10 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:C.purple, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

// ---------------------------------------------
// Plan preview — editable days, separate workouts
// ---------------------------------------------
function PlanPreviewScreen({ plan, answers, onSave, onRegenerate, onEditRequest, onCancel, saving }) {
  const { t, lang } = useTranslation()
  const numWorkouts = plan.workouts?.length || 0
  const [assignedDays, setAssignedDays] = useState(() => {
    const map = {}
    if (plan.weeklySchedule) {
      const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      let wi = 0
      plan.weeklySchedule.forEach(s => {
        if (!s.rest && wi < numWorkouts) {
          const di = DAY_EN.findIndex(d => (s.day||'').startsWith(d))
          if (di >= 0) map[wi] = DAY_KEYS[di]
          wi++
        }
      })
    }
    return map
  })

  const toggleDay = (wi, key) =>
    setAssignedDays(prev => ({ ...prev, [wi]: prev[wi] === key ? null : key }))

  const DAY_I18N_KEYS = ['sched.sun','sched.mon','sched.tue','sched.wed','sched.thu','sched.fri','sched.sat']

  return (
    <div style={{ position:'fixed', inset:0, background:C.pageBg||'#F0EFF8', zIndex:300, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto' }}>
      <div style={{ padding:'20px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={onCancel} style={{ background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', padding:0 }}>{t('builder.cancel')}</button>
          <div style={{ flex:1, fontSize:17, fontWeight:700, color:C.text, textAlign:'center' }}>{t('builder.ready')}</div>
          <div style={{ width:40 }} />
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px' }}>
        {/* Auron summary */}
        <div style={{ background:C.purpleLight, borderRadius:20, padding:'16px', display:'flex', gap:12, alignItems:'center', marginBottom:16, border:`1px solid ${C.border}` }}>
          <AuronCharacter mood="happy" size="hero" />
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>{t('builder.coachMsg')}</div>
            <div style={{ fontSize:13, color:C.textMuted, lineHeight:1.5 }}>
              <strong>{plan.difficulty}</strong> · {answers.goal}<br/>
              {plan.daysPerWeek} {t('builder.daysWeek')} · {plan.sessionDuration}
            </div>
          </div>
        </div>

        {/* Plan name */}
        <div style={{ background:C.surface, borderRadius:16, padding:'14px 16px', marginBottom:14, border:`1px solid ${C.divider}` }}>
          <div style={{ fontSize:11, color:C.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{t('builder.planName')}</div>
          <div style={{ fontSize:19, fontWeight:800, color:C.text }}>{plan.planName}</div>
        </div>

        {/* Each workout */}
        {plan.workouts?.map((workout, wi) => (
          <div key={wi} style={{ background:C.surface, borderRadius:18, border:`1px solid ${C.divider}`, marginBottom:14, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', background:C.purpleLight, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:16, fontWeight:800, color:C.purple }}>{workout.title}</div>
              {workout.notes && <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{workout.notes}</div>}
            </div>

            {/* Day picker */}
            <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.divider}`, background:C.surfaceMid }}>
              <div style={{ fontSize:11, color:C.textMuted, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>{t('builder.schedDay')}</div>
              <div style={{ display:'flex', gap:5 }}>
                {DAY_KEYS.map((key, di) => {
                  const sel    = assignedDays[wi] === key
                  const usedBy = Object.entries(assignedDays).find(([i,k]) => parseInt(i) !== wi && k === key)
                  return (
                    <button key={key} onClick={() => toggleDay(wi, key)}
                      style={{ flex:1, padding:'7px 0', borderRadius:8, border:`1px solid ${sel?C.purple:C.border}`, background:sel?C.purple:usedBy?C.surfaceMid:'transparent', color:sel?'#fff':usedBy?C.textDim:C.textMuted, fontSize:11, fontWeight:sel?700:400, cursor:'pointer', opacity:usedBy?0.5:1 }}>
                      {t(DAY_I18N_KEYS[di])}
                    </button>
                  )
                })}
              </div>
              {!assignedDays[wi] && <div style={{ fontSize:10, color:C.textDim, marginTop:5 }}>{t('builder.tapDay')}</div>}
            </div>

            {workout.warmup && (
              <div style={{ padding:'8px 16px', background:`${C.amber}10`, borderBottom:`1px solid ${C.divider}`, fontSize:12, color:C.textMuted }}>
                🔥 {t('builder.warmup')}: {workout.warmup}
              </div>
            )}

            <div style={{ padding:'6px 16px' }}>
              {workout.exercises?.map((ex, j) => {
                const name = typeof ex === 'string' ? ex : ex.name
                const data = getExercise(name, lang)
                return (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: j<workout.exercises.length-1?`1px solid ${C.divider}`:'none' }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{data.icon||'💪'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{name}</div>
                      {(ex.sets||ex.reps) && <div style={{ fontSize:11, color:C.textMuted }}>{ex.sets&&`${ex.sets} sets`}{ex.reps&&` × ${ex.reps}`}{ex.rest&&` · ${ex.rest} rest`}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {workout.cooldown && (
              <div style={{ padding:'8px 16px', background:`${C.blue||'#0984E3'}08`, borderTop:`1px solid ${C.divider}`, fontSize:12, color:C.textMuted }}>
                🧊 {t('builder.cooldown')}: {workout.cooldown}
              </div>
            )}
          </div>
        ))}
        <div style={{ height:120 }} />
      </div>

      <div style={{ padding:'12px 20px 36px', background:C.pageBg||'#F0EFF8', borderTop:`1px solid ${C.divider}`, flexShrink:0, display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={() => onSave(assignedDays)} disabled={saving}
          style={{ width:'100%', padding:14, borderRadius:18, background:C.purple, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:saving?'default':'pointer', boxShadow:`0 4px 20px ${C.purple}44` }}>
          {saving ? t('builder.saving') : `✓ ${t('builder.save').replace('{n}', numWorkouts)}`}
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onRegenerate} style={{ flex:1, padding:12, borderRadius:14, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:13, fontWeight:600, cursor:'pointer' }}>{t('builder.regen')}</button>
          <button onClick={onEditRequest} style={{ flex:1, padding:12, borderRadius:14, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:13, fontWeight:600, cursor:'pointer' }}>{t('builder.edit')}</button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------
// Main component
// ---------------------------------------------
export default function AuronWorkoutBuilder({ userId, onClose, onPlanSaved }) {
  const { t, lang } = useTranslation()
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState({})
  const [plan,    setPlan]    = useState(null)
  const [error,   setError]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [medWarn, setMedWarn] = useState(false)

  const total = QUESTION_DEFS.length
  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }))

  const goNext = async () => {
    const q = QUESTION_DEFS[step]
    if (q.type === 'text' && hasMedicalConcern(answers[q.id])) setMedWarn(true)
    if (step < total - 1) setStep(s => s + 1)
    else await generate()
  }

  const generate = async () => {
    setStep('generating')
    setError(null)
    try { setPlan(await callAI(answers, lang)); setStep('preview') }
    catch (e) { setError(e.message || 'Error'); setStep('error') }
  }

  const handleSave = async (assignedDays) => {
    if (!plan?.workouts?.length) return
    setSaving(true)
    const planName = plan.planName || 'Auron Plan'
    for (let wi = 0; wi < plan.workouts.length; wi++) {
      const workout = plan.workouts[wi]
      const dayKey  = assignedDays[wi] || null
      const exercises = (workout.exercises || []).map(ex => {
        const name = typeof ex === 'string' ? ex : ex.name
        return { name, icon:getExercise(name).icon||'💪', muscles:getExercise(name, lang).muscles||'', timed:getExercise(name).timed||false, sets:parseInt(ex.sets)||3, reps:parseInt(ex.reps)||10, notes:ex.notes||'' }
      })
      const schedule  = dayKey ? { days:[dayKey], time:null, active:true } : null
      const planTitle = plan.workouts.length > 1 ? `${planName} — ${workout.title}` : planName
      await supabase.from('workout_plans').insert({ user_id:userId, name:planTitle, exercises, notes:`Coach Auron · ${answers.goal} · ${answers.level}`.trim(), schedule, created_at:new Date().toISOString() })
    }
    setSaving(false)
    onPlanSaved?.()
    onClose()
  }

  const MedBanner = () => medWarn ? (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:400, background:C.amber, padding:'10px 16px', textAlign:'center', fontSize:12, fontWeight:600, color:'#7C4A00', maxWidth:480, margin:'0 auto' }}>
      {t('builder.medWarning')}
      <button onClick={() => setMedWarn(false)} style={{ marginLeft:10, background:'none', border:'none', color:'#7C4A00', cursor:'pointer', fontSize:14, fontWeight:700 }}>×</button>
    </div>
  ) : null

  if (step === 'generating') return <GeneratingScreen />

  if (step === 'error') return (
    <div style={{ position:'fixed', inset:0, background:C.pageBg||'#F0EFF8', zIndex:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, maxWidth:480, margin:'0 auto' }}>
      <AuronCharacter mood="concerned" size="hero" />
      <div style={{ fontSize:18, fontWeight:700, color:C.text, marginTop:20, marginBottom:8, textAlign:'center' }}>{t('builder.error')}</div>
      <div style={{ fontSize:13, color:C.textMuted, textAlign:'center', marginBottom:24 }}>{error}</div>
      <button onClick={generate} style={{ padding:'12px 28px', borderRadius:16, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:12 }}>{t('builder.tryAgain')}</button>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer' }}>{t('builder.cancel')}</button>
    </div>
  )

  if (step === 'preview') return (
    <>
      <MedBanner />
      <PlanPreviewScreen plan={plan} answers={answers} saving={saving}
        onSave={handleSave} onRegenerate={generate}
        onEditRequest={() => setStep(total - 1)} onCancel={onClose} />
    </>
  )

  return (
    <>
      <MedBanner />
      <QuestionScreen qDef={QUESTION_DEFS[step]} value={answers[QUESTION_DEFS[step].id]}
        onChange={val => setAnswer(QUESTION_DEFS[step].id, val)}
        onNext={goNext} onBack={() => setStep(s => Math.max(0, s-1))}
        onClose={onClose} idx={step} total={total} />
    </>
  )
}

// ---------------------------------------------
// AI call
// ---------------------------------------------
async function callAI(answers, lang) {
  const key = import.meta.env.VITE_GROQ_KEY
  if (!key) throw new Error('No AI key configured.')
  const numDays   = parseInt(answers.days) || 3
  const respondIn = lang === 'fr' ? 'Respond in French.' : 'Respond in English.'

  const prompt = `You are Coach Auron, an expert fitness coach. Generate a workout plan as strict JSON only. No markdown, no explanation. ${respondIn}

User:
- Goal: ${answers.goal}
- Location: ${answers.location}
- Equipment: ${answers.equipment}
- Days/week: ${answers.days}
- Duration: ${answers.duration}
- Level: ${answers.level}
- Focus: ${Array.isArray(answers.focus)?answers.focus.join(', '):answers.focus||'full body'}
- Limitations: ${answers.limitations||'none'}
- Request: ${answers.request||'none'}

Return ONLY this JSON (no text outside):
{
  "planName":"string",
  "goal":"string",
  "daysPerWeek":${numDays},
  "sessionDuration":"${answers.duration}",
  "difficulty":"${answers.level}",
  "weeklySchedule":[{"day":"Monday","focus":"Push","rest":false},{"day":"Tuesday","focus":null,"rest":true}],
  "workouts":[{"title":"string","notes":"string","warmup":"string","cooldown":"string","exercises":[{"name":"Exercise name","sets":3,"reps":"10-12","rest":"60s","notes":""}]}]
}

Rules: Generate exactly ${numDays} workouts. Each workout different exercises. Only equipment/location appropriate exercises. No medical advice.`

  const res = await fetch(GROQ_URL, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
    body:JSON.stringify({ model:'llama-3.3-70b-versatile', max_tokens:2500, temperature:0.7, messages:[{role:'user',content:prompt}] }),
  })
  if (!res.ok) throw new Error(`AI error (${res.status})`)
  const data  = await res.json()
  const text  = data.choices?.[0]?.message?.content || ''
  const clean = text.replace(/```json|```/g,'').trim()
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Invalid AI response format.')
  return JSON.parse(clean.slice(start, end+1))
}
