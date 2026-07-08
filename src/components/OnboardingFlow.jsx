import { useState } from 'react'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import { AuronCharacter } from './CoachAuron'

const C = T

// ─────────────────────────────────────────────
// Option data
// ─────────────────────────────────────────────
const DIETARY_OPTIONS  = ['Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Mediterranean']
const ALLERGY_OPTIONS  = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy']

const GOAL_OPTIONS = [
  { value: 'Lose weight',       emoji: '🔥' },
  { value: 'Build muscle',      emoji: '💪' },
  { value: 'Improve endurance', emoji: '🏃' },
  { value: 'General health',    emoji: '❤️' },
  { value: 'Maintain weight',   emoji: '⚖️' },
]

const ACTIVITY_OPTIONS = [
  { value: '1.2',   label: 'Sedentary',    sub: 'Little to no exercise' },
  { value: '1.375', label: 'Light',        sub: '1–3 workouts / week' },
  { value: '1.55',  label: 'Moderate',     sub: '3–5 workouts / week' },
  { value: '1.725', label: 'Active',       sub: '6–7 workouts / week' },
  { value: '1.9',   label: 'Very active',  sub: 'Physical job or 2x/day training' },
]

const GOAL_OFFSET = {
  'Lose weight': -500,
  'Build muscle': 300,
  'Improve endurance': 0,
  'General health': 0,
  'Maintain weight': 0,
}

// ─────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${(current / total) * 100}%`, background: C.purple, borderRadius: 2, transition: 'width 0.3s ease' }} />
    </div>
  )
}

function Shell({ idx, total, mood, onBack, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 500, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {idx > 0
            ? <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1, minWidth: 28 }}>‹</button>
            : <div style={{ minWidth: 28 }} />}
          <div style={{ flex: 1 }}><ProgressBar current={idx + 1} total={total} /></div>
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{idx + 1}/{total}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <AuronCharacter mood={mood} size="hero" />
        </div>
        {children}
        <div style={{ height: 100 }} />
      </div>
    </div>
  )
}

function NextButton({ onClick, disabled, label }) {
  return (
    <div style={{ padding: '12px 24px 36px', background: C.pageBg || '#F0EFF8', borderTop: `1px solid ${C.divider}`, position: 'sticky', bottom: 0 }}>
      <button onClick={onClick} disabled={disabled}
        style={{ width: '100%', padding: 16, borderRadius: 20, background: disabled ? C.surfaceMid : C.purple, border: 'none', color: disabled ? C.textDim : '#fff', fontSize: 16, fontWeight: 700, cursor: disabled ? 'default' : 'pointer' }}>
        {label}
      </button>
    </div>
  )
}

