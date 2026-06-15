import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { askClaude, askClaudeWithImage } from './lib/claude'
import { useFoodLog } from './hooks/useFoodLog'
import { useProfile } from './hooks/useProfile'
import Auth from './components/Auth'
import WorkoutsTab from './components/WorkoutsTab'
import TodayTab from './components/TodayTab'

const C = {
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.12)', goldDark: '#8B6914',
  dark: '#0F0F0F', surface: '#1A1A1A', surfaceLight: '#242424',
  border: 'rgba(201,168,76,0.2)', borderStrong: 'rgba(201,168,76,0.4)',
  text: '#F0EDE6', textMuted: '#888880',
  green: '#4CAF72', greenLight: 'rgba(76,175,114,0.15)',
  red: '#E05252', redLight: 'rgba(224,82,82,0.12)',
  blue: '#5B9BD5', blueLight: 'rgba(91,155,213,0.12)',
  amber: '#D4924A',
}

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', hint: '6am–10am' },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️',  hint: '11am–2pm' },
  { id: 'snack',     label: 'Snack',     icon: '🍎',  hint: '2pm–5pm' },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙',  hint: '5pm–9pm' },
]

const FOOD_DB = [
  { name: 'Chicken breast (100g)', cal: 165, p: 31, c: 0, f: 4 },
  { name: 'Greek yogurt (150g)', cal: 100, p: 17, c: 6, f: 1 },
  { name: 'Brown rice (100g)', cal: 216, p: 5, c: 45, f: 2 },
  { name: 'Whole egg', cal: 72, p: 6, c: 0, f: 5 },
  { name: 'Banana (medium)', cal: 105, p: 1, c: 27, f: 0 },
  { name: 'Salmon fillet (100g)', cal: 208, p: 20, c: 0, f: 13 },
  { name: 'Oats (50g)', cal: 188, p: 6, c: 32, f: 4 },
  { name: 'Almonds (30g)', cal: 174, p: 6, c: 6, f: 15 },
  { name: 'Whey protein shake', cal: 130, p: 25, c: 5, f: 2 },
  { name: 'Broccoli (100g)', cal: 34, p: 3, c: 7, f: 0 },
  { name: 'Sweet potato (150g)', cal: 130, p: 3, c: 30, f: 0 },
  { name: 'Avocado (half)', cal: 120, p: 1, c: 6, f: 11 },
  { name: 'Cottage cheese (100g)', cal: 98, p: 11, c: 3, f: 4 },
  { name: 'Tuna can (185g)', cal: 170, p: 38, c: 0, f: 1 },
  { name: 'Olive oil (1 tbsp)', cal: 119, p: 0, c: 0, f: 14 },
  { name: 'Apple (medium)', cal: 95, p: 0, c: 25, f: 0 },
  { name: 'Quinoa (100g)', cal: 222, p: 8, c: 39, f: 4 },
  { name: 'Whole milk (250ml)', cal: 149, p: 8, c: 12, f: 8 },
  { name: 'Whole wheat bread slice', cal: 81, p: 4, c: 14, f: 1 },
  { name: 'Orange (medium)', cal: 62, p: 1, c: 15, f: 0 },
]

const WORKOUTS = [
  { id: 1, name: 'Upper Body Strength', type: 'Strength', duration: 45, cal: 320, level: 'Intermediate', exercises: ['Bench Press 4×8', 'Pull-ups 3×10', 'Shoulder Press 4×10', 'Tricep Dips 3×12', 'Bicep Curls 3×12', 'Face Pulls 3×15'] },
  { id: 2, name: 'Full Body HIIT', type: 'HIIT', duration: 30, cal: 380, level: 'Advanced', exercises: ['Burpees 4×15', 'Jump Squats 4×20', 'Mountain Climbers 4×30s', 'Box Jumps 3×12', 'High Knees 4×45s'] },
  { id: 3, name: '5K Run Program', type: 'Cardio', duration: 35, cal: 360, level: 'Beginner', exercises: ['Warm up walk 5min', 'Run 2km', 'Walk 1min', 'Run 2km', 'Cool down 5min'] },
  { id: 4, name: 'Morning Mobility', type: 'Mobility', duration: 20, cal: 80, level: 'Beginner', exercises: ['Hip circles 2×30s', 'Shoulder rolls 2×30s', 'Cat-cow 2×60s', 'Pigeon pose 2×45s', 'Thoracic rotations 2×30s'] },
  { id: 5, name: 'Leg Day', type: 'Strength', duration: 50, cal: 420, level: 'Intermediate', exercises: ['Squats 4×10', 'Romanian Deadlift 4×8', 'Leg Press 3×12', 'Walking Lunges 3×16', 'Calf Raises 4×20', 'Leg Curl 3×12'] },
  { id: 6, name: 'Core & Abs', type: 'Strength', duration: 25, cal: 180, level: 'Beginner', exercises: ['Plank 3×60s', 'Crunches 3×20', 'Leg Raises 3×15', 'Russian Twist 3×20', 'Dead Bug 3×10'] },
]

