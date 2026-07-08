import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useProfile } from './hooks/useProfile'
import { usePreferences } from './hooks/usePreferences'
import { useMedications } from './hooks/useMedications'
import { T, globalCss } from './lib/theme'
import { useTranslation, LANGUAGES } from './lib/i18n.jsx'
import TodayTab from './components/TodayTab'
import ProfileTab from './components/ProfileTab'
import CaloriesTab from './components/CaloriesTab'
import MedicationTab from './components/MedicationTab'
import ProgressTab from './components/ProgressTab'
import WorkoutTab from './components/WorkoutTab'
import Auth from './components/Auth'

// ── SVG tab icons ────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        fill={active ? T.purple : 'none'}
        stroke={active ? T.purple : T.textMuted}
        strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
function NutritionIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 2 5 5 5 9C5 13 8 16 12 22C16 16 19 13 19 9C19 5 16 2 12 2Z"
        fill={active ? T.purple : 'none'}
        stroke={active ? T.purple : T.textMuted}
        strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5"
        fill={active ? 'white' : T.textMuted}
        opacity={active ? 1 : 0.5} />
    </svg>
  )
}
function ProgressIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="14" width="4" height="7" rx="1"
        fill={active ? T.purple : T.textMuted} opacity={active ? 1 : 0.4} />
      <rect x="10" y="9" width="4" height="12" rx="1"
        fill={active ? T.purple : T.textMuted} opacity={active ? 1 : 0.6} />
      <rect x="17" y="4" width="4" height="17" rx="1"
        fill={active ? T.purple : T.textMuted} opacity={active ? 1 : 0.8} />
    </svg>
  )
}
function PlansIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" fill="none" />
      <line x1="8" y1="9" x2="16" y2="9"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="13" x2="14" y2="13"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="2" width="3" height="4" rx="1"
        fill={active ? T.purple : T.textMuted} />
      <rect x="15" y="2" width="3" height="4" rx="1"
        fill={active ? T.purple : T.textMuted} />
    </svg>
  )
}
function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" fill="none" />
      <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function MedIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="3"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" fill="none" />
      <line x1="3" y1="10" x2="21" y2="10"
        stroke={active ? T.purple : T.textMuted} strokeWidth="1.8" />
      <circle cx="8" cy="15" r="1.5"
        fill={active ? T.purple : T.textMuted} />
      <circle cx="12" cy="15" r="1.5"
        fill={active ? T.purple : T.textMuted} />
      <circle cx="16" cy="15" r="1.5"
        fill={active ? T.purple : T.textMuted} />
    </svg>
  )
}

function WorkoutIcon({ active }) {
  const c = active ? T.purple : T.textMuted
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Barbell icon */}
      <rect x="2" y="10.5" width="3" height="3" rx="0.5" fill={c} />
      <rect x="5" y="9" width="2" height="6" rx="0.5" fill={c} />
      <rect x="7" y="11" width="10" height="2" rx="1" fill={c} />
      <rect x="17" y="9" width="2" height="6" rx="0.5" fill={c} />
      <rect x="19" y="10.5" width="3" height="3" rx="0.5" fill={c} />
    </svg>
  )
}

