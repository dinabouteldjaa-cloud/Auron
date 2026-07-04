import { searchFoods, LOCAL_DB } from '../lib/foodSearch.js'
import { toUserDateStr } from '../lib/dateUtils.js'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { askMealSuggestion, estimateMealFromDescription } from '../lib/claude'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'

// Map theme tokens to local alias
const C = {
  gold:         T.purple,
  goldLight:    T.purpleLight,
  goldDark:     T.purpleDark,
  dark:         T.pageBg,
  surface:      T.surface,
  surfaceLight: T.surfaceMid,
  border:       T.border,
  borderStrong: T.borderStrong,
  text:         T.text,
  textMuted:    T.textMuted,
  textDim:      T.textDim,
  green:        T.green,
  greenLight:   T.greenLight,
  red:          T.red,
  redLight:     T.redLight,
  blue:         T.blue,
  amber:        T.amber,
}

const getMealSlotsNutrition = (t) => [
  { id: 'breakfast', label: t('meals.breakfast'), icon: '🌅', hint: t('cal.mealTime.breakfast') },
  { id: 'lunch',     label: t('meals.lunch'),     icon: '☀️',  hint: t('cal.mealTime.lunch')    },
  { id: 'snack',     label: t('meals.snack'),     icon: '🍎',  hint: t('cal.mealTime.snack')    },
  { id: 'dinner',    label: t('meals.dinner'),    icon: '🌙',  hint: t('cal.mealTime.dinner')   },
]

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 16,
      border: `1px solid ${T.divider}`,
      boxShadow: T.shadowCard,
      padding: '16px 18px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: C.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: `2px solid ${C.border}`, borderTopColor: C.gold,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      display: 'inline-block', flexShrink: 0,
    }} />
  )
}

