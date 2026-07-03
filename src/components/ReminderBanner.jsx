import { useEffect, useState } from 'react'

const T = {
  surface:      '#FFFFFF',
  purple:       '#6C5CE7',
  purpleLight:  'rgba(108,92,231,0.12)',
  purpleDark:   '#4B3FC7',
  green:        '#2ECC71',
  greenLight:   'rgba(46,204,113,0.12)',
  amber:        '#F5A623',
  amberLight:   'rgba(245,166,35,0.15)',
  text:         '#1A1A2E',
  textMuted:    '#7A7A9A',
  shadow:       '0 8px 32px rgba(108,92,231,0.22)',
}

// ─────────────────────────────────────────────────────────────
// Single alert banner — slides in from top
// ─────────────────────────────────────────────────────────────
function AlertBanner({ alert, snoozeMinutes, onDismiss, onSnooze, onMarkTaken }) {
  const [visible, setVisible] = useState(false)

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(alert.id), 320)
  }
  const handleSnooze = () => {
    setVisible(false)
    setTimeout(() => onSnooze(alert.id), 320)
  }
  const handleTaken = () => {
    setVisible(false)
    setTimeout(() => onMarkTaken(alert.id, alert.medicationId, alert.scheduledTime), 320)
  }

  return (
    <div style={{
      transform: visible ? 'translateY(0)' : 'translateY(-110%)',
      transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
      background: T.surface,
      borderRadius: 18,
      boxShadow: T.shadow,
      padding: '14px 16px',
      marginBottom: 10,
      border: `1px solid ${T.purple}33`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Purple accent line at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.purpleDark}, ${T.purple})`, borderRadius: '18px 18px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
            💊
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Medication Reminder · {alert.time}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 1 }}>
              {alert.name}
            </div>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>
          ×
        </button>
      </div>

      {alert.dosage && (
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 12, paddingLeft: 40 }}>
          {alert.dosage}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleTaken}
          style={{
            flex: 1, padding: '9px', borderRadius: 12,
            background: T.purple, color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          ✓ Mark as taken
        </button>
        <button
          onClick={handleSnooze}
          style={{
            padding: '9px 14px', borderRadius: 12,
            background: T.amberLight, color: T.amber,
            border: `1px solid ${T.amber}44`, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Snooze {snoozeMinutes}m
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ReminderBanner — renders all active alerts stacked at the top
// Place this at the top of App.jsx, outside the tab content
// ─────────────────────────────────────────────────────────────
export function ReminderBanner({ alerts, snoozeMinutes, onDismiss, onSnooze, onMarkTaken }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      padding: '12px 16px 0',
      zIndex: 999,
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'all' }}>
        {alerts.map(alert => (
          <AlertBanner
            key={alert.id}
            alert={alert}
            snoozeMinutes={snoozeMinutes}
            onDismiss={onDismiss}
            onSnooze={onSnooze}
            onMarkTaken={onMarkTaken}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ReminderSettings — UI for managing reminder preferences
// Embed anywhere (Settings tab, Medication tab, etc.)
// ─────────────────────────────────────────────────────────────
export function ReminderSettings({ prefs, onUpdate }) {
  const T2 = {
    surface:    '#FFFFFF',
    surfaceMid: '#ECEAF8',
    purple:     '#6C5CE7',
    purpleLight:'rgba(108,92,231,0.12)',
    text:       '#1A1A2E',
    textMuted:  '#7A7A9A',
    border:     'rgba(108,92,231,0.12)',
    divider:    '#EBEBF5',
    green:      '#2ECC71',
    greenLight: 'rgba(46,204,113,0.12)',
    shadowCard: '0 1px 8px rgba(26,26,46,0.06)',
  }

  return (
    <div style={{ background: T2.surface, borderRadius: 16, border: `1px solid ${T2.divider}`, boxShadow: T2.shadowCard, padding: '16px 18px' }}>

      {/* Enable/disable toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${T2.divider}`, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T2.text }}>In-app reminders</div>
          <div style={{ fontSize: 12, color: T2.textMuted, marginTop: 2 }}>Get alerted when it's time to take a medication</div>
        </div>
        <button
          onClick={() => onUpdate({ reminders_enabled: !prefs.reminders_enabled })}
          style={{
            width: 48, height: 28, borderRadius: 14,
            background: prefs.reminders_enabled ? T2.purple : T2.surfaceMid,
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 3,
            left: prefs.reminders_enabled ? 23 : 3,
            width: 22, height: 22, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }} />
        </button>
      </div>

      {prefs.reminders_enabled && (
        <>
          {/* Snooze duration */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T2.text, marginBottom: 8 }}>Snooze duration</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 30].map(mins => (
                <button key={mins} onClick={() => onUpdate({ snooze_minutes: mins })} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${prefs.snooze_minutes === mins ? T2.purple : T2.border}`,
                  background: prefs.snooze_minutes === mins ? T2.purpleLight : 'transparent',
                  color: prefs.snooze_minutes === mins ? T2.purple : T2.textMuted,
                  fontWeight: prefs.snooze_minutes === mins ? 600 : 400,
                }}>
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Advance notice */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T2.text, marginBottom: 8 }}>Remind me</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[[0, 'On time'], [5, '5 min early'], [10, '10 min early'], [15, '15 min early']].map(([mins, label]) => (
                <button key={mins} onClick={() => onUpdate({ advance_minutes: mins })} style={{
                  padding: '7px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${prefs.advance_minutes === mins ? T2.purple : T2.border}`,
                  background: prefs.advance_minutes === mins ? T2.purpleLight : 'transparent',
                  color: prefs.advance_minutes === mins ? T2.purple : T2.textMuted,
                  fontWeight: prefs.advance_minutes === mins ? 600 : 400,
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Push notification note */}
          <div style={{ marginTop: 14, padding: '10px 12px', background: T2.surfaceMid, borderRadius: 10, fontSize: 11, color: T2.textMuted, lineHeight: 1.6 }}>
            📱 Push notifications (iOS & Android) are coming in a future update. In-app alerts are active now.
          </div>
        </>
      )}
    </div>
  )
}
