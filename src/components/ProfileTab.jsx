import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import HealthPreferences from './HealthPreferences'

const C = {
  gold:         T.purple,
  goldLight:    T.purpleLight,
  goldDark:     T.purpleDark,
  dark:         T.pageBg,
  surface:      T.surface,
  surfaceLight: T.surfaceMid,
  surfaceMid:   T.surfaceMid,
  border:       T.border,
  borderStrong: T.borderStrong,
  text:         T.text,
  textMuted:    T.textMuted,
  textDim:      T.textDim,
  green:        T.green,
  greenLight:   T.greenLight,
  red:          T.red,
  blue:         T.blue,
  amber:        T.amber,
  purple:       T.purple,
}

// ─────────────────────────────────────────────
// Shared primitives
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

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: C.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 5, fontWeight: 500 }}>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 13px', borderRadius: 11,
        background: C.surfaceLight, border: `1px solid ${C.border}`,
        color: C.text, fontSize: 14, outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = C.goldDark}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 13px', borderRadius: 11,
        background: C.surfaceLight, border: `1px solid ${C.border}`,
        color: value ? C.text : C.textMuted,
        fontSize: 14, outline: 'none', appearance: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: C.surface }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function SaveButton({ onSave, saving, saved, label }) {
  const { t } = useTranslation()
  const btnLabel = label || t('profile.saveChanges')
  return (
    <button
      onClick={onSave}
      disabled={saving}
      style={{
        width: '100%', padding: 13, borderRadius: 24,
        background: saved ? C.green : saving ? C.surfaceLight : C.gold,
        color: saved ? '#fff' : saving ? C.textMuted : C.dark,
        border: 'none', fontSize: 14, fontWeight: 600,
        cursor: saving ? 'default' : 'pointer',
        opacity: saving ? 0.7 : 1,
        transition: 'background 0.2s',
      }}
    >
      {saving ? t('profile.saving') : saved ? t('profile.saved') : btnLabel}
    </button>
  )
}

