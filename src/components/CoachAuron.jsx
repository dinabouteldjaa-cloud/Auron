import { useState } from 'react'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'

// ─────────────────────────────────────────────────────────────
// Auron character image map
// Drop images in /public/auron/ — missing ones show placeholder.
// ─────────────────────────────────────────────────────────────
export const AURON_IMAGES = {
  introduction: '/auron/introduction.png', // full body — first time user welcome screen
  greeting:     '/auron/greeting.png',     // cropped — daily morning greeting in coach card
  happy:        '/auron/happy.png',
  motivating:   '/auron/motivating.png',
  thinking:     '/auron/thinking.png',
  celebrating:  '/auron/celebrating.png',
  concerned:    '/auron/concerned.png',
  resting:      '/auron/resting.png',
  nutrition:    '/auron/nutrition.png',
  workout:      '/auron/workout.png',
  habit:        '/auron/habit.png',
  mindset:      '/auron/mindset.png',
}

// ─────────────────────────────────────────────────────────────
// Mood → expression mapping
// ─────────────────────────────────────────────────────────────
export function getAuronMood({ isToday, totalCal, calorieGoal, streakDays, workoutCount, hour }) {
  if (!isToday)                           return 'mindset'
  if (totalCal > calorieGoal)            return 'concerned'
  if (streakDays >= 7)                   return 'celebrating'
  if (workoutCount > 0 && totalCal > 0)  return 'happy'
  if (workoutCount > 0)                  return 'workout'
  if (streakDays >= 3)                   return 'habit'
  if (streakDays >= 1)                   return 'motivating'
  if (totalCal === 0 && hour < 10)       return 'greeting'
  if (totalCal === 0 && hour >= 10)      return 'concerned'
  if (hour >= 20 && totalCal > 0)        return 'resting'
  if (hour >= 12 && totalCal === 0)      return 'motivating'
  return 'happy'
}

// ─────────────────────────────────────────────────────────────
// AuronCharacter — renders the right expression image
// Falls back to placeholder if the file isn't there yet
// size: 'hero' | 'compact' | 'welcome'
// ─────────────────────────────────────────────────────────────
export function AuronCharacter({ mood = 'happy', size = 'hero' }) {
  const [loaded, setLoaded] = useState(false)
  const [error,  setError]  = useState(false)

  const src = AURON_IMAGES[mood] || AURON_IMAGES.greeting

  const dim = size === 'welcome'
    ? { width: 240, height: 300 }
    : size === 'hero'
    ? { width: 110, height: 140 }
    : { width: 68, height: 80 }

  return (
    <div style={{ position: 'relative', ...dim, flexShrink: 0 }}>
      {!error && (
        <img
          key={src}
          src={src}
          alt={`Auron — ${mood}`}
          onLoad={() => { setLoaded(true); setError(false) }}
          onError={() => { setError(true); setLoaded(false) }}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'bottom',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            position: 'absolute', inset: 0,
          }}
        />
      )}
      {(!loaded || error) && (
        <div style={{
          width: '100%', height: '100%',
          borderRadius: size === 'compact' ? 10 : 16,
          background: `linear-gradient(160deg, ${T.heroGrad1}, ${T.heroGrad2})`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{
            width: size === 'welcome' ? 48 : size === 'hero' ? 32 : 20,
            height: size === 'welcome' ? 48 : size === 'hero' ? 32 : 20,
            borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.12)',
          }} />
          {size !== 'compact' && (
            <div style={{ fontSize: size === 'welcome' ? 13 : 9, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textAlign: 'center' }}>
              Auron
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AuronWelcomeScreen — full-screen intro, shown once per user
// ─────────────────────────────────────────────────────────────
export function AuronWelcomeScreen({ onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: `linear-gradient(170deg, ${T.heroGrad1} 0%, ${T.heroGrad2} 50%, #9B8AF8 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
        <AuronCharacter mood="introduction" size="welcome" />
      </div>

      <div style={{
        background: '#fff', borderRadius: 20, padding: '16px 22px',
        marginBottom: 28, maxWidth: 280, textAlign: 'center',
        position: 'relative', zIndex: 1,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '10px solid #fff' }} />
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>Hi! I'm</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.purple, marginBottom: 4 }}>Auron 👋</div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55 }}>
          Your AI health companion. Here to support your fitness, nutrition and wellness — every step of the way.
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        {['Supportive', 'Motivating', 'Smart', 'Reliable'].map(trait => (
          <div key={trait} style={{
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            fontSize: 13, color: '#fff', fontWeight: 500,
          }}>
            {trait}
          </div>
        ))}
      </div>

      <button
        onClick={onDismiss}
        style={{
          padding: '15px 48px', borderRadius: 30,
          background: '#fff', color: T.purple,
          border: 'none', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', position: 'relative', zIndex: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        Let's get started →
      </button>

      <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
        Let's build a healthier, stronger, happier you. Together. 💜
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CoachHero — main coach card shown on Today tab
// ─────────────────────────────────────────────────────────────
export function CoachHero({ mood = 'neutral', message = '', actionLabel = '', onAction = null }) {
  const { t } = useTranslation()
  return (
    <div style={{
      background: T.purpleLight,
      border: `1px solid ${T.borderStrong}`,
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Header — just the name, no See all */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px 0' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✦</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t('coach.name')}</span>
      </div>

      {/* Body — character fills entire left, message right */}
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 120 }}>

        {/* Character — anchored to bottom */}
        <div style={{ width: 120, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 8 }}>
          <AuronCharacter mood={mood} size="hero" />
        </div>

        {/* Message */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px 16px 14px 8px' }}>
          {message && (
            <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.6, fontWeight: 500 }}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        borderTop: `1px solid ${T.borderStrong}`,
        margin: '0 18px',
        padding: '11px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      }}>
        <span style={{ fontSize: 13 }}>✨</span>
        <span style={{ fontSize: 13, color: T.purple, fontWeight: 600 }}>{t('coach.openAI')}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CoachInsightCard — compact card for the 2-col row
// ─────────────────────────────────────────────────────────────
export function CoachInsightCard({ message, mood = 'happy' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: `1px solid ${T.divider}`,
      boxShadow: T.shadowCard,
      padding: '14px 14px',
      display: 'flex', flexDirection: 'column',
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.purple }}>{t('coach.name') + ' Insight'}</span>
        <span style={{ fontSize: 11, color: T.purple }}>›</span>
      </div>
      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6, flex: 1 }}>
        {message || 'Log your first meal to get a personalised insight.'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <AuronCharacter mood={mood} size="compact" />
      </div>
    </div>
  )
}