function OptionRow({ selected, onClick, emoji, label }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', border: `2px solid ${selected ? C.purple : C.divider}`, background: selected ? C.purpleLight : C.surface, boxShadow: selected ? `0 0 0 1px ${C.purple}` : C.shadowCard, marginBottom: 10 }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontSize: 15, fontWeight: selected ? 700 : 500, color: selected ? C.purple : C.text }}>{label}</span>
      {selected && <span style={{ marginLeft: 'auto', color: C.purple, fontSize: 18 }}>✓</span>}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '13px 14px', borderRadius: 14, background: C.surface, border: `2px solid ${C.divider}`, color: C.text, fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main flow
// ─────────────────────────────────────────────
export default function OnboardingFlow({ profile, updateProfile, updatePreferences, onDismiss }) {
  const { t, lang } = useTranslation()
  const fr = lang === 'fr'
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [goal, setGoal]         = useState('')
  const [age, setAge]           = useState('')
  const [gender, setGender]     = useState('female')
  const [weight, setWeight]     = useState('')
  const [height, setHeight]     = useState('')
  const [activity, setActivity] = useState('')
  const [dietary, setDietary]   = useState([])
  const [allergies, setAllergies] = useState([])

  const total = 7 // welcome, goal, basics, activity, dietary, allergies, summary
  const goBack = () => setStep(s => Math.max(0, s - 1))
  const goNext = () => setStep(s => s + 1)

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])

  // ── Calorie / macro calculation ──────────────
  const calcPlan = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age)
    if (!w || !h || !a) return null
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = bmr * parseFloat(activity || '1.375')
    const target = Math.round(tdee + (GOAL_OFFSET[goal] ?? 0))
    const protein = Math.round(w * 2.2)
    const carbs = Math.round((target * 0.45) / 4)
    const fat = Math.round((target * 0.25) / 9)
    return { calorie_goal: target, protein_goal: protein, carbs_goal: carbs, fat_goal: fat }
  }

  const finish = async () => {
    setSaving(true)
    const plan = calcPlan()
    await updateProfile({
      age: age ? parseInt(age) : null,
      gender, weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      activity_level: activity, primary_goal: goal,
      ...(plan || {}),
    })
    await updatePreferences?.({ dietary_preferences: dietary, allergies })
    setSaving(false)
    onDismiss()
  }

  // ── Step 0 — Welcome ──────────────────────────
  if (step === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: `linear-gradient(170deg, ${C.heroGrad1 || C.purple} 0%, ${C.heroGrad2 || C.purpleDark} 60%)`, zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', maxWidth: 480, margin: '0 auto' }}>
        <AuronCharacter mood="greeting" size="welcome" />
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 24px', marginTop: 24, marginBottom: 28, maxWidth: 300, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>{fr ? 'Salut ! Je suis' : "Hi! I'm"}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.purple, marginBottom: 6 }}>Auron 👋</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>
            {fr
              ? "Répondez à quelques questions rapides et je créerai un plan nutrition et fitness personnalisé, juste pour vous."
              : "Answer a few quick questions and I'll build a personalised nutrition and fitness plan just for you."}
          </div>
        </div>
        <button onClick={goNext}
          style={{ padding: '15px 48px', borderRadius: 30, background: '#fff', color: C.purple, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {fr ? 'Commençons →' : "Let's get started →"}
        </button>
      </div>
    )
  }

  // ── Step 1 — Goal ─────────────────────────────
  if (step === 1) {
    const goalLabel = v => ({
      'Lose weight':       fr ? 'Perdre du poids' : 'Lose weight',
      'Build muscle':      fr ? 'Prendre du muscle' : 'Build muscle',
      'Improve endurance': fr ? "Améliorer l'endurance" : 'Improve endurance',
      'General health':    fr ? 'Santé générale' : 'General health',
      'Maintain weight':   fr ? 'Maintenir mon poids' : 'Maintain weight',
    }[v] || v)

    return (
      <Shell idx={step} total={total} mood="motivating" onBack={goBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? 'Quel est ton objectif principal ?' : "What's your main goal?"}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? 'Cela aide Auron à construire ton plan.' : 'This helps Auron build your plan.'}
          </div>
        </div>
        {GOAL_OPTIONS.map(o => (
          <OptionRow key={o.value} selected={goal === o.value} emoji={o.emoji} label={goalLabel(o.value)} onClick={() => setGoal(o.value)} />
        ))}
        <NextButton onClick={goNext} disabled={!goal} label={fr ? 'Suivant →' : 'Next →'} />
      </Shell>
    )
  }

  // ── Step 2 — Basic info ───────────────────────
  if (step === 2) {
    const canNext = age && weight && height
    return (
      <Shell idx={step} total={total} mood="thinking" onBack={goBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? 'Parle-moi un peu de toi' : 'Tell me a bit about you'}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? 'Utilisé uniquement pour calculer tes objectifs.' : 'Only used to calculate your goals.'}
          </div>
        </div>
        <Field label={fr ? 'Âge' : 'Age'} value={age} onChange={setAge} placeholder="25" type="number" />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{fr ? 'Genre' : 'Gender'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['female', fr ? 'Femme' : 'Female'], ['male', fr ? 'Homme' : 'Male']].map(([v, l]) => (
              <button key={v} onClick={() => setGender(v)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: `2px solid ${gender === v ? C.purple : C.divider}`, background: gender === v ? C.purpleLight : C.surface, color: gender === v ? C.purple : C.text, fontWeight: gender === v ? 700 : 500, fontSize: 14, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <Field label={fr ? 'Poids (kg)' : 'Weight (kg)'} value={weight} onChange={setWeight} placeholder="65" type="number" />
        <Field label={fr ? 'Taille (cm)' : 'Height (cm)'} value={height} onChange={setHeight} placeholder="170" type="number" />
        <NextButton onClick={goNext} disabled={!canNext} label={fr ? 'Suivant →' : 'Next →'} />
      </Shell>
    )
  }

  // ── Step 3 — Activity level ───────────────────
  if (step === 3) {
    const label = o => ({
      Sedentary: fr ? 'Sédentaire' : 'Sedentary',
      Light:     fr ? 'Léger' : 'Light',
      Moderate:  fr ? 'Modéré' : 'Moderate',
      Active:    fr ? 'Actif' : 'Active',
      'Very active': fr ? 'Très actif' : 'Very active',
    }[o.label] || o.label)
    const sub = o => ({
      'Little to no exercise':               fr ? "Peu ou pas d'exercice" : 'Little to no exercise',
      '1–3 workouts / week':                 fr ? '1 à 3 séances / semaine' : '1–3 workouts / week',
      '3–5 workouts / week':                 fr ? '3 à 5 séances / semaine' : '3–5 workouts / week',
      '6–7 workouts / week':                 fr ? '6 à 7 séances / semaine' : '6–7 workouts / week',
      'Physical job or 2x/day training':     fr ? 'Travail physique ou 2 séances/jour' : 'Physical job or 2x/day training',
    }[o.sub] || o.sub)

    return (
      <Shell idx={step} total={total} mood="workout" onBack={goBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? "Quel est ton niveau d'activité ?" : "What's your activity level?"}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? 'Sois honnête pour de meilleurs résultats.' : 'Be honest for the best results.'}
          </div>
        </div>
        {ACTIVITY_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setActivity(o.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '13px 18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', border: `2px solid ${activity === o.value ? C.purple : C.divider}`, background: activity === o.value ? C.purpleLight : C.surface, boxShadow: activity === o.value ? `0 0 0 1px ${C.purple}` : C.shadowCard, marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: activity === o.value ? 700 : 600, color: activity === o.value ? C.purple : C.text }}>{label(o)}</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{sub(o)}</span>
          </button>
        ))}
        <NextButton onClick={goNext} disabled={!activity} label={fr ? 'Suivant →' : 'Next →'} />
      </Shell>
    )
  }

  // ── Step 4 — Dietary preferences ──────────────
  if (step === 4) {
    return (
      <Shell idx={step} total={total} mood="nutrition" onBack={goBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? 'Des préférences alimentaires ?' : 'Any dietary preferences?'}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? 'Sélectionne tout ce qui s\'applique — ou passe.' : 'Select all that apply — or skip.'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {DIETARY_OPTIONS.map(d => {
            const sel = dietary.includes(d)
            return (
              <button key={d} onClick={() => toggle(dietary, setDietary, d)}
                style={{ padding: '14px 8px', borderRadius: 14, textAlign: 'center', cursor: 'pointer', border: `2px solid ${sel ? C.purple : C.divider}`, background: sel ? C.purpleLight : C.surface, color: sel ? C.purple : C.text, fontWeight: sel ? 700 : 500, fontSize: 13 }}>
                {d}
              </button>
            )
          })}
        </div>
        <NextButton onClick={goNext} disabled={false} label={dietary.length ? (fr ? 'Suivant →' : 'Next →') : (fr ? 'Passer →' : 'Skip →')} />
      </Shell>
    )
  }

  // ── Step 5 — Allergies ────────────────────────
  if (step === 5) {
    return (
      <Shell idx={step} total={total} mood="nutrition" onBack={goBack}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? 'Des allergies ou aliments à éviter ?' : 'Any allergies or foods to avoid?'}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? "Cela aide à filtrer les suggestions d'Auron." : "This helps filter Auron's suggestions."}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {ALLERGY_OPTIONS.map(a => {
            const sel = allergies.includes(a)
            return (
              <button key={a} onClick={() => toggle(allergies, setAllergies, a)}
                style={{ padding: '14px 8px', borderRadius: 14, textAlign: 'center', cursor: 'pointer', border: `2px solid ${sel ? C.purple : C.divider}`, background: sel ? C.purpleLight : C.surface, color: sel ? C.purple : C.text, fontWeight: sel ? 700 : 500, fontSize: 13 }}>
                {a}
              </button>
            )
          })}
        </div>
        <NextButton onClick={goNext} disabled={false} label={allergies.length ? (fr ? 'Suivant →' : 'Next →') : (fr ? 'Passer →' : 'Skip →')} />
      </Shell>
    )
  }

  // ── Step 6 — Summary / plan ready ─────────────
  const plan = calcPlan()
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 500, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AuronCharacter mood="celebrating" size="hero" />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {fr ? 'Ton plan est prêt ! 🎉' : 'Your plan is ready! 🎉'}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            {fr ? 'Voici tes objectifs quotidiens personnalisés.' : "Here are your personalised daily targets."}
          </div>
        </div>

        {plan ? (
          <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.divider}`, padding: '20px', marginBottom: 20, boxShadow: C.shadowCard }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.purple }}>{plan.calorie_goal}</div>
              <div style={{ fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fr ? 'kcal / jour' : 'kcal / day'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                [plan.protein_goal, fr ? 'Protéines' : 'Protein'],
                [plan.carbs_goal,   fr ? 'Glucides' : 'Carbs'],
                [plan.fat_goal,     fr ? 'Lipides' : 'Fat'],
              ].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center', background: C.purpleLight, borderRadius: 12, padding: '10px 4px' }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.purple }}>{v}g</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.divider}`, padding: '20px', marginBottom: 20, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
            {fr ? "Objectifs par défaut appliqués — complète ton profil plus tard pour un plan personnalisé." : "Default goals applied — complete your profile later for a personalised plan."}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 24px 36px' }}>
        <button onClick={finish} disabled={saving}
          style={{ width: '100%', padding: 16, borderRadius: 20, background: C.purple, border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: saving ? 'default' : 'pointer', boxShadow: `0 4px 20px ${C.purple}44` }}>
          {saving ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Commencer avec Auron →' : 'Start using Auron →')}
        </button>
      </div>
    </div>
  )
}
