import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useProfile } from './hooks/useProfile'
import { usePreferences } from './hooks/usePreferences'
import TodayTab from './components/TodayTab'
import ProfileTab from './components/ProfileTab'

const C = {
  gold: '#C9A84C', dark: '#0D0E12', surface: '#16181F',
  surfaceLight: '#1E2029', border: 'rgba(201,168,76,0.16)',
  text: '#F0EDE6', textMuted: '#8A8A90',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0D0E12; color: #F0EDE6; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }
  input, button, select, textarea { font-family: inherit; }
  button { cursor: pointer; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`

const TABS = [
  { id: 'today',    label: 'Today',    icon: '🏠' },
  { id: 'calories', label: 'Calories', icon: '🔥' },
  { id: 'workouts', label: 'Workouts', icon: '💪' },
  { id: 'plans',    label: 'Plans',    icon: '📅' },
  { id: 'insights', label: 'Insights', icon: '📊' },
  { id: 'profile',  label: 'Profile',  icon: '👤' },
]

export default function App() {
  const [tab,     setTab]     = useState('today')
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const uid = session?.user?.id
  const { profile,     updateProfile     } = useProfile(uid)
  const { preferences, updatePreferences } = usePreferences(uid)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const notLoggedIn = (
    <div style={{ padding: 40, color: C.textMuted, textAlign: 'center' }}>
      Please log in to continue
    </div>
  )

  const screens = {
    today: uid
      ? <TodayTab userId={uid} profile={profile} updateProfile={updateProfile} />
      : notLoggedIn,
    profile: uid
      ? <ProfileTab
          user={session.user}
          profile={profile}
          updateProfile={updateProfile}
          preferences={preferences}
          updatePreferences={updatePreferences}
        />
      : notLoggedIn,
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Header */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, letterSpacing: '0.06em' }}>
              {today.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: C.gold }}>
              Auron
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '20px 20px 100px', overflowY: 'auto' }}>
            {screens[tab] || (
              <div style={{ padding: 40, color: C.textMuted, textAlign: 'center' }}>
                Coming soon
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: C.surface, borderTop: `1px solid ${C.border}`,
            display: 'flex', padding: '8px 0 20px', zIndex: 50,
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3,
                  background: 'none', border: 'none', padding: '6px 0',
                  color: tab === t.id ? C.gold : C.textMuted,
                }}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: tab === t.id ? 500 : 400 }}>{t.label}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
