import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  gold: '#C9A84C', dark: '#0F0F0F', surface: '#1A1A1A',
  surfaceLight: '#242424', border: 'rgba(201,168,76,0.2)',
  text: '#F0EDE6', textMuted: '#888880', red: '#E05252',
}

export default function Auth() {
  const [mode, setMode] = useState('login') // login | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) setError(error.message)
      else setMessage('Password reset email sent!')
    }
    setLoading(false)
  }

  const inp = (val, set, placeholder, type = 'text') => (
    <input
      type={type} value={val} onChange={e => set(e.target.value)}
      placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none', marginBottom: 12 }}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, color: C.gold, letterSpacing: '-0.02em', marginBottom: 8 }}>Auron</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Your premium fitness companion</div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 18, fontFamily: 'Georgia, serif', color: C.text, marginBottom: 20 }}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </div>

          {mode === 'signup' && inp(name, setName, 'Full name')}
          {inp(email, setEmail, 'Email address', 'email')}
          {mode !== 'reset' && inp(password, setPassword, 'Password', 'password')}

          {error && <div style={{ fontSize: 13, color: C.red, marginBottom: 12, padding: '8px 12px', background: 'rgba(224,82,82,0.1)', borderRadius: 8 }}>{error}</div>}
          {message && <div style={{ fontSize: 13, color: '#4CAF72', marginBottom: 12, padding: '8px 12px', background: 'rgba(76,175,114,0.1)', borderRadius: 8 }}>{message}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {mode === 'login' && <>
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, cursor: 'pointer' }}>Don't have an account? Sign up</button>
              <button onClick={() => setMode('reset')} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>Forgot password?</button>
            </>}
            {mode !== 'login' && <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, cursor: 'pointer' }}>Back to sign in</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