export default function App() {
  const [tab,     setTab]     = useState('today')
  const [session, setSession] = useState(undefined)
  const { t, lang, setLang }  = useTranslation()

  // Translated tab labels — inside component so t() is live
  const TABS = [
    { id: 'today',      label: t('nav.home'),      icon: HomeIcon      },
    { id: 'calories',   label: t('nav.nutrition'), icon: NutritionIcon },
    { id: 'workouts',   label: t('nav.progress'),  icon: ProgressIcon  },
    { id: 'workout',    label: t('nav.workout'),   icon: WorkoutIcon   },
    { id: 'medication', label: t('nav.meds'),       icon: MedIcon       },
    { id: 'profile',    label: t('nav.profile'),   icon: ProfileIcon   },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const uid = session?.user?.id
  const { profile,     updateProfile     } = useProfile(uid)
  const { preferences, updatePreferences } = usePreferences(uid)

  // selectedDate shared between TodayTab and useMedications so med card reflects the right day
  const [viewDate, setViewDate] = useState(null) // null = today

  const { medications, takenCount, missedCount, nextMed, markTaken, getStatusForMed } = useMedications(uid, profile?.timezone, viewDate)

  const hour = new Date().getHours()
  const greeting = hour < 5 ? t('greeting.late') : hour < 12 ? t('greeting.morning') : hour < 17 ? t('greeting.afternoon') : t('greeting.evening')
  const firstName = profile?.full_name?.split(' ')[0] || session?.user?.email?.split('@')[0] || ''

  // Sync language from profile when it loads
  useEffect(() => {
    if (profile?.language && profile.language !== lang) setLang(profile.language)
  }, [profile?.language])

  // ── Loading ──────────────────────────────────
  if (session === undefined) {
    return (
      <>
        <style>{globalCss}</style>
        <div style={{ minHeight: '100vh', background: T.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
              background: `linear-gradient(135deg, ${T.heroGrad1}, ${T.heroGrad2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.shadowStrong,
            }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#fff', fontWeight: 700 }}>A</span>
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: T.purple, marginBottom: 16, fontWeight: 700 }}>
              Auron
            </div>
            <div style={{ width: 24, height: 24, border: `3px solid ${T.purpleLight}`, borderTopColor: T.purple, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        </div>
      </>
    )
  }

  // ── Not logged in ────────────────────────────
  if (!session) {
    return (
      <>
        <style>{globalCss}</style>
        <Auth />
      </>
    )
  }

  // ── Screens ──────────────────────────────────
  const screens = {
    today: (
      <TodayTab
        userId={uid} profile={profile} updateProfile={updateProfile}
        preferences={preferences} updatePreferences={updatePreferences}
        medications={medications} takenCount={takenCount}
        missedCount={missedCount} nextMed={nextMed}
        markTaken={markTaken} getStatusForMed={getStatusForMed}
        onOpenMeds={() => setTab('medication')}
        onDateChange={setViewDate}
        onOpenWorkout={() => setTab('workout')}
        onOpenNutrition={() => setTab('calories')}
        onOpenProgress={() => setTab('workouts')}
      />
    ),
    workouts: (
      <ProgressTab userId={uid} profile={profile} />
    ),
    workout: (
      <WorkoutTab userId={uid} profile={profile} />
    ),
    calories: (
      <CaloriesTab userId={uid} profile={profile} preferences={preferences} lang={lang} />
    ),
    medication: (
      <MedicationTab userId={uid} />
    ),
    profile: (
      <ProfileTab
        user={session.user} profile={profile} updateProfile={updateProfile}
        preferences={preferences} updatePreferences={updatePreferences}
        lang={lang} setLang={setLang}
        onOpenMeds={() => setTab('medication')}
      />
    ),
  }

  return (
    <>
      <style>{globalCss}</style>
      <div style={{ minHeight: '100vh', background: T.pageBg, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* ── App header ── */}
          <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                {tab === 'today' ? t('today.title') : TABS.find(tt => tt.id === tab)?.label || 'Auron'}
              </div>
            </div>

            {/* Avatar / streak chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.heroGrad1}, ${T.heroGrad2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: '#fff',
                boxShadow: T.shadow,
              }}>
                {(profile?.full_name || session.user.email || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1, padding: '0 16px 100px', overflowY: 'auto' }}>
            {screens[tab] ?? (
              <div style={{
                margin: '60px auto', textAlign: 'center',
                background: T.surface, borderRadius: 20,
                padding: '40px 24px', boxShadow: T.shadowCard,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>{t('app.comingSoon')}</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>{t('app.sectionBeingBuilt')}</div>
              </div>
            )}
          </div>

          {/* ── Bottom navigation ── */}
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: T.surface,
            borderTop: `1px solid ${T.divider}`,
            display: 'flex', alignItems: 'center',
            paddingBottom: 20, paddingTop: 8,
            zIndex: 50,
            boxShadow: '0 -4px 20px rgba(108,92,231,0.07)',
          }}>
            {TABS.map(t => {
              const Icon   = t.icon
              const active = tab === t.id
              return (
                  <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2,
                    background: 'none', border: 'none', padding: '4px 2px',
                    color: active ? T.purple : T.textMuted,
                    transition: 'color 0.15s',
                  }}
                >
                  <div style={{ transform: 'scale(0.85)' }}><Icon active={active} /></div>
                  <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, color: active ? T.purple : T.textMuted }}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </>
  )
}