// ─────────────────────────────────────────────
// Avatar — initials placeholder, ready for photo
// ─────────────────────────────────────────────
function Avatar({ name, email, size = 72 }) {
  const initials = name
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || 'A'

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${T.heroGrad1}, ${T.heroGrad2})`,
      border: `2px solid ${T.purpleLight}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Playfair Display', serif",
      fontSize: size * 0.36, fontWeight: 600, color: '#fff',
      flexShrink: 0, position: 'relative',
      boxShadow: T.shadow,
    }}>
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────
// Macro bar — shows current vs goal
// ─────────────────────────────────────────────
function MacroBar({ label, value, goal, color }) {
  const { t } = useTranslation()
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{goal}g {t('profile.perDay')}</span>
      </div>
      <div style={{ height: 5, background: C.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 1 — Personal Info
// ─────────────────────────────────────────────
function PersonalInfoSection({ profile, onSave }) {
  const { t } = useTranslation()
  const [form, setForm]     = useState({
    full_name:   profile?.full_name   || '',
    age:         profile?.age         || '',
    weight_kg:   profile?.weight_kg   || '',
    height_cm:   profile?.height_cm   || '',
    gender:      profile?.gender      || '',
    nationality: profile?.nationality || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // Sync when profile loads from DB
  useEffect(() => {
    if (!profile) return
    setForm({
      full_name:   profile.full_name   || '',
      age:         profile.age         || '',
      weight_kg:   profile.weight_kg   || '',
      height_cm:   profile.height_cm   || '',
      gender:      profile.gender      || '',
      nationality: profile.nationality || '',
    })
  }, [profile?.updated_at])

  const set = key => val => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      full_name:   form.full_name,
      age:         parseInt(form.age)          || null,
      weight_kg:   parseFloat(form.weight_kg)  || null,
      height_cm:   parseFloat(form.height_cm)  || null,
      gender:      form.gender,
      nationality: form.nationality,
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>{t('profile.personalInfo')}</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <FieldLabel>{t('profile.fullName')}</FieldLabel>
            <TextInput value={form.full_name} onChange={set('full_name')} placeholder={t('profile.namePlaceholder')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel>{t('profile.age')}</FieldLabel>
              <TextInput type="number" value={form.age} onChange={set('age')} placeholder="25" />
            </div>
            <div>
              <FieldLabel>{t('profile.gender')}</FieldLabel>
              <SelectInput
                value={form.gender}
                onChange={set('gender')}
                options={[
                  { value: '',        label: t('profile.genderSelect') },
                  { value: 'male',    label: t('profile.genderMale') },
                  { value: 'female',  label: t('profile.genderFemale') },
                  { value: 'other',   label: t('profile.genderOther') },
                  { value: 'prefer_not', label: t('profile.genderPrefer') },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel>{t('profile.weight')}</FieldLabel>
              <TextInput type="number" value={form.weight_kg} onChange={set('weight_kg')} placeholder="70" />
            </div>
            <div>
              <FieldLabel>{t('profile.height')}</FieldLabel>
              <TextInput type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="175" />
            </div>
          </div>

          <div>
            <FieldLabel>{t('profile.nationality')}</FieldLabel>
            <TextInput value={form.nationality} onChange={set('nationality')} placeholder={t('profile.nationalityPlaceholder')} />
          </div>

        </div>

        <div style={{ marginTop: 18 }}>
          <SaveButton onSave={handleSave} saving={saving} saved={saved} />
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 2 — Calorie & Macro Targets
// (includes inline BMR calculator)
// ─────────────────────────────────────────────
function CalorieTargetsSection({ profile, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    calorie_goal: profile?.calorie_goal || 2200,
    protein_goal: profile?.protein_goal || 150,
    carbs_goal:   profile?.carbs_goal   || 250,
    fat_goal:     profile?.fat_goal     || 73,
  })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)

  // Calculator state
  const [calcForm, setCalcForm] = useState({
    age:      profile?.age        || '',
    weight:   profile?.weight_kg  || '',
    height:   profile?.height_cm  || '',
    gender:   profile?.gender     || 'male',
    activity: '1.55',
    goal:     'maintain',
  })
  const [calcResult, setCalcResult] = useState(null)

  useEffect(() => {
    if (!profile) return
    setForm({
      calorie_goal: profile.calorie_goal || 2200,
      protein_goal: profile.protein_goal || 150,
      carbs_goal:   profile.carbs_goal   || 250,
      fat_goal:     profile.fat_goal     || 73,
    })
  }, [profile?.updated_at])

  const set = key => val => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      calorie_goal: parseInt(form.calorie_goal) || 2200,
      protein_goal: parseInt(form.protein_goal) || 150,
      carbs_goal:   parseInt(form.carbs_goal)   || 250,
      fat_goal:     parseInt(form.fat_goal)      || 73,
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const goalAdj    = { lose_fast: -500, lose: -250, maintain: 0, gain: 250, gain_fast: 500 }
  const goalLabels = {
    lose_fast: t('profile.goalLoseFast'), lose: t('profile.goalLose'),
    maintain: t('profile.goalMaintain'),
    gain: t('profile.goalGain'), gain_fast: t('profile.goalGainFast'),
  }
  const activityOptions = [
    { value: '1.2',   label: t('profile.act1')       },
    { value: '1.375', label: t('profile.act2')      },
    { value: '1.55',  label: t('profile.act3')   },
    { value: '1.725', label: t('profile.act4')     },
    { value: '1.9',   label: t('profile.act5')      },
  ]

  const runCalculator = () => {
    const w = parseFloat(calcForm.weight)
    const h = parseFloat(calcForm.height)
    const a = parseFloat(calcForm.age)
    if (!w || !h || !a) return
    const bmr    = calcForm.gender === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5
    const tdee   = Math.round(bmr * parseFloat(calcForm.activity))
    const target = tdee + (goalAdj[calcForm.goal] || 0)
    const protein = Math.round(w * 2.2)
    const fat     = Math.round((target * 0.25) / 9)
    const carbs   = Math.round((target - protein * 4 - fat * 9) / 4)
    setCalcResult({ target, protein, carbs, fat, bmr: Math.round(bmr), tdee })
  }

  const applyCalculator = async () => {
    if (!calcResult) return
    setForm({
      calorie_goal: calcResult.target,
      protein_goal: calcResult.protein,
      carbs_goal:   calcResult.carbs,
      fat_goal:     calcResult.fat,
    })
    setCalcOpen(false)
    setCalcResult(null)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>{t('profile.calorieTargets')}</SectionTitle>
      <Card>

        {/* Current targets */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.text }}>{t('profile.dailyCalGoalLabel')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={form.calorie_goal}
                onChange={e => set('calorie_goal')(e.target.value)}
                style={{
                  width: 80, padding: '6px 10px', borderRadius: 10,
                  background: C.surfaceLight, border: `1px solid ${C.border}`,
                  color: C.gold, fontSize: 16, fontWeight: 700,
                  outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ fontSize: 12, color: C.textMuted }}>kcal</span>
            </div>
          </div>

          <MacroBar label={t('profile.macroProtein')} value={0} goal={form.protein_goal} color={C.blue} />
          <MacroBar label={t('profile.macroCarbs')}   value={0} goal={form.carbs_goal}   color={C.amber} />
          <MacroBar label={t('profile.macroFat')}     value={0} goal={form.fat_goal}     color={C.gold} />
        </div>

        {/* Macro goal inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { key: 'protein_goal', label: t('profile.protein'), color: C.blue  },
            { key: 'carbs_goal',   label: t('profile.carbsG'),   color: C.amber },
            { key: 'fat_goal',     label: t('profile.fatG'),     color: C.gold  },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <input
                type="number"
                value={form[key]}
                onChange={e => set(key)(e.target.value)}
                style={{
                  width: '100%', padding: '9px 10px', borderRadius: 11,
                  background: C.surfaceLight, border: `1px solid ${C.border}`,
                  color, fontSize: 15, fontWeight: 600,
                  outline: 'none', textAlign: 'center',
                }}
              />
            </div>
          ))}
        </div>

        {/* Calculator toggle */}
        <button
          onClick={() => { setCalcOpen(o => !o); setCalcResult(null) }}
          style={{
            width: '100%', padding: '10px', borderRadius: 12, marginBottom: 14,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.textMuted, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {calcOpen ? t('profile.hideCalc') : t('profile.calculator')}
        </button>

        {/* Inline BMR / TDEE calculator */}
        {calcOpen && (
          <div style={{
            background: C.surfaceMid, borderRadius: 14,
            border: `1px solid ${C.border}`, padding: '16px 14px',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Calorie calculator
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <FieldLabel>{t('profile.age')}</FieldLabel>
                <input type="number" value={calcForm.age} onChange={e => setCalcForm(p => ({ ...p, age: e.target.value }))} placeholder="25"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <FieldLabel>{t('profile.gender')}</FieldLabel>
                <SelectInput value={calcForm.gender} onChange={v => setCalcForm(p => ({ ...p, gender: v }))}
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
              </div>
              <div>
                <FieldLabel>{t('profile.weight')}</FieldLabel>
                <input type="number" value={calcForm.weight} onChange={e => setCalcForm(p => ({ ...p, weight: e.target.value }))} placeholder="70"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <FieldLabel>{t('profile.height')}</FieldLabel>
                <input type="number" value={calcForm.height} onChange={e => setCalcForm(p => ({ ...p, height: e.target.value }))} placeholder="175"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <FieldLabel>Activity level</FieldLabel>
              <SelectInput value={calcForm.activity} onChange={v => setCalcForm(p => ({ ...p, activity: v }))} options={activityOptions} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Goal</FieldLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(goalLabels).map(([k, v]) => (
                  <button key={k} onClick={() => setCalcForm(p => ({ ...p, goal: k }))} style={{
                    padding: '6px 11px', borderRadius: 20, fontSize: 11,
                    border: `1px solid ${calcForm.goal === k ? C.gold : C.border}`,
                    background: calcForm.goal === k ? C.goldLight : 'transparent',
                    color: calcForm.goal === k ? C.gold : C.textMuted, cursor: 'pointer',
                  }}>{v}</button>
                ))}
              </div>
            </div>

            <button onClick={runCalculator} style={{ width: '100%', padding: '10px', borderRadius: 20, background: C.gold, color: C.dark, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: calcResult ? 12 : 0 }}>
              Calculate
            </button>

            {calcResult && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: t('profile.bmr'),        value: calcResult.bmr,    sub: t('profile.bmrSub')   },
                    { label: t('profile.maintenance'), value: calcResult.tdee,   sub: t('profile.maintenanceSub')      },
                    { label: t('profile.target'),     value: calcResult.target,  sub: t('profile.maintenanceSub'),  gold: true },
                    { label: t('profile.proteinResult'),    value: `${calcResult.protein}g`, sub: t('profile.perDay') },
                  ].map(item => (
                    <div key={item.label} style={{ background: C.surfaceLight, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: item.gold ? C.gold : C.text }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: C.textDim }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <button onClick={applyCalculator} style={{ width: '100%', padding: '10px', borderRadius: 20, background: C.gold, color: C.dark, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Apply these targets ✓
                </button>
              </div>
            )}
          </div>
        )}

        <SaveButton onSave={handleSave} saving={saving} saved={saved} />
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 3 — Fitness Goal
// ─────────────────────────────────────────────
function FitnessGoalSection({ profile, onSave }) {
  const { t } = useTranslation()
  const goals = [t('profile.loseWeight'), t('profile.buildMuscle'), t('profile.endurance'), t('profile.generalHealth'), t('profile.goalMaintain')]
  const [selected, setSelected] = useState(profile?.primary_goal || '')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => { if (profile?.primary_goal) setSelected(profile.primary_goal) }, [profile?.primary_goal])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ primary_goal: selected })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>{t('profile.fitnessGoal')}</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {goals.map(g => (
            <button key={g} onClick={() => setSelected(g)} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13,
              border: `1px solid ${selected === g ? C.gold : C.border}`,
              background: selected === g ? C.goldLight : 'transparent',
              color: selected === g ? C.gold : C.textMuted,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{g}</button>
          ))}
        </div>
        <SaveButton onSave={handleSave} saving={saving} saved={saved} />
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 4 — Workout Preferences (placeholder)
// Ready to expand in a future phase
// ─────────────────────────────────────────────
function WorkoutPreferencesSection() {
  const { t } = useTranslation()
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>{t('profile.workoutPrefs')}</SectionTitle>
      <Card style={{ border: `1px dashed ${C.border}` }}>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>
          {t('profile.workoutComingSoon')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: 0.4, pointerEvents: 'none' }}>
          {['Gym', 'Home', 'Outdoors', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Swimming'].map(tag => (
            <div key={tag} style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12, border: `1px solid ${C.border}`, color: C.textMuted }}>
              {tag}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 5 — Health & Food Preferences
// Wrapper that passes through to existing component
// ─────────────────────────────────────────────
function HealthPreferencesSection({ preferences, onSave }) {
  const { t } = useTranslation()
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const handleSave = async (updates) => {
    setSaving(true)
    await onSave(updates)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Count active preferences for the summary badge
  const activeCount = [
    ...(preferences?.dietary_preferences  || []),
    ...(preferences?.allergies            || []),
    ...(preferences?.food_restrictions    || []),
    ...(preferences?.avoided_foods        || []),
  ].length

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Tappable header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: C.surface, border: `1px solid ${open ? C.borderStrong : C.border}`,
          borderRadius: open ? '16px 16px 0 0' : 16,
          padding: '14px 18px', cursor: 'pointer',
          transition: 'border-color 0.15s, border-radius 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t('profile.healthPrefs')}
          </span>
          {activeCount > 0 && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: C.goldLight, color: C.gold, fontWeight: 600 }}>
              {t('health.active').replace('{n}', activeCount)}
            </span>
          )}
        </div>
        <span style={{ fontSize: 16, color: C.textMuted, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {/* Collapsible content */}
      {open && (
        <div style={{
          background: C.surface,
          border: `1px solid ${C.borderStrong}`,
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          padding: '16px 18px 18px',
        }}>
          <HealthPreferences
            preferences={preferences || {}}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Section 6 — Account
// ─────────────────────────────────────────────
function AccountSection({ user, onSignOut }) {
  const { t } = useTranslation()
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>{t('profile.account')}</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>{t('profile.email')}</span>
            <span style={{ fontSize: 13, color: C.text }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>{t('profile.memberSince')}</span>
            <span style={{ fontSize: 13, color: C.text }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
          <button
            onClick={onSignOut}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, marginTop: 4,
              background: 'transparent', border: `1px solid ${C.red}33`,
              color: C.red, fontSize: 13, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = `${C.red}12`}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            {t('profile.signOut')}
          </button>
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main ProfileTab export
// ─────────────────────────────────────────────
export default function ProfileTab({ user, profile, updateProfile, preferences, updatePreferences, lang, setLang }) {
  const { t } = useTranslation()
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Auron User'

  const handleLangChange = async (newLang) => {
    setLang(newLang)
    // Also persist to profile so it loads on next login
    await updateProfile({ language: newLang })
  }

  return (
    <div>
      {/* ── Profile header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 28, paddingBottom: 24,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Avatar name={profile?.full_name} email={user?.email} size={68} />
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{user?.email}</div>
          {(profile?.primary_goal || profile?.weight_kg) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {profile.primary_goal && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: C.goldLight, color: C.gold, fontWeight: 500 }}>
                  {profile.primary_goal}
                </span>
              )}
              {profile.weight_kg && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: C.surfaceLight, color: C.textMuted }}>
                  {profile.weight_kg} kg
                </span>
              )}
              {profile.height_cm && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: C.surfaceLight, color: C.textMuted }}>
                  {profile.height_cm} cm
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sections ── */}
      <PersonalInfoSection       profile={profile}      onSave={updateProfile} />
      <CalorieTargetsSection     profile={profile}      onSave={updateProfile} />
      <FitnessGoalSection        profile={profile}      onSave={updateProfile} />
      <WorkoutPreferencesSection />
      <HealthPreferencesSection  preferences={preferences} onSave={updatePreferences} />

      {/* ── Language ── */}
      {lang !== undefined && setLang && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            {t('profile.language')}
          </div>
          <Card>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>
              {t('profile.selectLang')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ code: 'en', label: 'English', flag: '🇬🇧' }, { code: 'fr', label: 'Français', flag: '🇫🇷' }].map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
                    border: `1px solid ${lang === l.code ? C.gold : C.border}`,
                    background: lang === l.code ? C.goldLight : 'transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 26 }}>{l.flag}</span>
                  <span style={{ fontSize: 13, fontWeight: lang === l.code ? 600 : 400, color: lang === l.code ? C.gold : C.textMuted }}>{l.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <AccountSection user={user} onSignOut={() => supabase.auth.signOut()} />
    </div>
  )
}
