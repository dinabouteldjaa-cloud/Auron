import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
// Design tokens — single source of truth for TodayTab
// ─────────────────────────────────────────────────────────────
const C = {
  gold:         '#C9A84C',
  goldLight:    'rgba(201,168,76,0.12)',
  goldMid:      'rgba(201,168,76,0.28)',
  goldDark:     '#8B6914',
  dark:         '#0D0E12',
  surface:      '#16181F',
  surfaceLight: '#1E2029',
  surfaceMid:   '#1A1C24',
  border:       'rgba(201,168,76,0.16)',
  borderStrong: 'rgba(201,168,76,0.36)',
  text:         '#F0EDE6',
  textMuted:    '#8A8A90',
  textDim:      '#52525A',
  green:        '#4CAF72',
  greenLight:   'rgba(76,175,114,0.14)',
  red:          '#E05252',
  blue:         '#5B9BD5',
  blueLight:    'rgba(91,155,213,0.13)',
  amber:        '#D4924A',
  purple:       '#9B72D0',
  purpleLight:  'rgba(155,114,208,0.13)',
}

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', time: '6–10am'   },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️',  time: '11am–2pm' },
  { id: 'snack',     label: 'Snack',     icon: '🍎',  time: '2–5pm'   },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙',  time: '5–9pm'   },
]

// ─────────────────────────────────────────────────────────────
// Primitive shared components
// ─────────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface, borderRadius: 18,
        border: `1px solid ${C.border}`, padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'border-color 0.15s' : undefined,
        ...style,
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = C.borderStrong)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = C.border)}
    >
      {children}
    </div>
  )
}

function Label({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: C.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 12, ...style,
    }}>
      {children}
    </div>
  )
}

function Pill({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 10px', borderRadius: 20,
      background: bg, color, fontWeight: 500, display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// CoachHero
//
// Reusable, animation-ready coach section.
// Props:
//   mood          – 'neutral'|'hyped'|'proud'|'concerned'|'celebrate'
//   message       – string  (max 2 sentences)
//   actionLabel   – string  (optional CTA)
//   onAction      – fn      (optional CTA handler)
//   showAnimation – bool    (false = placeholder, true = live asset)
//   greeting      – string  (small eyebrow label)
//
// Upgrade path (single change point):
//   When the Auron character is ready, set showAnimation={true}
//   and place the asset inside <div data-coach-animation>.
//   PNG:   <img src="/auron.webp" style={{width:'100%',height:'100%',objectFit:'contain'}} />
//   Rive:  <RiveComponent src="/auron.riv" stateMachines={["Auron"]} />
//   Nothing outside that div needs to change.
// ─────────────────────────────────────────────────────────────
export function CoachHero({
  mood          = 'neutral',
  message       = '',
  actionLabel   = '',
  onAction      = null,
  showAnimation = false,
  greeting      = '',
}) {
  const moodAccent = {
    neutral:   C.gold,
    hyped:     C.amber,
    proud:     C.gold,
    concerned: '#8A8A90',
    celebrate: C.amber,
  }[mood] || C.gold

  return (
    <div style={{ marginBottom: 24 }}>

      {/* ── Animation container ──────────────────────────────
          THE ONLY LINE YOU CHANGE when the character is ready.
          Replace the inner placeholder div with your asset.
      ─────────────────────────────────────────────────── */}
      <div
        data-coach-animation
        style={{
          height: 170,
          borderRadius: 20,
          marginBottom: 0,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(155deg, #1A1C24 0%, #16181F 60%, #13141A 100%)`,
          border: `1px solid ${C.borderStrong}`,
        }}
      >
        {/* Mood-driven gold glow — top left */}
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${moodAccent}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        {/* Static blue accent — bottom right */}
        <div style={{
          position: 'absolute', bottom: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.blue}0C 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        {/* Subtle top border highlight */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${C.gold}30, transparent)`,
          pointerEvents: 'none',
        }} />

        {showAnimation ? (
          /* Live character mounts here */
          <div style={{ width: '100%', height: '100%' }} />
        ) : (
          /* Placeholder — remove this block entirely when character is ready */
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8,
          }}>
            {/* Minimal geometric mark — not a mascot */}
            <div style={{
              width: 40, height: 40,
              border: `1px solid ${C.gold}40`,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${C.gold}0E 0%, transparent 100%)`,
            }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: '0.06em' }}>
              Auron Coach
            </div>
            <div style={{ fontSize: 11, color: C.textDim, letterSpacing: '0.04em' }}>
              Animated coach coming soon
            </div>
          </div>
        )}
      </div>

      {/* ── Text row sits below the visual ── */}
      <div style={{
        background: C.surface,
        borderRadius: '0 0 20px 20px',
        border: `1px solid ${C.borderStrong}`,
        borderTop: 'none',
        padding: '14px 18px 16px',
      }}>
        {greeting && (
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.gold,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 6,
          }}>
            {greeting}
          </div>
        )}

        {message && (
          <div style={{
            fontSize: 14, color: C.text, lineHeight: 1.55, fontWeight: 400,
            marginBottom: actionLabel && onAction ? 14 : 0,
          }}>
            {message}
          </div>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              marginTop: 2,
              padding: '8px 20px', borderRadius: 20,
              background: C.gold, color: C.dark,
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>

    </div>
  )
}