function MacroBar({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>
          {Math.round(current)}g / {goal}g
        </span>
      </div>
      <div style={{ height: 5, background: C.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI Describe & Estimate meal
// ─────────────────────────────────────────────
function DescribeMeal({ preferences, onLog, onBack, lang = 'en' }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [desc,    setDesc]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [meal,    setMeal]    = useState('breakfast')

  const analyze = async () => {
    if (!desc.trim()) return
    setLoading(true); setResult(null)
    try {
      const raw   = await estimateMealFromDescription(preferences, desc, lang)
      const clean = raw.replace(/```json|```/g, '').trim()
      setResult(JSON.parse(clean))
    } catch {
      setResult({ error: 'Could not estimate. Try describing in more detail — include portion sizes.' })
    }
    setLoading(false)
  }

  const confColor = { high: C.green, medium: C.amber, low: C.red }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>
        ← Back
      </button>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 6 }}>{t('cal.describeTitle')}</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
        {t('cal.describeSubtitle')}
      </div>

      {/* Meal slot selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Log to:</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {MEAL_SLOTS.map(s => (
            <button key={s.id} onClick={() => setMeal(s.id)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${meal === s.id ? C.gold : C.border}`,
              background: meal === s.id ? C.goldLight : 'transparent',
              color: meal === s.id ? C.gold : C.textMuted,
              fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Describe your meal</div>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          placeholder="e.g. A large plate of spaghetti bolognese with ground beef, tomato sauce and parmesan. About 300g of pasta total..."
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            background: C.surfaceLight, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 13, resize: 'none', outline: 'none',
            lineHeight: 1.6, marginBottom: 12,
          }}
        />
        <button
          onClick={analyze}
          disabled={loading || !desc.trim()}
          style={{
            width: '100%', padding: 13, borderRadius: 24,
            background: loading || !desc.trim() ? C.surfaceLight : C.gold,
            color: loading || !desc.trim() ? C.textMuted : C.dark,
            border: 'none', fontSize: 13, fontWeight: 500,
            cursor: desc.trim() && !loading ? 'pointer' : 'default',
          }}
        >
          {loading ? t('cal.estimating') : t('cal.estimateBtn')}
        </button>
      </Card>

      {/* Preferences active notice */}
      {(preferences?.dietary_preferences?.length > 0 || preferences?.allergies?.length > 0 || preferences?.avoided_foods?.length > 0) && (
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, padding: '10px 14px', background: C.surfaceLight, borderRadius: 10, lineHeight: 1.5 }}>
          Your dietary preferences and restrictions are applied to this estimate.
        </div>
      )}

      {loading && (
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <Spinner />
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Analyzing your meal...</div>
        </Card>
      )}

      {result && !loading && (
        result.error
          ? <Card style={{ borderColor: C.red }}><div style={{ fontSize: 13, color: C.red }}>{result.error}</div></Card>
          : <Card style={{ borderColor: C.borderStrong }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, flex: 1 }}>{result.meal}</div>
                {result.confidence && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${confColor[result.confidence]}22`, color: confColor[result.confidence], fontWeight: 500, marginLeft: 8 }}>
                    {result.confidence} confidence
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                {[['Calories', result.calories, 'kcal', C.gold], [t('cal.protein'), result.protein, 'g', C.blue], [t('cal.carbs'), result.carbs, 'g', C.amber], ['Fat', result.fat, 'g', C.green]].map(([l, v, u, col]) => (
                  <div key={l} style={{ background: C.surfaceLight, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: col }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{u} {l}</div>
                  </div>
                ))}
              </div>
              {result.items?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {result.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: C.text }}>{item.name}</span>
                      <span style={{ color: C.gold, fontWeight: 500 }}>{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
              {result.note && (
                <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.6 }}>
                  {result.note}
                </div>
              )}
              <button
                onClick={() => onLog({ name: result.meal, cal: result.calories, p: result.protein, c: result.carbs, f: result.fat }, meal)}
                style={{ width: '100%', padding: 13, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                + Log this meal
              </button>
            </Card>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: C.textDim, marginTop: 16, lineHeight: 1.6, textAlign: 'center' }}>
        {t('disclaimer.line1')}<br />
        {t('disclaimer.line2')}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI Suggestion card
// ─────────────────────────────────────────────
function AISuggestionCard({ preferences, totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF, lang = 'en' }) {
  const { t } = useTranslation()
  const [suggestion, setSuggestion] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [fetched,    setFetched]    = useState(false)

  const getSuggestion = async () => {
    setLoading(true); setSuggestion('')
    const result = await askMealSuggestion(preferences, {
      totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF,
    }, lang)
    setSuggestion(result); setLoading(false); setFetched(true)
  }

  // Show active restrictions so user knows they're being respected
  const activeRestrictions = [
    ...(preferences?.dietary_preferences || []),
    ...(preferences?.allergies || []),
  ]

  return (
    <Card style={{ borderColor: C.borderStrong, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: fetched || loading ? 12 : 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{t('cal.aiSuggest')}</div>
          {activeRestrictions.length > 0 && (
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>
              Respecting: {activeRestrictions.slice(0, 3).join(', ')}{activeRestrictions.length > 3 ? ` +${activeRestrictions.length - 3} more` : ''}
            </div>
          )}
        </div>
        <button
          onClick={getSuggestion}
          disabled={loading}
          style={{
            padding: '6px 14px', borderRadius: 12,
            background: 'transparent', border: `1px solid ${C.border}`,
            color: C.textMuted, fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}
        >
          {loading ? <><Spinner /> Thinking...</> : fetched ? t('cal.refresh') : t('cal.askAI')}
        </button>
      </div>
      {!fetched && !loading && (
        <div style={{ fontSize: 13, color: C.textMuted }}>
          {t('cal.tapAsk')}
        </div>
      )}
      {loading && !suggestion && (
        <div style={{ fontSize: 13, color: C.textMuted }}>Generating suggestion...</div>
      )}
      {suggestion && (
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.65 }}>{suggestion}</div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Add food modal — live search via USDA + Open Food Facts
// ─────────────────────────────────────────────
function AddFoodModal({ selectedMeal, setSelectedMeal, onAdd, onClose }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState(LOCAL_DB.slice(0, 20))
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(null)  // food being customized
  const [qty,      setQty]      = useState('1')   // multiplier
  const debounceRef = useRef(null)

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults(LOCAL_DB.slice(0, 20)); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchFoods(query)
      setResults(res)
      setLoading(false)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const scale  = parseFloat(qty) || 1
  const scaled = selected ? {
    cal:    Math.round(selected.cal * scale),
    p:      Math.round(selected.p   * scale),
    c:      Math.round(selected.c   * scale),
    f:      Math.round(selected.f   * scale),
    fiber:  Math.round((selected.fiber  || 0) * scale),
    sodium: Math.round((selected.sodium || 0) * scale),
  } : null

  const handleAdd = () => {
    if (!selected) return
    onAdd({
      name:     `${selected.name}${scale !== 1 ? ` ×${qty}` : ''}`,
      calories: scaled.cal,
      protein:  scaled.p,
      carbs:    scaled.c,
      fat:      scaled.f,
    }, selectedMeal)
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.55)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:T.shadowStrong }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:18, fontWeight:700, color:T.text }}>
            {selected ? selected.name.slice(0, 28) + (selected.name.length > 28 ? '…' : '') : t('cal.addFood').replace('+ ','')}
          </div>
          <button onClick={selected ? () => setSelected(null) : onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:22, cursor:'pointer' }}>
            {selected ? '‹' : '×'}
          </button>
        </div>

        {/* ── Food detail view ── */}
        {selected ? (
          <div style={{ flex:1, overflowY:'auto' }}>
            {/* Nutrition summary */}
            <div style={{ background:T.purpleLight, borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                {[['Kcal', scaled.cal, T.purple], ['Protein', `${scaled.p}g`, T.blue], ['Carbs', `${scaled.c}g`, T.amber], ['Fat', `${scaled.f}g`, T.red]].map(([l,v,c]) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
                    <div style={{ fontSize:10, color:T.textMuted }}>{l}</div>
                  </div>
                ))}
              </div>
              {(scaled.fiber > 0 || scaled.sodium > 0) && (
                <div style={{ display:'flex', gap:16, fontSize:11, color:T.textMuted, borderTop:`1px solid ${T.border}`, paddingTop:8 }}>
                  {scaled.fiber  > 0 && <span>Fiber: {scaled.fiber}g</span>}
                  {scaled.sodium > 0 && <span>Sodium: {scaled.sodium}mg</span>}
                  <span style={{ marginLeft:'auto', color:T.textDim }}>{selected.source}</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:8, fontWeight:500 }}>
                Quantity <span style={{ color:T.textDim }}>({selected.serving} × qty)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={() => setQty(q => String(Math.max(0.5, parseFloat(q)-0.5)))}
                  style={{ width:40, height:40, borderRadius:12, background:T.purpleLight, border:'none', fontSize:20, color:T.purple, cursor:'pointer', fontWeight:700 }}>−</button>
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="0.5" step="0.5"
                  style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:12, border:`1px solid ${T.border}`, background:T.surfaceMid, fontSize:16, fontWeight:700, color:T.text, outline:'none' }} />
                <button onClick={() => setQty(q => String(parseFloat(q)+0.5))}
                  style={{ width:40, height:40, borderRadius:12, background:T.purpleLight, border:'none', fontSize:20, color:T.purple, cursor:'pointer', fontWeight:700 }}>+</button>
              </div>
            </div>

            {/* Meal slot */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:8, fontWeight:500 }}>{t('cal.logTo')}</div>
              <div style={{ display:'flex', gap:6 }}>
                {MEAL_SLOTS.map(s => (
                  <button key={s.id} onClick={() => setSelectedMeal(s.id)} style={{ flex:1, padding:'8px 4px', borderRadius:10, cursor:'pointer', border:`1px solid ${selectedMeal===s.id ? T.purple : T.border}`, background:selectedMeal===s.id ? T.purpleLight : 'transparent', color:selectedMeal===s.id ? T.purple : T.textMuted, fontSize:11, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <span style={{ fontSize:15 }}>{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleAdd} style={{ width:'100%', padding:13, borderRadius:24, background:T.purple, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer' }}>
              + {t('cal.logMeal').replace('+ ','').replace('Log this meal','Log')} {scaled.cal} kcal
            </button>
          </div>
        ) : (
          /* ── Search view ── */
          <>
            {/* Meal slot tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:12 }}>
              {MEAL_SLOTS.map(s => (
                <button key={s.id} onClick={() => setSelectedMeal(s.id)} style={{ flex:1, padding:'8px 4px', borderRadius:10, cursor:'pointer', border:`1px solid ${selectedMeal===s.id ? T.purple : T.border}`, background:selectedMeal===s.id ? T.purpleLight : 'transparent', color:selectedMeal===s.id ? T.purple : T.textMuted, fontSize:11, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <span style={{ fontSize:15 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('cal.searchFood')} autoFocus
                style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:12, background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text, fontSize:14, outline:'none' }} />
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
              {loading && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:11, color:T.purple }}>Searching…</span>}
            </div>

            {/* Source badge */}
            {query.length > 1 && !loading && (
              <div style={{ fontSize:11, color:T.textDim, marginBottom:8 }}>
                {results.length} results · USDA + Open Food Facts
              </div>
            )}

            {/* Results */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {results.map((f) => (
                <button key={f.id} onClick={() => { setSelected(f); setQty('1') }}
                  style={{ width:'100%', padding:'12px 0', borderBottom:`1px solid ${T.divider}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', borderBottom:`1px solid ${T.divider}`, cursor:'pointer', textAlign:'left' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:2 }}>{f.name}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                      {f.brand && <span>{f.brand} · </span>}
                      <span style={{ color:T.purple, fontWeight:600 }}>{f.cal} kcal</span>
                      <span> · P {f.p}g · C {f.c}g · F {f.f}g</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:T.textDim, marginLeft:8, flexShrink:0 }}>{f.serving}</div>
                </button>
              ))}
              {results.length === 0 && !loading && (
                <div style={{ padding:'30px 0', textAlign:'center', color:T.textMuted, fontSize:13 }}>
                  {t('cal.noResults')} "{query}"
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main CaloriesTab
// ─────────────────────────────────────────────
export default function CaloriesTab({ userId, profile, preferences, lang = 'en' }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [logs,         setLogs]         = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [subView,      setSubView]      = useState('log') // 'log' | 'describe'

  const today = toUserDateStr(profile?.timezone)
  const calorieGoal   = profile?.calorie_goal || 2200
  const proteinGoal   = profile?.protein_goal || 150
  const carbsGoal     = profile?.carbs_goal   || 250
  const fatGoal       = profile?.fat_goal     || 73

  useEffect(() => {
    if (!userId) return
    supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
  }, [userId])

  const addFood = async (food, meal) => {
    const entry = {
      user_id:   userId,
      log_date:  today,
      meal_slot: meal,
      food_name: food.name,
      calories:  food.calories ?? food.cal ?? 0,
      protein:   food.protein  ?? food.p   ?? 0,
      carbs:     food.carbs    ?? food.c   ?? 0,
      fat:       food.fat      ?? food.f   ?? 0,
    }
    const { data, error } = await supabase.from('food_logs').insert(entry).select().single()
    if (!error) setLogs(prev => [...prev, data])
  }

  const removeFood = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(f => f.id !== id))
  }

  const totalCal = logs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalP   = logs.reduce((s, f) => s + (f.protein  || 0), 0)
  const totalC   = logs.reduce((s, f) => s + (f.carbs    || 0), 0)
  const totalF   = logs.reduce((s, f) => s + (f.fat      || 0), 0)

  if (subView === 'describe') {
    return (
      <DescribeMeal
        preferences={preferences}
        lang={lang}
        onLog={(food, meal) => { addFood(food, meal); setSubView('log') }}
        onBack={() => setSubView('log')}
      />
    )
  }

  return (
    <div>
      {/* AI Describe button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setSubView('describe')}
          style={{
            width: '100%', padding: 11, borderRadius: 12,
            border: `1px solid ${C.border}`, background: C.surfaceLight,
            color: C.text, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {t('cal.describeBtn')}
        </button>
      </div>

      {/* Calorie summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: C.surfaceLight, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{t('cal.caloriesLabel')}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.gold }}>{totalCal.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{t('cal.ofGoal').replace('{n}', calorieGoal.toLocaleString())}</div>
        </div>
        <div style={{ background: C.surfaceLight, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{t('cal.remaining')}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalCal > calorieGoal ? C.red : C.green }}>
            {Math.abs(calorieGoal - totalCal).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{totalCal > calorieGoal ? t('cal.kcalOver') : t('cal.kcalLeft')}</div>
        </div>
      </div>

      {/* Macros */}
      <Card style={{ marginBottom: 20 }}>
        <Label>{t('cal.macrosToday')}</Label>
        <MacroBar label={t('cal.protein')} current={totalP} goal={proteinGoal} color={C.blue}  />
        <MacroBar label={t('cal.carbs')}   current={totalC} goal={carbsGoal}   color={C.amber} />
        <MacroBar label={t('cal.fat')}     current={totalF} goal={fatGoal}     color={C.gold}  />
      </Card>

      {/* AI Suggestion */}
      <AISuggestionCard
        preferences={preferences}
        lang={lang}
        totalCal={totalCal}   calorieGoal={calorieGoal}
        totalP={totalP}       proteinGoal={proteinGoal}
        totalC={totalC}       totalF={totalF}
      />

      {/* Food log by meal slot */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Label style={{ marginBottom: 0 }}>{t('cal.foodLog')}</Label>
          <button
            onClick={() => setModal(true)}
            style={{ padding: '6px 14px', borderRadius: 20, background: C.gold, color: C.dark, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {t('cal.addFood')}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: C.textMuted }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MEAL_SLOTS.map(slot => {
              const items    = logs.filter(f => f.meal_slot === slot.id)
              const slotCal  = items.reduce((s, f) => s + (f.calories || 0), 0)
              const hasItems = items.length > 0

              return (
                <div
                  key={slot.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${hasItems ? C.borderStrong : C.border}`,
                    borderRadius: 14, overflow: 'hidden',
                  }}
                >
                  {/* Slot header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: hasItems ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: hasItems ? C.goldLight : C.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                        {slot.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{slot.label}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                          {hasItems ? `${items.length} item${items.length > 1 ? 's' : ''} · ${slotCal} kcal` : slot.hint}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {slotCal > 0 && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{slotCal}</span>
                      )}
                      <button
                        onClick={() => { setSelectedMeal(slot.id); setModal(true) }}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: `1px solid ${C.border}`, color: C.gold, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  {items.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{f.food_name}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>P {f.protein}g · C {f.carbs}g · F {f.fat}g</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.gold }}>{f.calories} kcal</span>
                        <button onClick={() => removeFood(f.id)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: C.textDim, marginTop: 20, lineHeight: 1.6, textAlign: 'center' }}>
        {t('disclaimer.line1')}<br />
        {t('disclaimer.line2')}
      </div>

      {/* Add food modal */}
      {modal && (
        <AddFoodModal
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
          onAdd={addFood}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  )
}
