import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import { TabAuronCard } from './CoachAuron'
import HealthPreferences from './HealthPreferences'
import { subscribeToPush, unsubscribeFromPush, isPushSupported, pushPermissionState, hasExistingSubscription } from '../lib/pushSubscribe'

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
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
    <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.divider}`, boxShadow: T.shadowCard, padding: '16px 18px', ...style }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5, fontWeight: 500 }}>{children}</div>
}

function TextInput({ value, onChange, placeholder, type = 'text', onKeyDown }) {
  return (
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onKeyDown={onKeyDown}
      style={{ width: '100%', padding: '10px 13px', borderRadius: 11, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px 13px', borderRadius: 11, background: C.surfaceLight, border: `1px solid ${C.border}`, color: value ? C.text : C.textMuted, fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: C.surface }}>{o.label}</option>)}
    </select>
  )
}

function SaveButton({ onSave, saving, saved }) {
  const { t } = useTranslation()
  return (
    <button onClick={onSave} disabled={saving}
      style={{ width: '100%', padding: 13, borderRadius: 24, background: saved ? C.green : C.gold, color: saved ? '#fff' : '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', transition: 'background 0.2s', marginTop: 8 }}>
      {saving ? t('profile.saving') : saved ? t('profile.saved') : t('profile.saveChanges')}
    </button>
  )
}

function Avatar({ name, email, size = 72 }) {
  const initials = (name || email || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${T.heroGrad1}, ${T.heroGrad2})`, border: `2px solid ${T.purpleLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: size * 0.36, fontWeight: 600, color: '#fff', flexShrink: 0, boxShadow: T.shadow }}>
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page header
// ─────────────────────────────────────────────
function SubPageHeader({ title, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: T.textMuted, flexShrink: 0 }}>
        ‹
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{title}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Personal Information
// ─────────────────────────────────────────────
function PersonalInfoPage({ profile, onSave, onBack }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ full_name: '', age: '', gender: '', weight_kg: '', height_cm: '', nationality: '' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || '', age: profile.age || '', gender: profile.gender || '', weight_kg: profile.weight_kg || '', height_cm: profile.height_cm || '', nationality: profile.nationality || '' })
  }, [profile])

  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({ full_name: form.full_name, age: form.age ? parseInt(form.age) : null, gender: form.gender, weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null, height_cm: form.height_cm ? parseFloat(form.height_cm) : null, nationality: form.nationality })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const genderOptions = [
    { value: '', label: t('profile.genderSelect') },
    { value: 'male',       label: t('profile.genderMale')   },
    { value: 'female',     label: t('profile.genderFemale') },
    { value: 'other',      label: t('profile.genderOther')  },
    { value: 'prefer_not', label: t('profile.genderPrefer') },
  ]

  return (
    <div>
      <SubPageHeader title={t('profile.personalInfo')} onBack={onBack} />
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><FieldLabel>{t('profile.fullName')}</FieldLabel><TextInput value={form.full_name} onChange={set('full_name')} placeholder={t('profile.namePlaceholder')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><FieldLabel>{t('profile.age')}</FieldLabel><TextInput type="number" value={form.age} onChange={set('age')} placeholder={t('profile.agePlaceholder')} /></div>
            <div><FieldLabel>{t('profile.gender')}</FieldLabel><SelectInput value={form.gender} onChange={set('gender')} options={genderOptions} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><FieldLabel>{t('profile.weight')}</FieldLabel><TextInput type="number" value={form.weight_kg} onChange={set('weight_kg')} placeholder="53" /></div>
            <div><FieldLabel>{t('profile.height')}</FieldLabel><TextInput type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="168" /></div>
          </div>
          <div><FieldLabel>{t('profile.nationality')}</FieldLabel><TextInput value={form.nationality} onChange={set('nationality')} placeholder={t('profile.nationalityPlaceholder')} /></div>
        </div>
        <SaveButton onSave={handleSave} saving={saving} saved={saved} />
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Goals & Targets
// ─────────────────────────────────────────────
function GoalsPage({ profile, onSave, onBack }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ calorie_goal: '', protein_goal: '', carbs_goal: '', fat_goal: '', primary_goal: '' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [calc, setCalc] = useState({ age: '', gender: 'female', weight: '', height: '', activity: '1.375', goal: '0' })
  const [calcResult, setCalcResult] = useState(null)

  useEffect(() => {
    if (profile) setForm({ calorie_goal: profile.calorie_goal || '', protein_goal: profile.protein_goal || '', carbs_goal: profile.carbs_goal || '', fat_goal: profile.fat_goal || '', primary_goal: profile.primary_goal || '' })
  }, [profile])

  const set  = k => v => setForm(p => ({ ...p, [k]: v }))
  const setC = k => v => setCalc(p => ({ ...p, [k]: v }))

  const runCalc = () => {
    const age = parseInt(calc.age), w = parseFloat(calc.weight), h = parseFloat(calc.height)
    if (!age || !w || !h) return
    const bmr = calc.gender === 'male' ? 10*w + 6.25*h - 5*age + 5 : 10*w + 6.25*h - 5*age - 161
    const tdee = bmr * parseFloat(calc.activity)
    const target = tdee + parseFloat(calc.goal)
    const protein = Math.round(w * 2.2)
    setCalcResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target), protein })
  }

  const applyCalc = () => {
    if (!calcResult) return
    const carbs = Math.round((calcResult.target * 0.45) / 4)
    const fat   = Math.round((calcResult.target * 0.25) / 9)
    setForm(p => ({ ...p, calorie_goal: String(calcResult.target), protein_goal: String(calcResult.protein), carbs_goal: String(carbs), fat_goal: String(fat) }))
    setShowCalc(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave({ calorie_goal: form.calorie_goal ? parseInt(form.calorie_goal) : null, protein_goal: form.protein_goal ? parseInt(form.protein_goal) : null, carbs_goal: form.carbs_goal ? parseInt(form.carbs_goal) : null, fat_goal: form.fat_goal ? parseInt(form.fat_goal) : null, primary_goal: form.primary_goal })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const goalOptions = [
    { value: '',              label: t('profile.genderSelect') },
    { value: 'Lose weight',   label: t('profile.loseWeight')   },
    { value: 'Build muscle',  label: t('profile.buildMuscle')  },
    { value: 'Improve endurance', label: t('profile.endurance') },
    { value: 'General health',    label: t('profile.generalHealth') },
    { value: 'Maintain weight',   label: t('profile.maintain') },
  ]

  const activityOptions = [
    { value: '1.2',   label: t('profile.act1') },
    { value: '1.375', label: t('profile.act2') },
    { value: '1.55',  label: t('profile.act3') },
    { value: '1.725', label: t('profile.act4') },
    { value: '1.9',   label: t('profile.act5') },
  ]

  return (
    <div>
      <SubPageHeader title={t('profile.fitnessGoal')} onBack={onBack} />
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><FieldLabel>{t('profile.fitnessGoal')}</FieldLabel><SelectInput value={form.primary_goal} onChange={set('primary_goal')} options={goalOptions} /></div>
          <div><FieldLabel>{t('profile.dailyCalGoal')} (kcal)</FieldLabel><TextInput type="number" value={form.calorie_goal} onChange={set('calorie_goal')} placeholder="2000" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div><FieldLabel>{t('profile.protein')}</FieldLabel><TextInput type="number" value={form.protein_goal} onChange={set('protein_goal')} placeholder="150" /></div>
            <div><FieldLabel>{t('profile.carbsG')}</FieldLabel><TextInput type="number" value={form.carbs_goal} onChange={set('carbs_goal')} placeholder="250" /></div>
            <div><FieldLabel>{t('profile.fatG')}</FieldLabel><TextInput type="number" value={form.fat_goal} onChange={set('fat_goal')} placeholder="70" /></div>
          </div>
        </div>
        <button onClick={() => setShowCalc(s => !s)} style={{ width: '100%', padding: '10px', borderRadius: 12, background: T.purpleLight, border: `1px solid ${T.border}`, color: T.purple, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>
          {showCalc ? t('profile.hideCalc') : t('profile.calculator')}
        </button>
        <SaveButton onSave={handleSave} saving={saving} saved={saved} />
      </Card>

      {showCalc && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>{t('profile.calcTitle')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><FieldLabel>{t('profile.calcAge')}</FieldLabel><TextInput type="number" value={calc.age} onChange={setC('age')} placeholder="25" /></div>
              <div><FieldLabel>{t('profile.calcGender')}</FieldLabel>
                <SelectInput value={calc.gender} onChange={setC('gender')} options={[{ value: 'female', label: t('profile.calcFemale') }, { value: 'male', label: t('profile.calcMale') }]} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><FieldLabel>{t('profile.calcWeight')}</FieldLabel><TextInput type="number" value={calc.weight} onChange={setC('weight')} placeholder="65" /></div>
              <div><FieldLabel>{t('profile.calcHeight')}</FieldLabel><TextInput type="number" value={calc.height} onChange={setC('height')} placeholder="170" /></div>
            </div>
            <div><FieldLabel>{t('profile.activityLabel')}</FieldLabel><SelectInput value={calc.activity} onChange={setC('activity')} options={activityOptions} /></div>
            <div><FieldLabel>{t('profile.goalLabel')}</FieldLabel>
              <SelectInput value={calc.goal} onChange={setC('goal')} options={[
                { value: '-1000', label: t('profile.goalLoseFast') },{ value: '-500', label: t('profile.goalLose') },
                { value: '0', label: t('profile.goalMaintain') },{ value: '500', label: t('profile.goalGain') },{ value: '1000', label: t('profile.goalGainFast') },
              ]} />
            </div>
          </div>
          <button onClick={runCalc} style={{ width: '100%', padding: 11, borderRadius: 12, background: T.purple, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>{t('profile.calculate')}</button>
          {calcResult && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                {[[t('profile.bmr'), calcResult.bmr, t('profile.bmrSub')], [t('profile.maintenance'), calcResult.tdee, t('profile.maintenanceSub')], [t('profile.target'), calcResult.target, 'kcal/day']].map(([l,v,s]) => (
                  <div key={l} style={{ background: T.surfaceMid, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.purple }}>{v}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{l}</div>
                    <div style={{ fontSize: 9, color: T.textDim }}>{s}</div>
                  </div>
                ))}
              </div>
              <button onClick={applyCalc} style={{ width: '100%', padding: 11, borderRadius: 12, background: T.greenLight, color: T.green, border: `1px solid ${T.green}44`, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('profile.applyTargets')}</button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Language
// ─────────────────────────────────────────────
function LanguagePage({ lang, setLang, updateProfile, onBack }) {
  const { t } = useTranslation()

  const handleLangChange = async (newLang) => {
    setLang(newLang)
    await updateProfile({ language: newLang })
  }

  return (
    <div>
      <SubPageHeader title={t('profile.language')} onBack={onBack} />
      <Card>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{t('profile.selectLang')}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ code: 'en', label: 'English', flag: '🇬🇧' }, { code: 'fr', label: 'Français', flag: '🇫🇷' }].map(l => (
            <button key={l.code} onClick={() => handleLangChange(l.code)} style={{ flex: 1, padding: '16px 8px', borderRadius: 16, cursor: 'pointer', border: `1px solid ${lang === l.code ? T.purple : T.border}`, background: lang === l.code ? T.purpleLight : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 28 }}>{l.flag}</span>
              <span style={{ fontSize: 14, fontWeight: lang === l.code ? 700 : 400, color: lang === l.code ? T.purple : T.textMuted }}>{l.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Health & Food Preferences
// ─────────────────────────────────────────────
function HealthPage({ preferences, updatePreferences, onBack }) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const handleSave = async (data) => {
    setSaving(true)
    await updatePreferences(data)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <SubPageHeader title={t('profile.healthPrefs')} onBack={onBack} />
      <HealthPreferences preferences={preferences} onSave={handleSave} saving={saving} saved={saved} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Notifications (placeholder)
// ─────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange, disabled = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <div style={{ paddingRight: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        onClick={() => !disabled && onChange(!value)}
        style={{
          width: 48, height: 28, borderRadius: 14, flexShrink: 0,
          background: value ? T.purple : T.border,
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  )
}

function NotificationsPage({ userId, onBack }) {
  const { t } = useTranslation()
  const supported = isPushSupported()
  const [permission,   setPermission]   = useState(pushPermissionState())
  const [subscribed,   setSubscribed]   = useState(false)
  const [checking,     setChecking]     = useState(true)

  useEffect(() => {
    if (!supported) { setChecking(false); return }
    hasExistingSubscription().then(v => { setSubscribed(v); setChecking(false) })
  }, [])

  const handleToggle = async (turnOn) => {
    if (turnOn) {
      const result = await subscribeToPush(userId)
      setPermission(pushPermissionState())
      setSubscribed(result.state === 'granted')
    } else {
      await unsubscribeFromPush(userId)
      setSubscribed(false)
    }
  }

  return (
    <div>
      <SubPageHeader title={t('push.title')} onBack={onBack} />

      {!supported && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📱</div>
            <div style={{ fontSize: 13.5, color: T.textMuted, lineHeight: 1.5 }}>{t('push.webUnavailable')}</div>
          </div>
        </Card>
      )}

      {supported && permission === 'denied' && (
        <Card style={{ marginBottom: 12, borderColor: 'rgba(224,82,82,0.3)' }}>
          <div style={{ fontSize: 13, color: T.red, lineHeight: 1.5 }}>{t('push.deniedHint')}</div>
        </Card>
      )}

      {supported && !checking && (
        <Card style={{ padding: '4px 18px' }}>
          <ToggleRow
            label={t('push.enable')}
            sub={t('push.enableSub')}
            value={subscribed}
            disabled={permission === 'denied'}
            onChange={handleToggle}
          />
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Privacy (placeholder)
// ─────────────────────────────────────────────
function PrivacyPage({ onBack }) {
  return (
    <div>
      <SubPageHeader title="Privacy" onBack={onBack} />
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>Your data stays with you</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Auron never sells your data. All your health information is stored securely and privately.</div>
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-page: Account
// ─────────────────────────────────────────────
function AccountPage({ user, onSignOut, lang, onBack }) {
  const { t } = useTranslation()
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div>
      <SubPageHeader title={t('profile.account')} onBack={onBack} />
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${T.divider}`, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: T.textMuted }}>{t('profile.email')}</span>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{user?.email}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: T.textMuted }}>{t('profile.memberSince')}</span>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{joinDate}</span>
        </div>
      </Card>
      <button onClick={onSignOut} style={{ width: '100%', padding: 13, borderRadius: 16, background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', color: T.red, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        {t('profile.signOut')}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Menu row item
// ─────────────────────────────────────────────
function MenuItem({ icon, label, onPress, badge, danger = false }) {
  return (
    <button onClick={onPress} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.divider}`, textAlign: 'left' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'rgba(224,82,82,0.1)' : T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? T.red : T.text }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: T.purpleLight, color: T.purple, fontWeight: 600 }}>{badge}</span>
      )}
      {!danger && <span style={{ fontSize: 18, color: T.textDim }}>›</span>}
    </button>
  )
}

// ─────────────────────────────────────────────
// Main ProfileTab
// ─────────────────────────────────────────────
export default function ProfileTab({ user, profile, updateProfile, preferences, updatePreferences, lang, setLang, onOpenMeds }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(null) // null = hub, or 'personal' | 'goals' | 'health' | 'language' | 'notifications' | 'privacy' | 'account'

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || ''
  const calorieGoal = profile?.calorie_goal || 2200

  // Active health prefs count for badge
  const activePrefs = [
    ...(preferences?.dietary_preferences || []),
    ...(preferences?.allergies || []),
    ...(preferences?.food_restrictions || []),
    ...(preferences?.avoided_foods || []),
  ].length

  const missingCount = [profile?.height_cm, profile?.weight_kg, profile?.primary_goal]
    .filter(v => !v).length

  const profileCtx = {
    missingCount,
    streakDays: profile?.streak_days || 0,
    activePrefsCount: activePrefs,
  }

  // Sub-pages
  if (page === 'personal')      return <PersonalInfoPage  profile={profile}         onSave={updateProfile}      onBack={() => setPage(null)} />
  if (page === 'goals')         return <GoalsPage          profile={profile}         onSave={updateProfile}      onBack={() => setPage(null)} />
  if (page === 'health')        return <HealthPage         preferences={preferences} updatePreferences={updatePreferences} onBack={() => setPage(null)} />
  if (page === 'language')      return <LanguagePage       lang={lang}               setLang={setLang}           updateProfile={updateProfile} onBack={() => setPage(null)} />
  if (page === 'notifications') return <NotificationsPage  userId={user?.id}         onBack={() => setPage(null)} />
  if (page === 'privacy')       return <PrivacyPage        onBack={() => setPage(null)} />
  if (page === 'account')       return <AccountPage        user={user}               onSignOut={async () => { await unsubscribeFromPush(user?.id); await supabase.auth.signOut() }} lang={lang} onBack={() => setPage(null)} />

  // ── Hub ──────────────────────────────────────
  return (
    <div>
      <TabAuronCard tab="profile" ctx={profileCtx} lang={lang} />

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Avatar name={profile?.full_name} email={user?.email} size={64} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{profile?.full_name || user?.email?.split('@')[0]}</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>{user?.email}</div>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
        {[
          { label: t('profile.weight'), value: profile?.weight_kg ? `${profile.weight_kg}kg` : '—' },
          { label: t('profile.height'), value: profile?.height_cm ? `${profile.height_cm}cm` : '—' },
          { label: 'Goal', value: profile?.primary_goal?.split(' ')[0] || '—' },
          { label: 'kcal', value: calorieGoal.toLocaleString() },
        ].map(s => (
          <div key={s.label} style={{ background: T.surface, borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: `1px solid ${T.divider}`, boxShadow: T.shadowCard }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.purple, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <Card style={{ padding: '0 18px' }}>
        <MenuItem icon="💊" label={t('meds.title')}         onPress={onOpenMeds} />
        <MenuItem icon="👤" label={t('profile.personalInfo')}  onPress={() => setPage('personal')} />
        <MenuItem icon="🎯" label={t('profile.fitnessGoal')}   onPress={() => setPage('goals')} />
        <MenuItem icon="🥗" label={t('profile.healthPrefs')}   onPress={() => setPage('health')}  badge={activePrefs > 0 ? `${activePrefs}` : null} />
        <MenuItem icon="🌐" label={t('profile.language')}      onPress={() => setPage('language')} badge={lang === 'fr' ? '🇫🇷' : '🇬🇧'} />
        <MenuItem icon="🔔" label={t('push.title')}          onPress={() => setPage('notifications')} />
        <MenuItem icon="🔒" label="Privacy"                    onPress={() => setPage('privacy')} />
        <div style={{ borderBottom: 'none' }}>
          <MenuItem icon="⚙️" label={t('profile.account')}    onPress={() => setPage('account')} />
        </div>
      </Card>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: T.textDim, marginTop: 20, lineHeight: 1.6, textAlign: 'center' }}>
        {t('disclaimer.line1')}<br />{t('disclaimer.line2')}
      </div>
    </div>
  )
}