// ─────────────────────────────────────────────────────────────
// Calorie Ring — hero data section
// ─────────────────────────────────────────────────────────────
function CalRing({ consumed, goal, proteinG, proteinGoal, carbsG, fatG }) {
  const r     = 72
  const circ  = 2 * Math.PI * r
  const pct   = Math.min(consumed / goal, 1)
  const over  = consumed > goal
  const ring  = over ? C.red : pct > 0.9 ? C.amber : C.gold

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{ position: 'relative', width: 186, height: 186, margin: '0 auto 16px' }}>
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: `radial-gradient(circle, ${ring}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <svg width={186} height={186} viewBox="0 0 186 186">
          <circle cx={93} cy={93} r={r} fill="none" stroke={C.surfaceLight} strokeWidth={13} />
          <circle
            cx={93} cy={93} r={r} fill="none" stroke={ring} strokeWidth={13}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform="rotate(-90 93 93)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.4s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center', width: '100%',
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 600, color: C.text, lineHeight: 1 }}>
            {consumed.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            of {goal.toLocaleString()} kcal
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 5, color: over ? C.red : C.gold }}>
            {over
              ? `${(consumed - goal).toLocaleString()} over`
              : `${(goal - consumed).toLocaleString()} left`}
          </div>
        </div>
      </div>

      {/* Macro mini-bars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        {[
          { label: 'Protein', val: proteinG,  goal: proteinGoal,                      color: C.blue  },
          { label: 'Carbs',   val: carbsG,    goal: Math.round((goal * 0.45) / 4),    color: C.amber },
          { label: 'Fat',     val: fatG,      goal: Math.round((goal * 0.25) / 9),    color: C.gold  },
        ].map(m => {
          const mpct = m.goal > 0 ? Math.min(m.val / m.goal, 1) : 0
          return (
            <div key={m.label} style={{ textAlign: 'center', minWidth: 68 }}>
              <div style={{ height: 3, background: C.surfaceLight, borderRadius: 2, marginBottom: 5, overflow: 'hidden' }}>
                <div style={{ width: `${mpct * 100}%`, height: '100%', background: m.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{Math.round(m.val)}g</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{m.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Today's Focus — derived from calories + workout + water state
// ─────────────────────────────────────────────────────────────
function TodaysFocus({ consumed, goal, workoutCount, waterPct, streakDays }) {
  const items = []
  const calLeft = goal - consumed

  if (consumed === 0)         items.push({ icon: '🍽️', text: 'Log your first meal to start tracking today', color: C.textMuted })
  else if (calLeft > 0)       items.push({ icon: '🔥', text: `${calLeft.toLocaleString()} kcal remaining — stay on target`, color: C.gold })
  else                        items.push({ icon: '⚠️', text: `${(consumed - goal).toLocaleString()} kcal over goal`, color: C.red })

  if (workoutCount === 0)     items.push({ icon: '💪', text: 'No workout logged — head to Workouts tab', color: C.textMuted })
  else                        items.push({ icon: '✅', text: `${workoutCount} workout${workoutCount > 1 ? 's' : ''} logged today`, color: C.green })

  if (waterPct < 50)          items.push({ icon: '💧', text: 'Water intake is low — drink up', color: C.blue })
  else if (waterPct < 100)    items.push({ icon: '💧', text: `${Math.round(waterPct)}% of water goal done`, color: C.blue })

  if (streakDays > 0)         items.push({ icon: '🔥', text: `${streakDays}-day streak — keep it going`, color: C.amber })

  return (
    <Card style={{ marginBottom: 20 }}>
      <Label>Today's focus</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: item.color, lineHeight: 1.4 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Daily Stats — manual entry, HealthKit-ready architecture
// source prop: 'manual' | 'healthkit'
// When HealthKit ships: pass source='healthkit' + value from API
// ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, onChange, unit, color, placeholder, isToday, source = 'manual' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      background: C.surfaceLight, borderRadius: 14,
      padding: '13px 14px',
      border: `1px solid ${focused ? color + '44' : C.border}`,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{icon}</span> {label}
        {source === 'healthkit' && (
          <span style={{ marginLeft: 'auto', fontSize: 9, color: C.green, fontWeight: 700 }}>AUTO</span>
        )}
      </div>
      {isToday && source === 'manual' ? (
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            outline: 'none', color: value ? color : C.textDim,
            fontSize: 20, fontWeight: 600, padding: 0, fontFamily: 'inherit',
          }}
        />
      ) : (
        <div style={{ fontSize: 20, fontWeight: 600, color: value ? color : C.border }}>
          {value || (isToday ? placeholder : '—')}
        </div>
      )}
      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{unit}</div>
      {isToday && !value && source === 'manual' && (
        <div style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>tap to log</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Meals section
// ─────────────────────────────────────────────────────────────
function MealsSection({ foodLogs, isToday }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ marginBottom: 20 }}>
      <Label>Meals</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MEAL_SLOTS.map(slot => {
          const items    = foodLogs.filter(f => f.meal_slot === slot.id)
          const slotCal  = items.reduce((s, f) => s + (f.calories || 0), 0)
          const slotP    = items.reduce((s, f) => s + (f.protein  || 0), 0)
          const hasItems = items.length > 0
          const isExp    = expanded === slot.id

          return (
            <div
              key={slot.id}
              style={{
                background: C.surface,
                border: `1px solid ${hasItems ? C.borderStrong : C.border}`,
                borderRadius: 14, overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                onClick={() => hasItems && setExpanded(isExp ? null : slot.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', cursor: hasItems ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: hasItems ? C.goldLight : C.surfaceLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, transition: 'background 0.2s',
                }}>
                  {slot.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{slot.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
                    {hasItems
                      ? `${items.length} item${items.length > 1 ? 's' : ''} · ${Math.round(slotP)}g protein`
                      : <span style={{ color: C.textDim }}>Nothing logged</span>}
                  </div>
                </div>
                {hasItems && (
                  <>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>{slotCal}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>kcal</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginLeft: 4 }}>{isExp ? '▴' : '▾'}</div>
                  </>
                )}
              </div>

              {isExp && items.map((f, i) => (
                <div
                  key={i}
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    padding: '8px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: C.text }}>{f.food_name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>P {f.protein}g · C {f.carbs}g · F {f.fat}g</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{f.calories} kcal</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {foodLogs.length === 0 && isToday && (
        <div style={{ marginTop: 10, padding: 16, background: C.surfaceLight, borderRadius: 12, textAlign: 'center', border: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: 13, color: C.textMuted }}>Log your first meal in the Calories tab</div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Workout section
// ─────────────────────────────────────────────────────────────
function WorkoutSection({ workoutLogs, savedPlans, selectedDate, isToday }) {
  const dayName  = DAYS[new Date(selectedDate + 'T00:00:00').getDay()]
  const dayIndex = DAYS.indexOf(dayName)

  // Parse structured planned workout from schedule JSONB
  const plannedEntries = savedPlans.flatMap(plan => {
    if (!plan.chosen_days || !plan.schedule) return []
    const chosen = plan.chosen_days || []
    if (!chosen.includes(dayIndex)) return []
    const entry = plan.schedule[String(dayIndex)]
    if (!entry) return []
    return [{ planTitle: plan.title, ...entry }]
  })

  // Fallback: text-based match if old plan format
  const textEntries = savedPlans.flatMap(plan => {
    if (plan.chosen_days?.length) return []   // already handled above
    if (!plan.content) return []
    const lines = plan.content.split('\n').map(l => l.trim()).filter(Boolean)
    const match = lines.find(l =>
      l.toLowerCase().includes(dayName.toLowerCase()) ||
      new RegExp(`day\\s*${dayIndex + 1}\\b`, 'i').test(l)
    )
    return match ? [{ planTitle: plan.title, name: match, exercises: [] }] : []
  })

  const allPlanned = [...plannedEntries, ...textEntries]
  const totalCalBurned = workoutLogs.reduce((s, w) => s + (w.calories_burned  || 0), 0)
  const totalMinutes   = workoutLogs.reduce((s, w) => s + (w.duration_minutes || 0), 0)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Label style={{ marginBottom: 0 }}>Workout</Label>
        {workoutLogs.length > 0 && (
          <div style={{ fontSize: 11, color: C.textMuted }}>
            {totalMinutes}min · {totalCalBurned} kcal
          </div>
        )}
      </div>

      {allPlanned.map((p, i) => {
        const isRest = (p.name || '').toLowerCase().includes('rest')
        return (
          <div
            key={i}
            style={{
              borderRadius: 16, marginBottom: 10, overflow: 'hidden',
              border: `1px solid ${isRest ? C.border : C.purple + '55'}`,
              background: isRest ? C.surfaceLight : `linear-gradient(135deg, ${C.purple}18 0%, ${C.surface} 100%)`,
            }}
          >
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: isRest ? C.surfaceLight : C.purple + '28',
                border: `1px solid ${isRest ? C.border : C.purple + '44'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {isRest ? '🛌' : '💪'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: C.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                  Planned · {p.planTitle}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p.name || dayName}</div>
                {p.exercises?.length > 0 && (
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{p.exercises.length} exercises</div>
                )}
              </div>
              {!isRest && p.exercises?.length > 0 && (
                <Pill color={C.purple} bg={C.purple + '22'}>{p.exercises.length} ex</Pill>
              )}
            </div>
            {p.exercises?.length > 0 && !isRest && (
              <div style={{ borderTop: `1px solid ${C.purple}22`, padding: '10px 16px 14px' }}>
                {p.exercises.map((ex, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: j < p.exercises.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: C.purple + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.purple }}>{j + 1}</div>
                    <div style={{ fontSize: 13, color: C.text, flex: 1 }}>{typeof ex === 'string' ? ex : ex.name}</div>
                    {ex.sets && <div style={{ fontSize: 11, color: C.textMuted }}>{ex.sets}×{ex.reps || ex.duration}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {workoutLogs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {workoutLogs.map(w => (
            <div
              key={w.id}
              style={{
                background: C.surface, border: `1px solid ${C.green}33`,
                borderRadius: 14, padding: '13px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{w.workout_name}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                  {[w.duration_minutes && `${w.duration_minutes}min`, w.calories_burned && `${w.calories_burned} kcal`, w.workout_type].filter(Boolean).join(' · ')}
                </div>
              </div>
              <Pill color={C.green} bg={C.greenLight}>Done ✓</Pill>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: C.surfaceLight, borderRadius: 14, padding: '22px 16px', textAlign: 'center', border: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏃</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.textMuted, marginBottom: 4 }}>
            {isToday ? 'No workout logged today' : 'No workouts this day'}
          </div>
          {isToday && <div style={{ fontSize: 12, color: C.textDim }}>Go to the Workouts tab to log one</div>}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Water tracker
// ─────────────────────────────────────────────────────────────
function WaterSettingsModal({ profile, onSave, onClose }) {
  const [unit,    setUnit]    = useState(profile?.water_unit || 'cups')
  const [goal,    setGoal]    = useState(
    profile?.water_unit === 'ml'
      ? String(profile?.water_goal_ml || 2000)
      : String(profile?.water_goal    || 8)
  )
  const [cupSize, setCupSize] = useState(String(profile?.cup_size_ml || 250))

  const save = () => {
    const updates = { water_unit: unit }
    if (unit === 'cups') {
      updates.water_goal    = parseInt(goal)    || 8
      updates.cup_size_ml   = parseInt(cupSize) || 250
    } else {
      updates.water_goal_ml = parseInt(goal)    || 2000
    }
    onSave(updates)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 22, padding: 24, width: '100%', maxWidth: 380, border: `1px solid ${C.borderStrong}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Water settings</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Track by</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['cups','☕ Cups'], ['ml','💧 Millilitres']].map(([val, label]) => (
              <button key={val} onClick={() => setUnit(val)} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1px solid ${unit === val ? C.gold : C.border}`, background: unit === val ? C.goldLight : 'transparent', color: unit === val ? C.gold : C.textMuted, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
            ))}
          </div>
        </div>

        {unit === 'cups' ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal (cups)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['4','6','8','10','12'].map(n => (
                  <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${goal === n ? C.gold : C.border}`, background: goal === n ? C.goldLight : 'transparent', color: goal === n ? C.gold : C.textMuted, fontSize: 13, cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Cup size</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['150','150ml'],['200','200ml'],['250','250ml'],['350','350ml'],['500','500ml']].map(([n, l]) => (
                  <button key={n} onClick={() => setCupSize(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${cupSize === n ? C.gold : C.border}`, background: cupSize === n ? C.goldLight : 'transparent', color: cupSize === n ? C.gold : C.textMuted, fontSize: 10, cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>
                Total: <strong style={{ color: C.gold }}>{parseInt(goal || 8) * parseInt(cupSize || 250)} ml</strong> / day
              </div>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['1500','2000','2500','3000','3500'].map(n => (
                <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${goal === n ? C.gold : C.border}`, background: goal === n ? C.goldLight : 'transparent', color: goal === n ? C.gold : C.textMuted, fontSize: 11, cursor: 'pointer', minWidth: 52 }}>{n}ml</button>
              ))}
            </div>
            <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="2000"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: 'none' }} />
          </div>
        )}

        <button onClick={save} style={{ width: '100%', padding: 13, borderRadius: 24, background: C.gold, color: C.dark, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  )
}

function WaterTracker({ userId, profile, updateProfile, selectedDate }) {
  const [amount,       setAmount]       = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [loading,      setLoading]      = useState(true)

  const isToday  = selectedDate === new Date().toISOString().split('T')[0]
  const unit     = profile?.water_unit    || 'cups'
  const goal     = unit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)
  const cupSize  = profile?.cup_size_ml  || 250
  const pct      = Math.min((amount / goal) * 100, 100)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('water_logs')
      .select('cups, amount_ml')
      .eq('user_id', userId)
      .eq('log_date', selectedDate)
      .single()
      .then(({ data }) => {
        if (data) setAmount(unit === 'ml' ? (data.amount_ml || data.cups * cupSize) : (data.cups || 0))
        else setAmount(0)
      })
      .catch(() => setAmount(0))
      .finally(() => setLoading(false))
  }, [userId, selectedDate, unit, cupSize])

  const save = async (newAmount) => {
    const clamped  = Math.max(0, newAmount)
    setAmount(clamped)
    const cups      = unit === 'cups' ? clamped : Math.round(clamped / cupSize)
    const amount_ml = unit === 'ml'   ? clamped : clamped * cupSize
    await supabase.from('water_logs').upsert({
      user_id: userId, log_date: selectedDate,
      cups, amount_ml, updated_at: new Date().toISOString(),
    })
  }

  const displayLabel = unit === 'ml'
    ? `${amount} / ${goal} ml`
    : `${amount} / ${goal} cups`
  const mlTotal = unit === 'ml' ? amount : amount * cupSize

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>💧 Water</div>
          <div style={{ fontSize: 12, color: C.blue }}>
            {loading ? '...' : displayLabel}
            {unit === 'cups' && amount > 0 ? ` · ${mlTotal}ml` : ''}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '5px 10px', color: C.textMuted, fontSize: 11, cursor: 'pointer' }}
        >
          ⚙ Settings
        </button>
      </div>

      <div style={{ height: 7, background: C.surfaceLight, borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? C.green : C.blue, borderRadius: 4, transition: 'width 0.4s ease, background 0.3s' }} />
      </div>

      {unit === 'cups' ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(goal, 12) }, (_, i) => (
            <div
              key={i}
              onClick={() => isToday && save(i < amount ? i : i + 1)}
              style={{
                width: 38, height: 38, borderRadius: 11, cursor: isToday ? 'pointer' : 'default',
                background: i < amount ? C.blueLight : C.surfaceLight,
                border: `1px solid ${i < amount ? C.blue : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, transition: 'all 0.15s',
                transform: i < amount ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              💧
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[250, 330, 500, 750, 1000].map(ml => (
              <button
                key={ml}
                onClick={() => isToday && save(amount + ml)}
                disabled={!isToday}
                style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceLight, color: isToday ? C.text : C.textMuted, fontSize: 12, cursor: isToday ? 'pointer' : 'default', minWidth: 50 }}
              >
                +{ml}ml
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => isToday && save(amount - 250)} disabled={!isToday || amount === 0} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: C.blue }}>{amount}ml</div>
            <button onClick={() => isToday && save(amount + 250)} disabled={!isToday} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>
      )}

      {!isToday && <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, textAlign: 'center' }}>View only — switch to today to log water</div>}
      {pct >= 100 && isToday && <div style={{ fontSize: 12, color: C.green, marginTop: 10, textAlign: 'center', fontWeight: 500 }}>🎉 Daily water goal reached!</div>}

      {showSettings && (
        <WaterSettingsModal
          profile={profile}
          onSave={updateProfile}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Weekly Progress (replaces old streak section)
// ─────────────────────────────────────────────────────────────
function WeeklyProgress({ weekDays, selectedDate, todayStr, setSelectedDate, loggedDates, streakDays, weekOffset, setWeekOffset }) {
  const today = new Date()

  return (
    <Card>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <Label style={{ marginBottom: 2 }}>Weekly progress</Label>
          {streakDays > 0 && (
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>
              🔥 {streakDays}-day streak
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, width: 28, height: 28, color: C.textMuted, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ fontSize: 11, color: C.textMuted, minWidth: 56, textAlign: 'center' }}>
            {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `${Math.abs(weekOffset)}w ago`}
          </span>
          <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))} style={{ background: 'none', border: `1px solid ${weekOffset === 0 ? C.border : C.border}`, borderRadius: 8, width: 28, height: 28, color: weekOffset === 0 ? C.border : C.textMuted, fontSize: 15, cursor: weekOffset === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      </div>

      {/* Day strip */}
      <div style={{ display: 'flex', gap: 5 }}>
        {weekDays.map((d, i) => {
          const ds          = d.toISOString().split('T')[0]
          const isSel       = ds === selectedDate
          const isFuture    = d > today
          const isCurrentDay = ds === todayStr
          const isLogged    = loggedDates.has(ds)

          let bg = 'transparent', border = C.border, numColor = isFuture ? C.border : C.textMuted
          if (isSel)         { bg = C.gold;       border = 'transparent';      numColor = C.dark  }
          else if (isLogged) { bg = C.greenLight; border = C.green + '66' }
          else if (isCurrentDay) { bg = C.goldLight; border = C.gold + '66'; numColor = C.gold }

          return (
            <button
              key={i}
              onClick={() => !isFuture && setSelectedDate(ds)}
              disabled={isFuture}
              style={{
                flex: 1, padding: '8px 4px 7px', borderRadius: 13,
                border: `1px solid ${border}`, background: bg,
                cursor: isFuture ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 9.5, fontWeight: 600, color: isSel ? C.dark : C.textMuted, opacity: isSel ? 0.7 : 1 }}>
                {DAYS[d.getDay()].slice(0,1)}
              </div>
              <div style={{ fontSize: 15, fontWeight: isSel ? 700 : 500, color: numColor }}>
                {d.getDate()}
              </div>
              <div style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isLogged && (
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSel ? C.dark : C.green }} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Coach streak message */}
      {streakDays === 0 && (
        <div style={{ marginTop: 14, fontSize: 12, color: C.textDim, textAlign: 'center' }}>
          Log a meal today to start your streak
        </div>
      )}
      {streakDays >= 3 && (
        <div style={{ marginTop: 12, fontSize: 12, color: C.amber, fontWeight: 500 }}>
          {streakDays >= 30 ? '🏆 30-day milestone — that\'s elite consistency.'
            : streakDays >= 14 ? '14 days in. Most people stopped weeks ago.'
            : streakDays >= 7 ? 'A full week strong. This is becoming a habit.'
            : 'Past the hardest part. Keep going.'}
        </div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Main TodayTab export
// ─────────────────────────────────────────────────────────────
export default function TodayTab({ userId, profile, updateProfile }) {
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [selectedDate,  setSelectedDate]  = useState(todayStr)
  const [weekOffset,    setWeekOffset]    = useState(0)
  const [foodLogs,      setFoodLogs]      = useState([])
  const [workoutLogs,   setWorkoutLogs]   = useState([])
  const [savedPlans,    setSavedPlans]    = useState([])
  const [dailyStats,    setDailyStats]    = useState({ steps: '', burned: '', sleep: '' })
  const [waterAmount,   setWaterAmount]   = useState(0)
  const [loggedDates,   setLoggedDates]   = useState(new Set())
  const [loading,       setLoading]       = useState(true)
  const statsTimer = useRef(null)

  const isToday = selectedDate === todayStr

  // Build week array
  const getWeekDays = (offset) => {
    const days = []
    const dow  = today.getDay()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - dow + (offset * 7) + i)
      days.push(d)
    }
    return days
  }
  const weekDays = getWeekDays(weekOffset)

  // Load day data
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      supabase.from('food_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('saved_plans').select('*').eq('user_id', userId).eq('is_active', true).limit(5),
      supabase.from('daily_stats').select('*').eq('user_id', userId).eq('log_date', selectedDate).single(),
    ]).then(([food, workout, plans, stats]) => {
      setFoodLogs(food.data    || [])
      setWorkoutLogs(workout.data || [])
      setSavedPlans(plans.data || [])
      setDailyStats(stats.data
        ? { steps: stats.data.steps || '', burned: stats.data.burned_kcal || '', sleep: stats.data.sleep_hours || '' }
        : { steps: '', burned: '', sleep: '' }
      )
      setLoading(false)
    })
  }, [userId, selectedDate])

  // Load streak history (last 60 days)
  useEffect(() => {
    if (!userId) return
    const from = new Date(today)
    from.setDate(today.getDate() - 60)
    supabase
      .from('food_logs')
      .select('log_date')
      .eq('user_id', userId)
      .gte('log_date', from.toISOString().split('T')[0])
      .then(({ data }) => {
        setLoggedDates(new Set((data || []).map(r => r.log_date)))
      })
  }, [userId, foodLogs])

  // Debounced stats save — passes value directly to avoid stale closure
  const handleStatChange = (key, value) => {
    setDailyStats(prev => ({ ...prev, [key]: value }))
    if (statsTimer.current) clearTimeout(statsTimer.current)
    statsTimer.current = setTimeout(async () => {
      const col    = key === 'steps' ? 'steps' : key === 'burned' ? 'burned_kcal' : 'sleep_hours'
      const parsed = key === 'sleep' ? parseFloat(value) : parseInt(value)
      await supabase.from('daily_stats').upsert({
        user_id: userId,
        log_date: selectedDate,
        [col]: isNaN(parsed) ? null : parsed,
        updated_at: new Date().toISOString(),
      })
    }, 900)
  }

  // Derived values
  const totalCal   = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalP     = foodLogs.reduce((s, f) => s + (f.protein  || 0), 0)
  const totalC     = foodLogs.reduce((s, f) => s + (f.carbs    || 0), 0)
  const totalF     = foodLogs.reduce((s, f) => s + (f.fat      || 0), 0)

  const calorieGoal = profile?.calorie_goal || 2200
  const proteinGoal = profile?.protein_goal || 150
  const waterUnit   = profile?.water_unit   || 'cups'
  const waterGoal   = waterUnit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)
  const cupSize     = profile?.cup_size_ml  || 250
  const waterPct    = waterGoal > 0 ? Math.min((waterAmount / waterGoal) * 100, 100) : 0

  // Streak count
  let streakDays = 0
  for (let i = 0; i < 60; i++) {
    const d  = new Date(today)
    d.setDate(today.getDate() - i)
    if (loggedDates.has(d.toISOString().split('T')[0])) streakDays++
    else break
  }

  // Date label
  const formatDate = (ds) => {
    if (ds === todayStr) return 'Today'
    const d         = new Date(ds + 'T00:00:00')
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (ds === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
  }

  // Coach message — max 2 sentences, contextual
  const hour = new Date().getHours()
  const timeGreet = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const coachMood = !isToday               ? 'neutral'
    : totalCal > calorieGoal               ? 'concerned'
    : streakDays >= 7                      ? 'celebrate'
    : streakDays >= 1                      ? 'proud'
    : totalCal === 0 && hour >= 10         ? 'concerned'
    : 'neutral'

  const coachMessage = !isToday
    ? 'You\'re viewing a previous day.'
    : totalCal > calorieGoal
    ? `You're ${(totalCal - calorieGoal).toLocaleString()} kcal over today. Keep dinner light.`
    : streakDays >= 7
    ? `${streakDays} days in a row. Don't stop now.`
    : streakDays >= 1
    ? `${streakDays}-day streak. ${(calorieGoal - totalCal) > 0 ? `${(calorieGoal - totalCal).toLocaleString()} kcal left today.` : 'Right on target.'}`
    : totalCal === 0 && hour >= 10
    ? 'Nothing logged yet. Log your first meal to get started.'
    : 'Ready when you are. Log your first meal.'

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* 1 ── Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.text, marginBottom: 2 }}>
          {isToday ? timeGreet : formatDate(selectedDate)}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted }}>
          {isToday
            ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : formatDate(selectedDate)}
        </div>
      </div>

      {/* 2 ── Coach Hero */}
      <CoachHero
        mood={coachMood}
        greeting="Coach Auron"
        message={coachMessage}
        showAnimation={false}
      />

      {/* 3 ── Calorie Ring */}
      <CalRing
        consumed={totalCal}  goal={calorieGoal}
        proteinG={totalP}    proteinGoal={proteinGoal}
        carbsG={totalC}      fatG={totalF}
      />

      {/* 4 ── Daily Stats */}
      <div style={{ marginBottom: 20 }}>
        <Label>Daily stats</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatCard icon="👟" label="Steps"  value={dailyStats.steps}  onChange={v => handleStatChange('steps',  v)} unit="steps" color={C.blue}   placeholder="0" isToday={isToday} />
          <StatCard icon="🔥" label="Burned" value={dailyStats.burned} onChange={v => handleStatChange('burned', v)} unit="kcal"  color={C.red}    placeholder="0" isToday={isToday} />
          <StatCard icon="🌙" label="Sleep"  value={dailyStats.sleep}  onChange={v => handleStatChange('sleep',  v)} unit="hrs"   color={C.purple} placeholder="0" isToday={isToday} />
        </div>
      </div>

      {/* 5 ── Meals */}
      <MealsSection foodLogs={foodLogs} isToday={isToday} />

      {/* 6 ── Workout */}
      <WorkoutSection
        workoutLogs={workoutLogs}
        savedPlans={savedPlans}
        selectedDate={selectedDate}
        isToday={isToday}
      />

      {/* 7 ── Water */}
      <WaterTracker
        userId={userId}
        profile={profile}
        updateProfile={updateProfile}
        selectedDate={selectedDate}
      />

      {/* 8 ── Weekly Streak */}
      <WeeklyProgress
        weekDays={weekDays}
        selectedDate={selectedDate}
        todayStr={todayStr}
        setSelectedDate={setSelectedDate}
        loggedDates={loggedDates}
        streakDays={streakDays}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />

    </div>
  )
}