// ── Shared UI ──────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0F0F0F; color: #F0EDE6; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }
  input, button, select, textarea { font-family: inherit; }
  button { cursor: pointer; }
  @keyframes spin { to { transform: rotate(360deg); } }
`

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
  return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: bg, color, fontWeight: 500, display: 'inline-block' }}>{children}</span>
}

function GoldBtn({ children, onClick, disabled, style = {}, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '10px 20px', borderRadius: 24, background: outline ? 'transparent' : disabled ? C.surfaceLight : C.gold, color: outline ? C.gold : disabled ? C.textMuted : C.dark, border: outline ? `1px solid ${C.gold}` : 'none', fontSize: 13, fontWeight: 500, opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </button>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: C.surfaceLight, borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function MacroBar({ label, current, goal, color }) {
  const pct = Math.min((current / goal) * 100, 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.textMuted, width: 56 }}>{label}</div>
      <div style={{ flex: 1, height: 5, background: C.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: C.text, width: 74, textAlign: 'right' }}>{Math.round(current)} / {goal}g</div>
    </div>
  )
}

function CalRing({ consumed, goal }) {
  const r = 70, circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(consumed / goal, 1))
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 24px' }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={r} fill="none" stroke={C.surfaceLight} strokeWidth={12} />
        <circle cx={90} cy={90} r={r} fill="none" stroke={C.gold} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 90 90)" style={{ transition: 'stroke-dashoffset 0.6s' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{consumed.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>of {goal.toLocaleString()} kcal</div>
        <div style={{ fontSize: 12, color: consumed > goal ? C.red : C.gold, marginTop: 4, fontWeight: 500 }}>
          {consumed > goal ? `${(consumed - goal).toLocaleString()} over` : `${(goal - consumed).toLocaleString()} left`}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ logs, waterCups, setWaterCups, profile, userId }) {
  const totalCal = logs.reduce((s, f) => s + f.calories, 0)
  const goal = profile?.calorie_goal || 2200

  const saveWater = async (cups) => {
    setWaterCups(cups)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('water_logs').upsert({ user_id: userId, log_date: today, cups, updated_at: new Date().toISOString() })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: C.surfaceLight, borderRadius: 12, border: `1px solid ${C.borderStrong}` }}>
        <span style={{ fontSize: 22 }}>❤️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Apple Health connected</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Steps, heart rate & sleep syncing</div>
        </div>
        <Badge color={C.green} bg={C.greenLight}>Live</Badge>
      </div>

      <CalRing consumed={totalCal} goal={goal} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        <StatCard icon="👟" label="Steps" value="8,234" sub="goal: 10k" color={C.blue} />
        <StatCard icon="🔥" label="Burned" value="487" sub="kcal active" color={C.red} />
        <StatCard icon="🌙" label="Sleep" value="7h 12m" sub="goal: 8h" color={C.gold} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>This week</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto 4px', background: i < 3 ? C.greenLight : i === 3 ? C.gold : C.surfaceLight, border: `1px solid ${i < 3 ? C.green : i === 3 ? 'transparent' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: i < 3 ? C.green : i === 3 ? C.dark : C.textMuted }}>
                {i < 4 ? '✓' : ''}
              </div>
              <div style={{ fontSize: 10, color: i === 3 ? C.gold : C.textMuted }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Water intake</div>
          <span style={{ fontSize: 12, color: C.blue, fontWeight: 500 }}>{waterCups} / {profile?.water_goal || 8} cups</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: profile?.water_goal || 8 }, (_, i) => (
            <div key={i} onClick={() => saveWater(i < waterCups ? i : i + 1)}
              style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: i < waterCups ? C.blueLight : C.surfaceLight, border: `1px solid ${i < waterCups ? C.blue : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💧</div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ── AI Scanner ─────────────────────────────────────────────────────────────

function AIScanner({ onLog }) {
  const [mode, setMode] = useState('describe')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [imgSrc, setImgSrc] = useState(null)
  const fileRef = useRef()

  const SYSTEM = `You are a nutrition expert. Respond ONLY with valid JSON, no markdown:
{"meal":"name","calories":number,"protein":number,"carbs":number,"fat":number,"items":[{"name":"item","calories":number}],"confidence":"high/medium/low","note":"brief tip"}`

  const analyze = async (text) => {
    setLoading(true); setResult(null)
    try {
      const raw = await askClaude(SYSTEM, `Estimate nutrition for: ${text}`)
      setResult(JSON.parse(raw.replace(/```json|```/g, '').trim()))
    } catch { setResult({ error: 'Could not parse. Try being more specific.' }) }
    setLoading(false)
  }

  const analyzePhoto = async (file) => {
    setLoading(true); setResult(null)
    const reader = new FileReader()
    reader.onload = async (e) => {
      setImgSrc(e.target.result)
      const base64 = e.target.result.split(',')[1]
      try {
        const raw = await askClaudeWithImage(SYSTEM, base64, file.type)
        setResult(JSON.parse(raw.replace(/```json|```/g, '').trim()))
      } catch { setResult({ error: 'Could not analyze photo. Try describing the meal instead.' }) }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const confColor = { high: C.green, medium: C.amber, low: C.red }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 6 }}>AI Food Scanner</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Describe your meal or upload a photo to estimate calories</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['describe','photo'].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setImgSrc(null) }}
            style={{ flex: 1, padding: 10, borderRadius: 12, border: `1px solid ${mode === m ? C.gold : C.border}`, background: mode === m ? C.goldLight : 'transparent', color: mode === m ? C.gold : C.textMuted, fontSize: 13 }}>
            {m === 'describe' ? '✍️ Describe meal' : '📷 Upload photo'}
          </button>
        ))}
      </div>

      {mode === 'describe' ? (
        <Card style={{ marginBottom: 16 }}>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
            placeholder="e.g. A plate of spaghetti bolognese with ground beef and parmesan, around 300g of pasta total..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.6, marginBottom: 12 }} />
          <GoldBtn onClick={() => analyze(desc)} disabled={loading || !desc.trim()} style={{ width: '100%', padding: 13 }}>
            {loading ? 'Analyzing...' : 'Estimate calories ✨'}
          </GoldBtn>
        </Card>
      ) : (
        <Card style={{ marginBottom: 16, textAlign: 'center' }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && analyzePhoto(e.target.files[0])} />
          {imgSrc
            ? <img src={imgSrc} alt="food" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
            : <div onClick={() => fileRef.current.click()} style={{ padding: '40px 20px', border: `2px dashed ${C.border}`, borderRadius: 12, cursor: 'pointer', marginBottom: 12 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 14, color: C.textMuted }}>Tap to upload a food photo</div>
              </div>
          }
          {imgSrc && !loading && !result && <GoldBtn onClick={() => fileRef.current.click()} style={{ width: '100%' }}>Choose different photo</GoldBtn>}
        </Card>
      )}

      {loading && <Card style={{ textAlign: 'center', padding: 28 }}><Spinner /><div style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>AI is analyzing your meal...</div></Card>}

      {result && !loading && (result.error
        ? <Card style={{ borderColor: C.red }}><div style={{ fontSize: 13, color: C.red }}>{result.error}</div></Card>
        : <Card style={{ borderColor: C.borderStrong }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17 }}>{result.meal}</div>
              <Badge color={confColor[result.confidence]} bg={`${confColor[result.confidence]}22`}>{result.confidence}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
              {[['Calories', result.calories, 'kcal', C.gold],['Protein', result.protein, 'g', C.blue],['Carbs', result.carbs, 'g', C.amber],['Fat', result.fat, 'g', C.green]].map(([l,v,u,col]) => (
                <div key={l} style={{ background: C.surfaceLight, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: col }}>{v}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{u} {l}</div>
                </div>
              ))}
            </div>
            {result.items?.length > 0 && result.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.text }}>{item.name}</span>
                <span style={{ color: C.gold, fontWeight: 500 }}>{item.calories} kcal</span>
              </div>
            ))}
            {result.note && <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', marginTop: 10, lineHeight: 1.6 }}>{result.note}</div>}
            <GoldBtn onClick={() => onLog({ name: result.meal, cal: result.calories, p: result.protein, c: result.carbs, f: result.fat })} style={{ width: '100%', padding: 13, marginTop: 14 }}>+ Log this meal</GoldBtn>
          </Card>
      )}
    </div>
  )
}

// ── Calorie Calculator ─────────────────────────────────────────────────────

function CalorieCalculator({ onApply }) {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: 'male', activity: '1.55', goal: 'maintain' })
  const [result, setResult] = useState(null)
  const [aiTip, setAiTip] = useState('')
  const [loading, setLoading] = useState(false)

  const goalLabels = { lose_fast: 'Lose 1kg/week', lose: 'Lose 0.5kg/week', maintain: 'Maintain', gain: 'Gain 0.5kg/week', gain_fast: 'Gain 1kg/week' }
  const goalAdj = { lose_fast: -500, lose: -250, maintain: 0, gain: 250, gain_fast: 500 }
  const activities = [['1.2','Sedentary'],['1.375','Lightly active'],['1.55','Moderately active'],['1.725','Very active'],['1.9','Athlete']]

  const calculate = async () => {
    const w = parseFloat(form.weight), h = parseFloat(form.height), a = parseFloat(form.age)
    const bmr = form.gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161
    const tdee = Math.round(bmr * parseFloat(form.activity))
    const target = tdee + goalAdj[form.goal]
    const protein = Math.round(w * 2.2)
    const fat = Math.round((target * 0.25) / 9)
    const carbs = Math.round((target - protein*4 - fat*9) / 4)
    setResult({ bmr: Math.round(bmr), tdee, target, protein, fat, carbs })
    setLoading(true); setAiTip('')
    const tip = await askClaude('You are a certified nutritionist. Give a specific 2-sentence tip. No markdown.', `${form.gender}, ${form.age}yo, ${form.weight}kg, goal: ${goalLabels[form.goal]}, target: ${target} kcal, ${protein}g protein.`)
    setAiTip(tip); setLoading(false)
  }

  const inp = (field, placeholder, type='text') => (
    <input type={type} value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
  )

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 6 }}>Calorie Calculator</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Get your personalized daily calorie & macro targets</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Age</div>{inp('age','25','number')}</div>
          <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Weight (kg)</div>{inp('weight','70','number')}</div>
          <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Height (cm)</div>{inp('height','175','number')}</div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Gender</div>
            <select value={form.gender} onChange={e => setForm(p => ({...p,gender:e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none', appearance: 'none' }}>
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Activity level</div>
          <select value={form.activity} onChange={e => setForm(p => ({...p,activity:e.target.value}))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none', appearance: 'none' }}>
            {activities.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Goal</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(goalLabels).map(([k,v]) => (
              <button key={k} onClick={() => setForm(p => ({...p,goal:k}))} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, border: `1px solid ${form.goal===k?C.gold:C.border}`, background: form.goal===k?C.gold:'transparent', color: form.goal===k?C.dark:C.textMuted }}>{v}</button>
            ))}
          </div>
        </div>
        <GoldBtn onClick={calculate} disabled={!form.age||!form.weight||!form.height} style={{ width: '100%', padding: 13, fontSize: 14 }}>Calculate my targets</GoldBtn>
      </Card>

      {result && (
        <>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: C.surfaceLight, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Resting rate (BMR)</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26 }}>{result.bmr}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>kcal/day</div>
              </div>
              <div style={{ background: C.surfaceLight, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Maintenance (TDEE)</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26 }}>{result.tdee}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>kcal/day</div>
              </div>
            </div>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: `1px solid ${C.borderStrong}`, borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.gold, marginBottom: 4 }}>Your daily target</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, color: C.gold }}>{result.target}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>kcal / day</div>
            </div>
            <MacroBar label="Protein" current={result.protein} goal={result.protein} color={C.blue} />
            <MacroBar label="Carbs" current={result.carbs} goal={result.carbs} color={C.amber} />
            <MacroBar label="Fat" current={result.fat} goal={result.fat} color={C.gold} />
          </Card>
          {(loading || aiTip) && (
            <Card style={{ borderColor: C.borderStrong, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.gold, marginBottom: 8 }}>✨ Nutritionist tip</div>
              {loading ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: C.textMuted, fontSize: 13 }}><Spinner /> Generating tip...</div>
                : <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>{aiTip}</div>}
            </Card>
          )}
          <GoldBtn onClick={() => onApply(result)} style={{ width: '100%', padding: 13, fontSize: 14 }}>Apply {result.target} kcal as my daily goal ✓</GoldBtn>
        </>
      )}
    </div>
  )
}

// ── Calories Tab ───────────────────────────────────────────────────────────

function CaloriesTab({ userId, profile, updateProfile }) {
  const { logs, addFood, removeFood } = useFoodLog(userId)
  const [subTab, setSubTab] = useState('log')
  const [modal, setModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [query, setQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')

  const calorieGoal = profile?.calorie_goal || 2200
  const totalCal = logs.reduce((s, f) => s + f.calories, 0)
  const totalP   = logs.reduce((s, f) => s + (f.protein || 0), 0)
  const totalC   = logs.reduce((s, f) => s + (f.carbs || 0), 0)
  const totalF   = logs.reduce((s, f) => s + (f.fat || 0), 0)
  const filtered = FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  const handleAdd = async (food) => {
    await addFood(food, selectedMeal)
    setModal(false); setQuery('')
  }

  const handleScannerLog = async (food) => {
    await addFood(food, selectedMeal)
    setSubTab('log')
  }

  const handleApplyGoal = async (result) => {
    await updateProfile({ calorie_goal: result.target, protein_goal: result.protein, carbs_goal: result.carbs, fat_goal: result.fat })
    setSubTab('log')
  }

  const getAISuggestion = async () => {
    setAiLoading(true); setAiSuggestion('')
    const tip = await askClaude(
      'You are a nutrition coach. Give a specific 2-sentence suggestion. Be direct.',
      `User has eaten: ${totalCal} kcal, ${totalP}g protein, ${totalC}g carbs, ${totalF}g fat. Daily goal: ${calorieGoal} kcal, ${profile?.protein_goal||150}g protein. What should they eat next?`
    )
    setAiSuggestion(tip); setAiLoading(false)
  }

  if (subTab === 'scanner') return (
    <div>
      <button onClick={() => setSubTab('log')} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20 }}>← Back</button>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Log scanned food to:</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {MEAL_SLOTS.map(s => (
            <button key={s.id} onClick={() => setSelectedMeal(s.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${selectedMeal===s.id?C.gold:C.border}`, background: selectedMeal===s.id?C.goldLight:'transparent', color: selectedMeal===s.id?C.gold:C.textMuted, fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>
      <AIScanner onLog={handleScannerLog} />
    </div>
  )

  if (subTab === 'calc') return (
    <div>
      <button onClick={() => setSubTab('log')} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20 }}>← Back</button>
      <CalorieCalculator onApply={handleApplyGoal} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setSubTab('scanner')} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 13 }}>📷 AI Scanner</button>
        <button onClick={() => setSubTab('calc')} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 13 }}>🧮 Calculator</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatCard icon="🔥" label="Calories" value={totalCal.toLocaleString()} sub={`of ${calorieGoal.toLocaleString()} goal`} color={C.gold} />
        <StatCard icon="📊" label="Remaining" value={Math.max(0, calorieGoal - totalCal).toLocaleString()} sub="kcal left" color={totalCal > calorieGoal ? C.red : C.green} />
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Macros today</div>
        <MacroBar label="Protein" current={totalP} goal={profile?.protein_goal||150} color={C.blue} />
        <MacroBar label="Carbs" current={totalC} goal={profile?.carbs_goal||250} color={C.amber} />
        <MacroBar label="Fat" current={totalF} goal={profile?.fat_goal||73} color={C.gold} />
      </Card>

      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Food log</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {MEAL_SLOTS.map(slot => {
          const items = logs.filter(f => f.meal_slot === slot.id)
          const slotCal = items.reduce((s, f) => s + f.calories, 0)
          return (
            <div key={slot.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: items.length > 0 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{slot.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{slot.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{slot.hint}{slotCal > 0 ? ` · ${slotCal} kcal` : ''}</div>
                  </div>
                </div>
                <button onClick={() => { setSelectedMeal(slot.id); setQuery(''); setModal(true) }} style={{ width: 30, height: 30, borderRadius: '50%', background: 'transparent', border: `1px solid ${C.border}`, color: C.gold, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
              </div>
              {items.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{f.food_name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>P {f.protein}g · C {f.carbs}g · F {f.fat}g</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.gold }}>{f.calories} kcal</span>
                    <button onClick={() => removeFood(f.id)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 20, lineHeight: 1 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <Card style={{ borderColor: C.borderStrong }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiSuggestion ? 10 : 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.gold }}>✨ AI suggestion</div>
          <button onClick={getAISuggestion} disabled={aiLoading} style={{ padding: '5px 12px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {aiLoading ? <><Spinner /> Thinking...</> : 'Ask AI'}
          </button>
        </div>
        {aiSuggestion && <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>{aiSuggestion}</div>}
        {!aiSuggestion && !aiLoading && <div style={{ fontSize: 13, color: C.textMuted }}>Tap "Ask AI" to get a suggestion based on what you've eaten today.</div>}
      </Card>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Add food</div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22 }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Adding to:</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {MEAL_SLOTS.map(s => (
                <button key={s.id} onClick={() => setSelectedMeal(s.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${selectedMeal===s.id?C.gold:C.border}`, background: selectedMeal===s.id?C.goldLight:'transparent', color: selectedMeal===s.id?C.gold:C.textMuted, fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food..." autoFocus
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 12, outline: 'none' }} />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map((f, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{f.cal} kcal · P {f.p}g · C {f.c}g · F {f.f}g</div>
                  </div>
                  <button onClick={() => handleAdd({ name: f.name, cal: f.cal, p: f.p, c: f.c, f: f.f })} style={{ padding: '5px 14px', background: C.gold, color: C.dark, border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// WorkoutsTab is imported from ./components/WorkoutsTab

// ── Plans Tab ──────────────────────────────────────────────────────────────

function PlansTab({ userId }) {
  const [form, setForm] = useState({ goal: '', days: '4', equipment: 'gym', diet: '' })
  const [aiPlan, setAiPlan] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [savedPlans, setSavedPlans] = useState([])

  useEffect(() => {
    supabase.from('ai_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => setSavedPlans(data || []))
  }, [userId])

  const buildPlan = async () => {
    setAiLoading(true); setAiPlan('')
    const plan = await askClaude('You are an expert fitness coach. Create a detailed but concise plan. Plain text only, no markdown symbols. Max 300 words.', `Goal: ${form.goal}, Days: ${form.days}/week, Equipment: ${form.equipment}, Diet: ${form.diet || 'none'}. Include weekly workout schedule and nutrition guidelines.`)
    setAiPlan(plan)
    // Save to Supabase
    await supabase.from('ai_plans').insert({ user_id: userId, plan_type: 'combined', title: form.goal, content: plan, goal: form.goal })
    setAiLoading(false)
  }

  return (
    <div>
      {savedPlans.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved plans</div>
          {savedPlans.slice(0, 2).map(p => (
            <Card key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>{p.title}</div>
                <Badge color={C.green} bg={C.greenLight}>Active</Badge>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{p.content.slice(0, 180)}...</div>
            </Card>
          ))}
          <div style={{ height: 1, background: C.border, margin: '20px 0' }} />
        </>
      )}

      <Card style={{ borderColor: C.borderStrong }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.gold, marginBottom: 14 }}>✨ Build my personalized plan</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Days/week</div>
            <select value={form.days} onChange={e => setForm(p => ({...p,days:e.target.value}))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }}>
              {['2','3','4','5','6'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Equipment</div>
            <select value={form.equipment} onChange={e => setForm(p => ({...p,equipment:e.target.value}))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }}>
              <option value="gym">Full gym</option>
              <option value="home">Home only</option>
              <option value="dumbbells">Dumbbells</option>
              <option value="none">No equipment</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Your main goal</div>
          <input value={form.goal} onChange={e => setForm(p => ({...p,goal:e.target.value}))} placeholder="e.g. Lose 10kg and build muscle" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Diet preference (optional)</div>
          <input value={form.diet} onChange={e => setForm(p => ({...p,diet:e.target.value}))} placeholder="e.g. vegetarian, high protein, no dairy" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
        </div>
        <GoldBtn onClick={buildPlan} disabled={aiLoading || !form.goal.trim()} style={{ width: '100%', padding: 13 }}>
          {aiLoading ? 'Building your plan...' : 'Build my plan ✨'}
        </GoldBtn>
        {aiLoading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}><Spinner /></div>}
        {aiPlan && <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8, marginTop: 16, whiteSpace: 'pre-line', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>{aiPlan}</div>}
      </Card>
    </div>
  )
}

// ── Insights Tab ───────────────────────────────────────────────────────────

function InsightsTab({ userId }) {
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const weekData = [88, 95, 72, 84, 0, 0, 0]

  const getAnalysis = async () => {
    setAiLoading(true); setAiAnalysis('')
    const analysis = await askClaude('You are a fitness coach. Give 3 specific numbered insights. Plain text only, no markdown.', 'User this week: 4 workouts, avg 1,847 kcal/day (goal 2,200), 7h12m sleep, 8,234 steps/day, 108g protein (goal 150g). Resting HR dropped from 68 to 63 over 4 weeks.')
    setAiAnalysis(analysis); setAiLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        <StatCard icon="📅" label="Days logged" value="4" sub="this week" color={C.gold} />
        <StatCard icon="🏆" label="Streak" value="4" sub="days" color={C.amber} />
        <StatCard icon="💪" label="Workouts" value="3" sub="this week" color={C.green} />
      </div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calorie compliance</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
          {weekData.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', background: i===3?C.gold:v>0?C.green:C.surfaceLight, borderRadius: '3px 3px 0 0', height: v>0?`${Math.round((v/95)*60)}px`:4, minHeight: 4 }} />
              <div style={{ fontSize: 10, color: i===3?C.gold:C.textMuted }}>{['M','T','W','T','F','S','S'][i]}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ borderColor: C.borderStrong, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiAnalysis ? 14 : 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.gold }}>✨ AI deep analysis</div>
          <GoldBtn onClick={getAnalysis} disabled={aiLoading} style={{ padding: '6px 14px', fontSize: 12 }}>
            {aiLoading ? <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Spinner /> Analyzing...</span> : 'Analyze my week'}
          </GoldBtn>
        </div>
        {!aiAnalysis && !aiLoading && <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>Get AI-powered insights based on your week's data.</div>}
        {aiAnalysis && <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{aiAnalysis}</div>}
      </Card>
      {[
        { color: C.green, title: 'Consistency up 18%', body: "You've logged every meal and hit your step goal 4 out of 4 days — your best streak this month." },
        { color: C.amber, title: 'Protein dips on rest days', body: 'Your protein drops ~30g on non-workout days. A snack like cottage cheese can close that gap.' },
        { color: C.blue, title: 'Sleep improves after workouts', body: 'Deep sleep averages 22 minutes longer on workout nights. Evening sessions work well for you.' },
        { color: C.gold, title: 'Heart rate trending down', body: 'Resting HR dropped from 68 to 63 bpm over 4 weeks — your cardiovascular fitness is improving.' },
      ].map((ins, i) => (
        <Card key={i} style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
          <div style={{ width: 4, borderRadius: 2, background: ins.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{ins.title}</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{ins.body}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ user, profile, updateProfile }) {
  const [form, setForm] = useState({ full_name: '', age: '', weight_kg: '', height_cm: '', primary_goal: 'Build muscle' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || '', age: profile.age || '', weight_kg: profile.weight_kg || '', height_cm: profile.height_cm || '', primary_goal: profile.primary_goal || 'Build muscle' })
  }, [profile])

  const save = async () => {
    setSaving(true)
    await updateProfile({ ...form, age: parseInt(form.age) || null, weight_kg: parseFloat(form.weight_kg) || null, height_cm: parseFloat(form.height_cm) || null })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inp = (field, placeholder, type='text') => (
    <input type={type} value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
  )

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.goldLight, border: `2px solid ${C.gold}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: 28, color: C.gold }}>
          {(form.full_name || user?.email || 'A')[0].toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>{form.full_name || 'Your name'}</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{user?.email}</div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personal info</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Full name</div>{inp('full_name','Your name')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Age</div>{inp('age','25','number')}</div>
            <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Weight kg</div>{inp('weight_kg','70','number')}</div>
            <div><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Height cm</div>{inp('height_cm','175','number')}</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Primary goal</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Lose weight','Build muscle','Improve endurance','General health'].map(g => (
            <button key={g} onClick={() => setForm(p => ({...p,primary_goal:g}))} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, border: `1px solid ${form.primary_goal===g?C.gold:C.border}`, background: form.primary_goal===g?C.goldLight:'transparent', color: form.primary_goal===g?C.gold:C.textMuted }}>{g}</button>
          ))}
        </div>
      </Card>

      <GoldBtn onClick={save} disabled={saving} style={{ width: '100%', padding: 13, fontSize: 14, marginBottom: 14 }}>
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save profile'}
      </GoldBtn>

      <Card>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Connected services</div>
        {[['❤️ Apple Health', true],['⌚ Apple Watch', true],['🏃 Strava', false]].map(([s, c]) => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13 }}>{s}</span>
            <Badge color={c?C.green:C.textMuted} bg={c?C.greenLight:C.surfaceLight}>{c?'Connected':'Connect'}</Badge>
          </div>
        ))}
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.red, fontSize: 13 }}>Sign out</button>
      </Card>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Today', icon: '🏠' },
  { id: 'calories',  label: 'Calories', icon: '🔥' },
  { id: 'workouts',  label: 'Workouts', icon: '💪' },
  { id: 'plans',     label: 'Plans', icon: '📅' },
  { id: 'insights',  label: 'Insights', icon: '📊' },
  { id: 'profile',   label: 'Profile', icon: '👤' },
]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [tab, setTab] = useState('dashboard')
  const [waterCups, setWaterCups] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const { profile, updateProfile } = useProfile(session?.user?.id)
  const { logs } = useFoodLog(session?.user?.id)

  // Load today's water
  useEffect(() => {
    if (!session?.user?.id) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('water_logs').select('cups').eq('user_id', session.user.id).eq('log_date', today).single().then(({ data }) => { if (data) setWaterCups(data.cups) })
  }, [session?.user?.id])

  if (session === undefined) return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, color: C.gold, marginBottom: 16 }}>Auron</div>
        <Spinner />
      </div>
    </div>
  )

  if (!session) return <Auth />

  const user = session.user
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const screens = {
    dashboard: <TodayTab userId={user.id} profile={profile} updateProfile={updateProfile} key={user.id} />,
    calories:  <CaloriesTab userId={user.id} profile={profile} updateProfile={updateProfile} />,
    workouts:  <WorkoutsTab userId={user.id} key="workouts" />,
    plans:     <PlansTab userId={user.id} />,
    insights:  <InsightsTab userId={user.id} />,
    profile:   <ProfileTab user={user} profile={profile} updateProfile={updateProfile} />,
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, letterSpacing: '0.06em' }}>{today.toUpperCase()}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: C.gold }}>Auron</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />Synced
              </div>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.surfaceLight, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔔</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '20px 20px 100px', overflowY: 'auto' }}>
            {screens[tab]}
          </div>

          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '8px 0 20px', zIndex: 50 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: '6px 0', color: tab===t.id?C.gold:C.textMuted }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: tab===t.id?500:400 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
