import { searchFoods, LOCAL_DB } from '../lib/foodSearch.js'
import { toUserDateStr } from '../lib/dateUtils.js'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { askMealSuggestion, estimateMealFromDescription } from '../lib/claude'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import { TabAuronCard, AuronCharacter } from './CoachAuron'

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
const MEAL_EXAMPLES = [
  'Chicken shawarma plate with fries',
  'Tuna sandwich and juice',
  'Homemade pasta with beef',
  'Grilled chicken with rice',
  'Steak with mashed potatoes',
]

// Full-screen shell shared by every step of the meal estimator flow.
// Defined at module level (not inside DescribeMeal) so its identity stays
// stable across re-renders — otherwise React would treat it as a brand
// new component type on every keystroke, force-remounting Auron (causing
// the flashing) and the textarea (causing the cursor to jump to the start
// on every character, which reversed typed text).
function MealFlowShell({ mood, children, onBackClick, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F7F6FB', zIndex: 300, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ padding: '18px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBackClick} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1 }}>‹</button>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 24px 32px' }}>
        <div style={{ marginBottom: 18 }}>
          <AuronCharacter mood={mood} size="onboarding" />
        </div>
        <div style={{ width: '100%' }}>{children}</div>
      </div>
    </div>
  )
}

function DescribeMeal({ preferences, profile, onLog, onSave, onBack, lang = 'en' }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const firstName = profile?.full_name?.split(' ')[0] || ''
  const fr = lang === 'fr'

  const [screen,       setScreen]       = useState('welcome') // 'welcome' | 'describe' | 'flow'
  const [meal,         setMeal]         = useState('breakfast')
  const [desc,         setDesc]         = useState('')
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [questions,    setQuestions]    = useState(null)   // array of clarifying questions, or null
  const [answerDrafts, setAnswerDrafts] = useState({})      // question -> typed answer
  const [saved,        setSaved]        = useState(false)
  const [showSaveModal,setShowSaveModal]= useState(false)
  const [saveName,     setSaveName]     = useState('')

  // Stable per-visit "seed" so Auron doesn't re-roll variety on every
  // re-render, but still varies between separate visits to this flow.
  const [seed] = useState(() => Math.floor(Math.random() * 1000))
  const pick = (arr) => arr[seed % arr.length]

  // ── Existing estimation logic — unchanged ──────────────────────
  const parseResponse = (raw) => {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }

  // Guards against a malformed/empty AI response rendering a blank estimate
  // card (e.g. a meal name and no numbers) — purely a display safeguard,
  // doesn't touch the estimation call or clarification logic itself.
  const isValidEstimate = (parsed) =>
    parsed && typeof parsed.meal === 'string' && parsed.meal.trim().length > 0 &&
    Number.isFinite(parsed.calories) && parsed.calories > 0

  const estimateErrorMsg = fr
    ? "Je n'ai pas pu obtenir une estimation claire. Réessayez avec un peu plus de détails."
    : "I couldn't get a clear estimate. Try again with a bit more detail."

  const analyze = async () => {
    if (!desc.trim()) return
    setScreen('flow')
    setLoading(true); setResult(null); setQuestions(null); setSaved(false)
    try {
      const raw    = await estimateMealFromDescription(preferences, desc, lang)
      const parsed = parseResponse(raw)
      if (parsed.needsClarification && parsed.questions?.length > 0) {
        setQuestions(parsed.questions)
        setAnswerDrafts(Object.fromEntries(parsed.questions.map(q => [q, ''])))
      } else if (isValidEstimate(parsed)) {
        setResult(parsed)
      } else {
        setResult({ error: estimateErrorMsg })
      }
    } catch {
      setResult({ error: fr ? "Impossible d'estimer. Essayez de décrire avec plus de détails — précisez les quantités." : 'Could not estimate. Try describing in more detail — include portion sizes.' })
    }
    setLoading(false)
  }

  const submitAnswers = async () => {
    setLoading(true); setSaved(false)
    try {
      const raw    = await estimateMealFromDescription(preferences, desc, lang, { answers: answerDrafts })
      const parsed = parseResponse(raw)
      setResult(isValidEstimate(parsed) ? parsed : { error: estimateErrorMsg })
      setQuestions(null)
    } catch {
      setResult({ error: fr ? "Impossible d'estimer. Essayez de décrire avec plus de détails — précisez les quantités." : 'Could not estimate. Try describing in more detail — include portion sizes.' })
      setQuestions(null)
    }
    setLoading(false)
  }
  // ── End unchanged estimation logic ─────────────────────────────

  const editMeal = () => {
    setResult(null); setQuestions(null); setSaved(false)
    setScreen('describe')
  }

  const confColor = { high: C.green, medium: C.amber, low: C.red }

  // ── Personalized welcome — name shown here, not repeated later ──
  const welcomeLines = firstName
    ? [
        [`${fr ? 'Salut' : 'Hi'} ${firstName} 👋`, fr ? 'Enregistrons ton repas.' : "Let's log your meal."],
        [`${fr ? 'Bon retour,' : 'Welcome back,'} ${firstName}.`, fr ? 'Quel repas enregistrons-nous aujourd\'hui ?' : 'Which meal are we logging today?'],
        [`${fr ? 'Bonjour' : 'Good morning'}, ${firstName}.`, fr ? 'Prêt à enregistrer un repas ?' : 'Ready to log a meal?'],
      ]
    : [
        [fr ? 'Salut 👋' : 'Hi there 👋', fr ? 'Enregistrons ton repas.' : "Let's log your meal."],
      ]
  const [welcomeHeadline, welcomeSub] = pick(welcomeLines)

  const describeCaptions = fr
    ? ['Parfait.', 'Super choix.', 'Allons-y.']
    : ['Perfect.', 'Great choice.', "Let's go."]

  const estimatingCaptions = fr
    ? ["Auron estime ton repas...", "Laisse-moi réfléchir...", "Analyse en cours..."]
    : ['Auron is estimating your meal...', 'Let me think about that...', 'Analyzing your meal...']

  // ── Step 1 — Welcome & meal selection ───────────────────────────
  if (screen === 'welcome') {
    return (
      <MealFlowShell mood="greeting" onBackClick={onBack} onClose={onBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: C.text, marginBottom: 6 }}>{welcomeHeadline}</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>{welcomeSub}</div>
        </div>
        <div style={{ fontSize: 12, color: C.textDim, textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {fr ? 'Quel repas est-ce ?' : 'Which meal was this?'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEAL_SLOTS.map(s => (
            <button key={s.id} onClick={() => { setMeal(s.id); setScreen('describe') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 18,
                border: `2px solid ${C.divider}`, background: C.surface, cursor: 'pointer', textAlign: 'left',
                boxShadow: C.shadowCard,
              }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{s.label}</span>
              <span style={{ marginLeft: 'auto', color: C.textDim, fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
      </MealFlowShell>
    )
  }

  // ── Step 2 — Meal description ───────────────────────────────────
  if (screen === 'describe') {
    return (
      <MealFlowShell mood="nutrition" onBackClick={() => setScreen('welcome')} onClose={onBack}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 6 }}>{pick(describeCaptions)}</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>{fr ? 'Dis-moi ce que tu as mangé.' : 'Tell me what you ate.'}</div>
        </div>

        <textarea
          autoFocus
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          placeholder={fr ? 'ex. Un grand plat de shawarma au poulet avec frites...' : 'e.g. A large chicken shawarma plate with fries...'}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 16,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 14, resize: 'vertical', outline: 'none',
            lineHeight: 1.6, marginBottom: 14, minHeight: 100, boxSizing: 'border-box',
            boxShadow: C.shadowCard,
          }}
        />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            {fr ? 'Exemples' : 'Examples'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MEAL_EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setDesc(ex)}
                style={{ padding: '7px 12px', borderRadius: 20, background: C.goldLight, border: `1px solid ${C.gold}33`, color: C.gold, fontSize: 12, cursor: 'pointer' }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={!desc.trim()}
          style={{
            width: '100%', padding: 15, borderRadius: 24,
            background: desc.trim() ? C.gold : C.surfaceLight,
            color: desc.trim() ? C.dark : C.textMuted,
            border: 'none', fontSize: 14, fontWeight: 600,
            cursor: desc.trim() ? 'pointer' : 'default',
          }}
        >
          {fr ? 'Continuer →' : 'Continue →'}
        </button>
      </MealFlowShell>
    )
  }

  // ── Step 3/4/5 — Estimating / Clarify / Result (existing logic) ─
  return (
    <MealFlowShell mood={loading ? 'thinking' : (result && !result.error) ? 'happy' : questions ? 'thinking' : 'nutrition'} onBackClick={editMeal} onClose={onBack}>
      {loading && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{pick(estimatingCaptions)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}><Spinner /></div>
        </div>
      )}

      {!loading && questions && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              {fr ? 'Juste quelques précisions' : 'Just a few quick details'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
            {questions.map((q, i) => (
              <div key={i}>
                <div style={{ fontSize: 13.5, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{q}</div>
                <input
                  value={answerDrafts[q] || ''}
                  onChange={e => setAnswerDrafts(prev => ({ ...prev, [q]: e.target.value }))}
                  placeholder={fr ? 'Ta réponse...' : 'Your answer...'}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 14,
                    background: C.surface, border: `1px solid ${C.border}`,
                    color: C.text, fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
                    boxShadow: C.shadowCard,
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={submitAnswers}
            style={{ width: '100%', padding: 14, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}
          >
            {fr ? "Obtenir l'estimation" : 'Get my estimate'}
          </button>
          <button
            onClick={submitAnswers}
            style={{ width: '100%', padding: 0, background: 'none', border: 'none', color: C.textMuted, fontSize: 12.5, cursor: 'pointer' }}
          >
            {fr ? 'Passer et estimer quand même' : 'Skip and estimate anyway'}
          </button>
        </div>
      )}

      {!loading && result && (
        result.error ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: C.red, marginBottom: 16 }}>{result.error}</div>
            <button onClick={editMeal}
              style={{ padding: '11px 24px', borderRadius: 20, background: C.gold, color: C.dark, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {fr ? 'Réessayer' : 'Try again'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {fr ? "Estimation d'Auron" : "Auron's Estimate"}
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{result.meal}</div>
              {result.confidence && (
                <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, padding: '3px 12px', borderRadius: 20, background: `${confColor[result.confidence]}22`, color: confColor[result.confidence], fontWeight: 600 }}>
                  {fr ? 'Confiance' : 'Confidence'}: {result.confidence === 'high' ? (fr?'Élevée':'High') : result.confidence === 'medium' ? (fr?'Moyenne':'Medium') : (fr?'Faible':'Low')}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
              {[['Calories', result.calories, 'kcal', C.gold], [t('cal.protein'), result.protein, 'g', C.blue], [t('cal.carbs'), result.carbs, 'g', C.amber], ['Fat', result.fat, 'g', C.green]].map(([l, v, u, col]) => (
                <div key={l} style={{ background: C.surface, borderRadius: 12, padding: '10px 8px', textAlign: 'center', boxShadow: C.shadowCard }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{v}</div>
                  <div style={{ fontSize: 9.5, color: C.textMuted }}>{u} {l}</div>
                </div>
              ))}
            </div>

            {result.calorieRangeLow != null && result.calorieRangeHigh != null && result.calorieRangeHigh > result.calorieRangeLow && (
              <div style={{ fontSize: 11.5, color: C.textMuted, textAlign: 'center', marginBottom: 12 }}>
                {fr ? 'Fourchette estimée' : 'Estimated range'}: {result.calorieRangeLow}–{result.calorieRangeHigh} kcal
              </div>
            )}
            {result.assumptions && (
              <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 14, lineHeight: 1.5, textAlign: 'center' }}>
                📏 {result.assumptions}
              </div>
            )}
            {result.items?.length > 0 && (
              <div style={{ marginBottom: 18, background: C.surface, borderRadius: 14, padding: '4px 14px', boxShadow: C.shadowCard }}>
                {result.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < result.items.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13 }}>
                    <span style={{ color: C.text }}>{item.name}</span>
                    <span style={{ color: C.gold, fontWeight: 500 }}>{item.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}

            {/* Primary action */}
            <button
              onClick={() => onLog({ name: result.meal, cal: result.calories, p: result.protein, c: result.carbs, f: result.fat }, meal)}
              style={{ width: '100%', padding: 16, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, boxShadow: `0 4px 14px ${C.gold}55` }}
            >
              {fr ? 'Enregistrer ce repas' : 'Log Meal'}
            </button>

            {/* Secondary actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setSaveName(result.meal || ''); setShowSaveModal(true) }}
                disabled={saved}
                style={{
                  flex: 1, padding: 12, borderRadius: 18, border: `1px solid ${saved ? C.green : C.border}`,
                  background: saved ? C.greenLight : 'transparent', color: saved ? C.green : C.textMuted,
                  fontSize: 12.5, fontWeight: 600, cursor: saved ? 'default' : 'pointer',
                }}
              >
                {saved ? (fr ? '✓ Enregistré' : '✓ Saved') : (fr ? 'Sauvegarder' : 'Save for Later')}
              </button>
              <button
                onClick={editMeal}
                style={{ flex: 1, padding: 12, borderRadius: 18, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                {fr ? 'Modifier' : 'Edit Meal'}
              </button>
            </div>

            {/* Save for Later — custom name prompt */}
            {showSaveModal && (
              <div onClick={() => setShowSaveModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.55)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, padding: '22px 22px 32px' }}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: C.divider, margin: '0 auto 16px' }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{fr ? 'Nom du repas' : 'Name this meal'}</div>
                  <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 14 }}>
                    {fr ? 'ex. Mon Shawarma, Pâtes maison, Petit-déj du vendredi' : 'e.g. My Chicken Shawarma, Homemade Pasta, Friday Breakfast'}
                  </div>
                  <input
                    autoFocus
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
                  />
                  <button
                    onClick={() => {
                      if (!saveName.trim()) return
                      onSave?.({
                        name: saveName.trim(), calories: result.calories, protein: result.protein,
                        carbs: result.carbs, fat: result.fat,
                        ingredients: result.items?.map(i => i.name) || null,
                        source: 'estimator',
                      })
                      setSaved(true)
                      setShowSaveModal(false)
                    }}
                    disabled={!saveName.trim()}
                    style={{ width: '100%', padding: 14, borderRadius: 20, background: saveName.trim() ? C.gold : C.surfaceLight, color: saveName.trim() ? C.dark : C.textMuted, border: 'none', fontSize: 14, fontWeight: 600, cursor: saveName.trim() ? 'pointer' : 'default' }}
                  >
                    {fr ? 'Enregistrer' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </MealFlowShell>
  )
}

// ─────────────────────────────────────────────
// AI Suggestion card
// ─────────────────────────────────────────────
function AISuggestionCard({ preferences, totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF, lang = 'en', onLog, onSave, mealSlot, onViewSavedMeals }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [suggestion,   setSuggestion]   = useState(null)   // parsed { meal, calories, protein, carbs, fat, whyItFits, ingredients, steps }
  const [loading,      setLoading]      = useState(false)
  const [fetched,      setFetched]      = useState(false)
  const [showModify,   setShowModify]   = useState(false)
  const [modifyInput,  setModifyInput]  = useState('')
  const [saved,        setSaved]        = useState(false)
  const [logged,       setLogged]       = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(mealSlot || 'breakfast')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const parseResponse = (raw) => {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }

  const nutritionCtx = { totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF }

  const getSuggestion = async (avoidPrevious = false) => {
    setLoading(true); setSaved(false); setLogged(false)
    try {
      const raw = await askMealSuggestion(preferences, nutritionCtx, lang, {
        avoidDish: avoidPrevious ? suggestion?.meal : '',
      })
      setSuggestion(parseResponse(raw))
    } catch {
      setSuggestion(null)
    }
    setLoading(false); setFetched(true)
  }

  const applyModification = async () => {
    if (!modifyInput.trim()) return
    setLoading(true); setSaved(false); setLogged(false)
    try {
      const raw = await askMealSuggestion(preferences, nutritionCtx, lang, {
        modification: modifyInput,
        previousMeal: suggestion,
      })
      setSuggestion(parseResponse(raw))
    } catch {
      // keep previous suggestion visible if modification fails
    }
    setModifyInput(''); setShowModify(false); setLoading(false)
  }

  // Fully collapse the card back to its initial pre-ask state
  const resetCard = () => {
    setSuggestion(null); setFetched(false); setLoading(false)
    setShowModify(false); setModifyInput('')
    setSaved(false); setLogged(false); setShowMoreOptions(false)
  }

  // Show active restrictions so user knows they're being respected
  const activeRestrictions = [
    ...(preferences?.dietary_preferences || []),
    ...(preferences?.allergies || []),
  ]

  return (
    <Card style={{ borderColor: C.borderStrong, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: fetched || loading ? 12 : 10 }}>
        <div style={{ flexShrink: 0 }}>
          <AuronCharacter mood="nutrition" size="compact" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{t('cal.aiSuggest')}</div>
          {activeRestrictions.length > 0 && (
            <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 2 }}>
              Respecting: {activeRestrictions.slice(0, 3).join(', ')}{activeRestrictions.length > 3 ? ` +${activeRestrictions.length - 3} more` : ''}
            </div>
          )}
        </div>
        {fetched && !loading && (
          <button
            onClick={resetCard}
            aria-label="Collapse"
            style={{ background: 'none', border: 'none', color: C.textDim, fontSize: 18, cursor: 'pointer', padding: '0 2px', flexShrink: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Pre-first-ask: clear primary CTA + a way to browse saved meals instead */}
      {!fetched && !loading && (
        <div>
          <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            {t('cal.tapAsk')}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => getSuggestion(false)}
              disabled={loading}
              style={{
                flex: 2, padding: 12, borderRadius: 14,
                background: C.gold, color: C.dark, border: 'none',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? <><Spinner /> {t('cal.thinking')}</> : t('cal.askAI')}
            </button>
            <button
              onClick={onViewSavedMeals}
              style={{
                flex: 1, padding: 12, borderRadius: 14,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('cal.viewSavedMealsBtn') || '📋 Saved meals'}
            </button>
          </div>
        </div>
      )}

      {loading && !suggestion && (
        <div style={{ fontSize: 13, color: C.textMuted }}>{t('cal.generating')}</div>
      )}

      {/* Structured suggestion */}
      {suggestion && (
        <div style={{ marginBottom: 14, opacity: loading ? 0.5 : 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>{suggestion.meal}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
            {[['Calories', suggestion.calories, 'kcal', C.gold], [t('cal.protein'), suggestion.protein, 'g', C.blue], [t('cal.carbs'), suggestion.carbs, 'g', C.amber], ['Fat', suggestion.fat, 'g', C.green]].map(([l, v, u, col]) => (
              <div key={l} style={{ background: C.surfaceLight, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: col }}>{v}</div>
                <div style={{ fontSize: 9.5, color: C.textMuted }}>{u} {l}</div>
              </div>
            ))}
          </div>

          {suggestion.whyItFits && (
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
              💡 {suggestion.whyItFits}
            </div>
          )}

          {suggestion.ingredients?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, color: C.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {t('cal.ingredients')}
              </div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>
                {suggestion.ingredients.join(' · ')}
              </div>
            </div>
          )}

          {suggestion.steps?.length > 0 && (
            <div>
              <div style={{ fontSize: 10.5, color: C.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {t('cal.prepSteps')}
              </div>
              <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {suggestion.steps.map((s, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Log / Save actions for this suggestion — one obvious primary action */}
      {suggestion && !loading && (
        <div style={{ marginBottom: 12 }}>
          {!logged && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, color: C.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {t('cal.logTo')}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {MEAL_SLOTS.map(s => (
                  <button key={s.id} onClick={() => setSelectedSlot(s.id)}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${selectedSlot === s.id ? C.gold : C.border}`,
                      background: selectedSlot === s.id ? C.goldLight : 'transparent',
                      color: selectedSlot === s.id ? C.gold : C.textMuted,
                      fontSize: 10.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary action — unmistakably the main CTA */}
          <button
            onClick={() => {
              onLog?.({ name: suggestion.meal, cal: suggestion.calories, p: suggestion.protein, c: suggestion.carbs, f: suggestion.fat }, selectedSlot)
              setLogged(true)
            }}
            disabled={logged}
            style={{
              width: '100%', padding: 13, borderRadius: 16, border: 'none',
              background: logged ? C.greenLight : C.gold, color: logged ? C.green : C.dark,
              fontSize: 14, fontWeight: 700, cursor: logged ? 'default' : 'pointer',
              marginBottom: 8, boxShadow: logged ? 'none' : `0 3px 10px ${C.gold}44`,
            }}
          >
            {logged ? `✓ ${t('cal.logged') || 'Logged'}` : t('cal.logMeal')}
          </button>

          {!logged ? (
            /* Secondary — Save is one tap; everything else tucked behind "More options" */
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  onSave?.({
                    name: suggestion.meal, calories: suggestion.calories, protein: suggestion.protein,
                    carbs: suggestion.carbs, fat: suggestion.fat,
                    ingredients: suggestion.ingredients || null,
                    steps: suggestion.steps || null,
                    source: 'suggestion',
                  })
                  setSaved(true)
                }}
                disabled={saved}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 12, border: `1px solid ${saved ? C.green : C.border}`,
                  background: saved ? C.greenLight : 'transparent', color: saved ? C.green : C.textMuted,
                  fontSize: 12, fontWeight: 600, cursor: saved ? 'default' : 'pointer',
                }}
              >
                {saved ? t('cal.savedMeal') : t('cal.saveMeal')}
              </button>
              <button
                onClick={() => setShowMoreOptions(v => !v)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {showMoreOptions ? (t('cal.hideOptions') || 'Hide options') : (t('cal.moreOptions') || 'More options')}
              </button>
            </div>
          ) : (
            <button
              onClick={resetCard}
              style={{ width: '100%', padding: 0, background: 'none', border: 'none', color: C.textMuted, fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {lang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          )}
        </div>
      )}

      {/* Everything else — tucked away until explicitly requested */}
      {fetched && suggestion && !logged && showMoreOptions && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: showModify ? 12 : 0 }}>
            <button
              onClick={() => getSuggestion(true)}
              disabled={loading}
              style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {loading ? <><Spinner /> {t('cal.thinking')}</> : t('cal.somethingElse')}
            </button>
            <button
              onClick={() => setShowModify(v => !v)}
              disabled={loading}
              style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: showModify ? C.gold : C.goldLight, border: `1px solid ${C.gold}44`, color: showModify ? C.dark : C.gold, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              {t('cal.modifySuggestion')}
            </button>
          </div>

          {/* Modify panel — visually attached to the current suggestion above */}
          {showModify && (
            <div style={{ background: C.goldLight, border: `1px solid ${C.gold}33`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: C.gold, marginBottom: 8, lineHeight: 1.4 }}>
                {t('cal.modifyLabel')}
              </div>
              <textarea
                autoFocus
                rows={2}
                value={modifyInput}
                onChange={e => setModifyInput(e.target.value)}
                placeholder={t('cal.modifyPlaceholder')}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 10, lineHeight: 1.5 }}
              />
              <button
                onClick={applyModification}
                disabled={loading || !modifyInput.trim()}
                style={{
                  width: '100%', padding: 10, borderRadius: 12,
                  background: !modifyInput.trim() || loading ? C.surfaceLight : C.gold,
                  color: !modifyInput.trim() || loading ? C.textMuted : C.dark,
                  border: 'none', fontSize: 12.5, fontWeight: 600,
                  cursor: !modifyInput.trim() || loading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {loading ? <><Spinner /> {t('cal.thinking')}</> : t('cal.updateSuggestion')}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────
// Saved Meals — full-screen page (macros, ingredients, recipe steps)
// ─────────────────────────────────────────────
function SavedMealsPage({ savedMeals, onSelect, onDelete, onBack }) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div style={{ position:'fixed', inset:0, background:T.pageBg || '#F7F6FB', zIndex:300, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', overflowY:'auto' }}>
      <div style={{ padding:'18px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:T.textMuted, fontSize:22, cursor:'pointer', padding:0, lineHeight:1 }}>‹</button>
        <div style={{ fontSize:18, fontWeight:700, color:T.text }}>{t('cal.savedMeals')}</div>
      </div>

      <div style={{ flex:1, padding:'16px 20px 32px' }}>
        {savedMeals.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:T.textMuted, fontSize:13 }}>{t('cal.noSaved')}</div>
        ) : savedMeals.map(m => {
          const isOpen = expandedId === m.id
          return (
            <div key={m.id} style={{ borderRadius:14, marginBottom:10, border:`1px solid ${T.border}`, overflow:'hidden', background:T.surface }}>
              <div
                onClick={() => setExpandedId(isOpen ? null : m.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', cursor:'pointer' }}
              >
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:T.text }}>{m.name}</div>
                  <div style={{ fontSize:11.5, color:T.textMuted, marginTop:2 }}>
                    <span style={{ color:T.purple, fontWeight:600 }}>{m.calories} kcal</span>
                    <span> · P {m.protein}g · C {m.carbs}g · F {m.fat}g</span>
                  </div>
                </div>
                <span style={{ fontSize:13, color:T.textDim, flexShrink:0 }}>{isOpen ? '▲' : '▾'}</span>
              </div>

              {isOpen && (
                <div style={{ padding:'0 14px 14px', borderTop:`1px solid ${T.divider}` }}>
                  {/* Macro breakdown */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, margin:'12px 0' }}>
                    {[['Kcal', m.calories, T.purple], [t('cal.protein'), `${m.protein}g`, T.blue], [t('cal.carbs'), `${m.carbs}g`, T.amber], ['Fat', `${m.fat}g`, T.red]].map(([l,v,c]) => (
                      <div key={l} style={{ background:T.surfaceLight, borderRadius:10, padding:'8px 4px', textAlign:'center' }}>
                        <div style={{ fontSize:15, fontWeight:700, color:c }}>{v}</div>
                        <div style={{ fontSize:9.5, color:T.textMuted }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Ingredients */}
                  {m.ingredients?.length > 0 && (
                    <div style={{ marginBottom: m.steps?.length ? 12 : 14 }}>
                      <div style={{ fontSize:10.5, color:T.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
                        {t('cal.ingredients')}
                      </div>
                      <div style={{ fontSize:12.5, color:T.text, lineHeight:1.6 }}>{m.ingredients.join(' · ')}</div>
                    </div>
                  )}

                  {/* Recipe steps — only present for meals saved from a Coach Auron suggestion */}
                  {m.steps?.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10.5, color:T.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
                        {t('cal.prepSteps')}
                      </div>
                      <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:4 }}>
                        {m.steps.map((s,i) => <li key={i} style={{ fontSize:12.5, color:T.text, lineHeight:1.5 }}>{s}</li>)}
                      </ol>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => onSelect(m)}
                      style={{ flex:2, padding:11, borderRadius:14, background:T.purple, color:'#fff', border:'none', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                      {t('cal.logMeal')}
                    </button>
                    <button onClick={() => onDelete(m.id)}
                      style={{ flex:1, padding:11, borderRadius:14, background:T.redLight, color:T.red, border:`1px solid ${T.red}44`, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                      {t('cal.delete') || 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Add food modal — live search via USDA + Open Food Facts
// ─────────────────────────────────────────────
function AddFoodModal({ selectedMeal, setSelectedMeal, onAdd, onClose, onDescribe, recentMeals = [], savedMeals = [], onSaveMeal, onDeleteSavedMeal }) {
  const { t, lang } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState(LOCAL_DB.slice(0, 20))
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(null)  // food being customized
  const [qty,      setQty]      = useState('1')   // multiplier
  const [justSaved,setJustSaved]= useState(false)
  const [filterTab, setFilterTab] = useState('foods') // 'foods' | 'recent'
  const debounceRef = useRef(null)

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults(LOCAL_DB.slice(0, 20)); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchFoods(query, lang)
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

  // Recent/Saved meal shape → same as a search result, so the existing
  // quantity + meal-slot detail view can be reused for both.
  const selectFood = (f) => { setSelected(f); setQty('1'); setJustSaved(false) }

  return (
    <div style={{ position:'fixed', inset:0, background:T.pageBg || '#F7F6FB', zIndex:300, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', overflowY:'auto' }}>
      <div style={{ padding:'20px 20px 0', flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexShrink:0 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:T.text }}>
              {selected ? selected.name.slice(0, 28) + (selected.name.length > 28 ? '…' : '') : t('cal.addFood').replace('+ ','')}
            </div>
            {!selected && (
              <div style={{ fontSize:12, color:T.purple, fontWeight:500, marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                {MEAL_SLOTS.find(s => s.id === selectedMeal)?.icon} {MEAL_SLOTS.find(s => s.id === selectedMeal)?.label}
              </div>
            )}
          </div>
          <button onClick={selected ? () => setSelected(null) : onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:22, cursor:'pointer' }}>
            {selected ? '‹' : '×'}
          </button>
        </div>

        {/* ── Food detail view ── */}
        {selected ? (
          <div style={{ flex:1, overflowY:'auto', paddingBottom:24 }}>
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

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleAdd} style={{ flex:2, padding:13, borderRadius:24, background:T.purple, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                + {t('cal.logMeal').replace('+ ','').replace('Log this meal','Log')} {scaled.cal} kcal
              </button>
              {selected.savedMealId ? (
                <button
                  onClick={() => { onDeleteSavedMeal?.(selected.savedMealId); setSelected(null) }}
                  style={{ flex:1, padding:13, borderRadius:24, border:`1px solid ${T.red}44`, background:T.redLight, color:T.red, fontSize:12.5, fontWeight:600, cursor:'pointer' }}
                >
                  {t('cal.delete') || 'Delete'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSaveMeal?.({
                      name: selected.name, calories: scaled.cal, protein: scaled.p,
                      carbs: scaled.c, fat: scaled.f, ingredients: null, source: 'manual',
                    })
                    setJustSaved(true)
                  }}
                  disabled={justSaved}
                  style={{
                    flex:1, padding:13, borderRadius:24, border:`1px solid ${justSaved ? T.green : T.border}`,
                    background: justSaved ? T.greenLight : 'transparent', color: justSaved ? T.green : T.textMuted,
                    fontSize:12.5, fontWeight:600, cursor: justSaved ? 'default' : 'pointer',
                  }}
                >
                  {justSaved ? t('cal.savedMeal') : t('cal.saveMeal')}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Search view ── */
          <>
            {/* Search box — first, since most users search immediately */}
            <div style={{ position:'relative', marginBottom:10 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('food.searchPlaceholder')||t('cal.searchFood')} autoFocus
                style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:12, background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text, fontSize:14, outline:'none' }} />
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
              {loading && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:11, color:T.purple }}>{t('cal.loading')||'Searching…'}</span>}
            </div>

            {/* Segmented filter — Foods / Saved / Recent, right under the search bar */}
            <div style={{ display:'flex', gap:6, marginBottom:12, background:T.surfaceMid, borderRadius:12, padding:4 }}>
              {[
                ['foods',  t('food.filterFoods')  || 'Foods'],
                ['saved',  `${t('food.filterSaved')  || 'Saved'}${savedMeals.length ? ` (${savedMeals.length})` : ''}`],
                ['recent', t('food.filterRecent') || 'Recent'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setFilterTab(id)}
                  style={{
                    flex:1, padding:'8px 4px', borderRadius:9, border:'none', cursor:'pointer',
                    background: filterTab===id ? T.surface : 'transparent',
                    color: filterTab===id ? T.purple : T.textMuted,
                    fontWeight: filterTab===id ? 700 : 500, fontSize:12.5,
                    boxShadow: filterTab===id ? T.shadowCard : 'none',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ overflowY:'auto', flex:1 }}>
              {/* ── Foods tab: live search results ── */}
              {filterTab === 'foods' && (
                <>
                  {query.length > 1 && !loading && (
                    <div style={{ fontSize:11, color:T.textDim, marginBottom:8 }}>
                      {results.length} {t('cal.resultsSource')||`${results.length} results · USDA`}
                    </div>
                  )}
                  {results.map((f) => (
                    <button key={f.id} onClick={() => selectFood(f)}
                      style={{ width:'100%', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', borderBottom:`1px solid ${T.divider}`, cursor:'pointer', textAlign:'left' }}>
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

                  {/* Empty state — Coach Auron steps in as the fallback */}
                  {results.length === 0 && !loading && (
                    <div style={{ padding:'24px 0', textAlign:'center' }}>
                      <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                        <AuronCharacter mood="thinking" size="compact" />
                      </div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:T.text, marginBottom:4 }}>
                        {t('food.noMatchTitle') || "Couldn't find what you're looking for?"}
                      </div>
                      <div style={{ fontSize:12.5, color:T.textMuted, marginBottom:16 }}>
                        {t('food.noMatchSub') || 'Let me estimate it for you 👋'}
                      </div>
                      <button onClick={() => { onClose(); setTimeout(() => onDescribe?.(), 100) }}
                        style={{ padding:'11px 22px', borderRadius:20, background:T.purple, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        {t('food.askAuronBtn') || '✨ Ask Auron'}
                      </button>
                    </div>
                  )}
                  {results.length > 0 && query.length > 1 && !loading && (
                    <div style={{ padding:'16px 0', textAlign:'center', borderTop:`1px solid ${T.divider}`, marginTop:8 }}>
                      <div style={{ fontSize:12, color:T.textDim, marginBottom:10 }}>{t('food.cantFind')||"Can't find it?"}</div>
                      <button onClick={() => { onClose(); setTimeout(() => onDescribe?.(), 100) }}
                        style={{ padding:'9px 18px', borderRadius:20, background:T.purpleLight, border:`1px solid ${T.border}`, color:T.purple, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        {t('food.describePrompt')||'✨ Describe it — AI will estimate'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── Saved tab — quick select to log directly, same row style as Foods ── */}
              {filterTab === 'saved' && (
                savedMeals.length === 0 ? (
                  <div style={{ padding:'28px 0', textAlign:'center', fontSize:13, color:T.textMuted }}>
                    {t('cal.noSaved') || 'No saved meals yet'}
                  </div>
                ) : (
                  savedMeals.map((m) => (
                    <button key={m.id}
                      onClick={() => selectFood({ name:m.name, cal:m.calories, p:m.protein, c:m.carbs, f:m.fat, serving:'1 serving', source:'Saved', savedMealId:m.id })}
                      style={{ width:'100%', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', borderBottom:`1px solid ${T.divider}`, cursor:'pointer', textAlign:'left' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:2 }}>{m.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>
                          <span style={{ color:T.purple, fontWeight:600 }}>{m.calories} kcal</span>
                          <span> · P {m.protein}g · C {m.carbs}g · F {m.fat}g</span>
                        </div>
                      </div>
                    </button>
                  ))
                )
              )}

              {/* ── Recent tab — styled exactly like Foods rows for consistency ── */}
              {filterTab === 'recent' && (
                recentMeals.length === 0 ? (
                  <div style={{ padding:'28px 0', textAlign:'center', fontSize:13, color:T.textMuted }}>
                    {t('cal.noRecent') || 'No recent meals yet'}
                  </div>
                ) : (
                  recentMeals.map((m) => (
                    <button key={m.id}
                      onClick={() => selectFood({ name:m.food_name, cal:m.calories, p:m.protein, c:m.carbs, f:m.fat, serving:'1 serving', source:'Recent' })}
                      style={{ width:'100%', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', borderBottom:`1px solid ${T.divider}`, cursor:'pointer', textAlign:'left' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:2 }}>{m.food_name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>
                          <span style={{ color:T.purple, fontWeight:600 }}>{m.calories} kcal</span>
                          <span> · P {m.protein}g · C {m.carbs}g · F {m.fat}g</span>
                        </div>
                      </div>
                    </button>
                  ))
                )
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
export default function CaloriesTab({ userId, profile, preferences, lang = 'en', nutritionRequest = null, onNutritionRequestHandled }) {
  const { t } = useTranslation()
  const MEAL_SLOTS = getMealSlotsNutrition(t)
  const [logs,         setLogs]         = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [subView,      setSubView]      = useState('log') // 'log' | 'describe' | 'savedMeals'
  const [recentMeals,  setRecentMeals]  = useState([])
  const [savedMeals,   setSavedMeals]   = useState([])

  // Deep-link from Today tab — "Log breakfast" etc. opens straight to that meal slot
  useEffect(() => {
    if (nutritionRequest?.slot) {
      setSelectedMeal(nutritionRequest.slot)
      setSubView('log')
      setModal(true)
      onNutritionRequestHandled?.() // clear it so a future remount doesn't reopen it
    }
  }, [nutritionRequest?.ts])

  const today = toUserDateStr(profile?.timezone)
  const calorieGoal   = profile?.calorie_goal || 2200
  const proteinGoal   = profile?.protein_goal || 150
  const carbsGoal     = profile?.carbs_goal   || 250
  const fatGoal       = profile?.fat_goal     || 73

  // Default meal slot suggestion based on time of day — used for one-tap logging
  // from the estimator/suggestion, where there's no explicit slot picker.
  const defaultMealSlotByHour = () => {
    const h = new Date().getHours()
    if (h < 11) return 'breakfast'
    if (h < 15) return 'lunch'
    if (h < 18) return 'snack'
    return 'dinner'
  }

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

  // Recent Meals — dedupe the user's last logged foods (by name), most recent first
  const fetchRecentMeals = async () => {
    if (!userId) return
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(40)
    const seen = new Set()
    const unique = []
    for (const f of (data || [])) {
      const key = f.food_name?.toLowerCase()
      if (key && !seen.has(key)) {
        seen.add(key)
        unique.push(f)
        if (unique.length >= 8) break
      }
    }
    setRecentMeals(unique)
  }

  // Saved Meals — explicit saves from estimator, suggestion, or manual entry
  const fetchSavedMeals = async () => {
    if (!userId) return
    const { data } = await supabase
      .from('saved_meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setSavedMeals(data || [])
  }

  useEffect(() => { fetchRecentMeals(); fetchSavedMeals() }, [userId])

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
    if (!error) {
      setLogs(prev => [...prev, data])
      fetchRecentMeals() // keep Recent Meals current automatically
    }
  }

  const removeFood = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(f => f.id !== id))
  }

  // Save a meal (from estimator, suggestion, or manual) to Saved Meals
  const saveMeal = async (meal) => {
    await supabase.from('saved_meals').insert({
      user_id:     userId,
      name:        meal.name,
      calories:    meal.calories ?? 0,
      protein:     meal.protein  ?? 0,
      carbs:       meal.carbs    ?? 0,
      fat:         meal.fat      ?? 0,
      ingredients: meal.ingredients || null,
      steps:       meal.steps || null,
      source:      meal.source || 'manual',
    })
    fetchSavedMeals()
  }

  const deleteSavedMeal = async (id) => {
    await supabase.from('saved_meals').delete().eq('id', id)
    setSavedMeals(prev => prev.filter(m => m.id !== id))
  }

  const totalCal = logs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalP   = logs.reduce((s, f) => s + (f.protein  || 0), 0)
  const totalC   = logs.reduce((s, f) => s + (f.carbs    || 0), 0)
  const totalF   = logs.reduce((s, f) => s + (f.fat      || 0), 0)

  const nutritionCtx = loading ? null : {
    totalCal, calorieGoal,
    proteinPct: proteinGoal > 0 ? (totalP / proteinGoal) * 100 : 0,
    foodLogsCount: logs.length,
    hour: new Date().getHours(),
    waterPct: null,
  }

  if (subView === 'describe') {
    return (
      <DescribeMeal
        preferences={preferences}
        profile={profile}
        lang={lang}
        onLog={(food, meal) => { addFood(food, meal); setSubView('log') }}
        onSave={saveMeal}
        onBack={() => setSubView('log')}
      />
    )
  }

  if (subView === 'savedMeals') {
    return (
      <SavedMealsPage
        savedMeals={savedMeals}
        onSelect={(m) => {
          addFood({ name: m.name, cal: m.calories, p: m.protein, c: m.carbs, f: m.fat }, defaultMealSlotByHour())
          setSubView('log')
        }}
        onDelete={deleteSavedMeal}
        onBack={() => setSubView('log')}
      />
    )
  }

  return (
    <div>
      <TabAuronCard tab="nutrition" ctx={nutritionCtx} lang={lang} />

      {/* ── Stats cluster: Calories/Remaining + Macros grouped together ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={{ background: C.surfaceLight, borderRadius: 12, padding: '10px 13px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 1 }}>{t('cal.caloriesLabel')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, lineHeight: 1.1 }}>{totalCal.toLocaleString()}</div>
          <div style={{ fontSize: 10.5, color: C.textMuted }}>{t('cal.ofGoal').replace('{n}', calorieGoal.toLocaleString())}</div>
        </div>
        <div style={{ background: C.surfaceLight, borderRadius: 12, padding: '10px 13px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 1 }}>{t('cal.remaining')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: totalCal > calorieGoal ? C.red : C.green, lineHeight: 1.1 }}>
            {Math.abs(calorieGoal - totalCal).toLocaleString()}
          </div>
          <div style={{ fontSize: 10.5, color: C.textMuted }}>{totalCal > calorieGoal ? t('cal.kcalOver') : t('cal.kcalLeft')}</div>
        </div>
      </div>

      {/* Macros */}
      <Card style={{ marginBottom: 20, padding: '14px 16px' }}>
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
        onLog={addFood}
        onSave={saveMeal}
        mealSlot={defaultMealSlotByHour()}
        onViewSavedMeals={() => setSubView('savedMeals')}
      />

      {/* Food log by meal slot */}
      <div style={{ marginBottom: 8 }}>
        <Label>{t('cal.foodLog')}</Label>

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

      {/* Ask Auron — last in the hierarchy, a clear fallback/complement to manual logging */}
      <button
        onClick={() => setSubView('describe')}
        style={{
          width: '100%', marginTop: 20, marginBottom: 4, padding: '14px 16px', borderRadius: 18,
          border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark || C.gold})`,
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
          boxShadow: `0 4px 16px ${C.gold}44`,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <AuronCharacter mood="nutrition" size="compact" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{t('cal.askAuronCta') || 'Ask Auron'}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2, lineHeight: 1.4 }}>
            {t('cal.askAuronCtaSub2') || "Describe a meal and I'll estimate the calories and macros for you"}
          </div>
        </div>
        <span style={{ fontSize: 20, color: '#fff', flexShrink: 0 }}>›</span>
      </button>

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
          onDescribe={() => { setModal(false); setSubView('describe') }}
          recentMeals={recentMeals}
          savedMeals={savedMeals}
          onSaveMeal={saveMeal}
          onDeleteSavedMeal={deleteSavedMeal}
        />
      )}
    </div>
  )
}
