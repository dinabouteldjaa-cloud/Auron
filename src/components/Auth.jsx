import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  gold:         '#C9A84C',
  goldLight:    'rgba(201,168,76,0.12)',
  dark:         '#0D0E12',
  surface:      '#16181F',
  surfaceLight: '#1E2029',
  border:       'rgba(201,168,76,0.16)',
  borderStrong: 'rgba(201,168,76,0.36)',
  text:         '#F0EDE6',
  textMuted:    '#8A8A90',
  textDim:      '#52525A',
  red:          '#E05252',
  green:        '#4CAF72',
  greenLight:   'rgba(76,175,114,0.14)',
}

function TextInput({ type = 'text', value, onChange, placeholder, onKeyDown }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', padding: '13px 16px', borderRadius: 13,
        background: C.surfaceLight,
        border: `1px solid ${focused ? C.gold : C.border}`,
        color: C.text, fontSize: 15, outline: 'none',
        marginBottom: 12, transition: 'border-color 0.15s',
      }}
    />
  )
}

export default function Auth() {
  const [mode,     setMode]     = useState('login') // login | signup | reset
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [message,  setMessage]  = useState('')

  const clear = () => { setError(''); setMessage('') }

  const handleSubmit = async () => {
    clear()
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (mode !== 'reset' && !password.trim()) { setError('Please enter your password.'); return }
    if (mode === 'signup' && password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name.trim() } },
      })
      if (error) setError(error.message)
      else setMessage('Account created! Check your email to confirm, then sign in.')
    }

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) setError(error.message)
      else setMessage('Password reset link sent — check your inbox.')
    }

    setLoading(false)
  }

  const onKey = e => { if (e.key === 'Enter') handleSubmit() }

  const switchMode = (m) => { clear(); setMode(m); setEmail(''); setPassword(''); setName('') }

  const modeTitle = { login: 'Welcome back', signup: 'Create account', reset: 'Reset password' }
  const modeCTA   = { login: 'Sign in', signup: 'Create account', reset: 'Send reset link' }

  return (
    <div style={{
      minHeight: '100vh', background: C.dark,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 44,
            color: C.gold, letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Auron
          </div>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            Your premium fitness companion
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: C.surface, borderRadius: 22,
          border: `1px solid ${C.border}`, padding: '28px 26px',
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, color: C.text, marginBottom: 22,
          }}>
            {modeTitle[mode]}
          </div>

          {/* Fields */}
          {mode === 'signup' && (
            <TextInput
              value={name}
              onChange={setName}
              placeholder="Full name"
              onKeyDown={onKey}
            />
          )}
          <TextInput
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Email address"
            onKeyDown={onKey}
          />
          {mode !== 'reset' && (
            <TextInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              onKeyDown={onKey}
            />
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 13, color: C.red, marginBottom: 14,
              padding: '10px 13px', borderRadius: 10,
              background: `${C.red}14`, border: `1px solid ${C.red}33`,
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div style={{
              fontSize: 13, color: C.green, marginBottom: 14,
              padding: '10px 13px', borderRadius: 10,
              background: C.greenLight, border: `1px solid ${C.green}44`,
              lineHeight: 1.5,
            }}>
              {message}
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 24,
              background: loading ? C.surfaceLight : C.gold,
              color: loading ? C.textMuted : C.dark,
              border: 'none', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, marginBottom: 20,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Please wait...' : modeCTA[mode]}
          </button>

          {/* Mode switchers */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {mode === 'login' && (
              <>
                <button onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, cursor: 'pointer' }}>
                  Don't have an account? Sign up
                </button>
                <button onClick={() => switchMode('reset')} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>
                  Forgot your password?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, cursor: 'pointer' }}>
                Already have an account? Sign in
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, cursor: 'pointer' }}>
                Back to sign in
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
