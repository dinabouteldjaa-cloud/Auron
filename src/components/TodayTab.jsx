import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { AuronCharacter, AuronWelcomeScreen, CoachHero, CoachInsightCard, getAuronMood } from './CoachAuron'

const C = {
  gold:         T.purple,
  goldLight:    T.purpleLight,
  goldMid:      T.purpleMid,
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
  blueLight:    T.blueLight,
  amber:        T.amber,
  purple:       T.purple,
  purpleLight:  T.purpleLight,
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
        background: T.surface, borderRadius: 18,
        border: `1px solid ${T.divider}`,
        boxShadow: T.shadowCard,
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
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
// HeroCard — full-width purple gradient card, calorie ring + macros
// ─────────────────────────────────────────────────────────────
function HeroCard({ consumed, goal, proteinG, proteinGoal, carbsG, fatG }) {
  const r    = 64
  const circ = 2 * Math.PI * r
  const pct  = Math.min(consumed / goal, 1)
  const over = consumed > goal
  const ring = over ? T.red : pct > 0.9 ? T.amber : '#FFFFFF'

  return (
    <div style={{
      borderRadius: 22, marginBottom: 16,
      background: `linear-gradient(135deg, ${T.heroGrad1} 0%, ${T.heroGrad2} 100%)`,
      boxShadow: T.shadowStrong, padding: '20px 18px',
      display: 'grid', gridTemplateColumns: 'auto 1fr',
      gap: 16, alignItems: 'center',
    }}>
      {/* Calorie ring */}
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <svg width={150} height={150} viewBox="0 0 150 150">
          <circle cx={75} cy={75} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={12} />
          <circle cx={75} cy={75} r={r} fill="none" stroke={ring} strokeWidth={12}
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform="rotate(-90 75 75)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Calories</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{consumed.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>/ {goal.toLocaleString()}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: over ? T.red : 'rgba(255,255,255,0.9)', marginTop: 2 }}>
            {over ? `${(consumed-goal).toLocaleString()} over` : `${(goal-consumed).toLocaleString()} left`}
          </div>
        </div>
      </div>

      {/* Macros */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 12 }}>Macros</div>
        {[
          { label: 'Protein', val: proteinG, goal: proteinGoal, color: '#6EE7B7' },
          { label: 'Carbs',   val: carbsG,   goal: Math.round((goal*0.45)/4), color: T.amber },
          { label: 'Fats',    val: fatG,     goal: Math.round((goal*0.25)/9), color: '#F87171' },
        ].map(m => {
          const mpct = m.goal > 0 ? Math.min(m.val / m.goal, 1) : 0
          return (
            <div key={m.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{m.label}</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{Math.round(m.val)}g / {m.goal}g</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${mpct*100}%`, height: '100%', background: m.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>View Nutrition</span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>›</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MedicationCard — purple-tinted placeholder, Phase 3 ready
// ─────────────────────────────────────────────────────────────
function MedicationCard({ onOpenTracker }) {
  return (
    <div style={{
      borderRadius: 20, marginBottom: 16,
      background: `linear-gradient(135deg, ${T.purpleLight} 0%, rgba(108,92,231,0.05) 100%)`,
      border: `1px solid ${T.border}`, boxShadow: T.shadowCard, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.purpleMid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💊</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Medication</span>
        </div>
        <span style={{ fontSize: 13, color: T.purple, fontWeight: 500 }}>See all ›</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: '⏰ Next up', value: '—', sub: 'No meds',  color: T.textMuted },
          { label: '✓ Taken',   value: '0', sub: 'today',    color: T.green     },
          { label: '✗ Missed',  value: '0', sub: 'today',    color: T.red       },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '10px 10px' }}>
            <div style={{ fontSize: 10, color: item.color, marginBottom: 4, fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{item.value}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <button onClick={onOpenTracker} style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: `1px solid ${T.border}`, color: T.purple, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        📅 Open Medication Tracker ›
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Activity + Steps — 2-column row matching reference layout
// Each card has: label, big number, sub-goal, mini ring, CTA link
// ─────────────────────────────────────────────────────────────
function MiniRing({ pct, color, size = 52, icon }) {
  const r    = (size / 2) - 5
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(pct, 1))}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: size * 0.3 }}>
        {icon}
      </div>
    </div>
  )
}

function ActivityStepsRow({ workoutLogs, steps, burned, isToday, onStatChange }) {
  const workoutMin  = workoutLogs.reduce((s, w) => s + (w.duration_minutes || 0), 0)
  const activityGoal = 60
  const stepsGoal    = 10000
  const stepsVal     = parseInt(steps) || 0
  const actPct       = workoutMin / activityGoal
  const stepsPct     = stepsVal  / stepsGoal

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>

      {/* Activity */}
      <div style={{ background: T.surface, borderRadius: 18, padding: '16px 14px', boxShadow: T.shadowCard, border: `1px solid ${T.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏃</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Activity</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1 }}>{workoutMin}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>/ {activityGoal} min</div>
            {workoutMin > 0 && <div style={{ fontSize: 11, color: T.amber, marginTop: 4, fontWeight: 500 }}>⭐ Great job!</div>}
          </div>
          <MiniRing pct={actPct} color={T.green} size={52} icon="🏃" />
        </div>
        <div style={{ borderTop: `1px solid ${T.divider}`, paddingTop: 10, marginTop: 4 }}>
          <span style={{ fontSize: 12, color: T.purple, fontWeight: 600 }}>Log Workout →</span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ background: T.surface, borderRadius: 18, padding: '16px 14px', boxShadow: T.shadowCard, border: `1px solid ${T.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👟</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Steps</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            {isToday ? (
              <input
                type="number"
                value={steps || ''}
                onChange={e => onStatChange('steps', e.target.value)}
                placeholder="0"
                style={{ width: 90, background: 'transparent', border: 'none', outline: 'none', fontSize: 28, fontWeight: 700, color: T.text, padding: 0, fontFamily: 'inherit', lineHeight: 1 }}
              />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1 }}>{stepsVal.toLocaleString() || '—'}</div>
            )}
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>/ {stepsGoal.toLocaleString()} steps</div>
            {stepsVal > 0 && stepsVal < stepsGoal && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Keep moving!</div>}
            {stepsVal >= stepsGoal && <div style={{ fontSize: 11, color: T.green, marginTop: 4, fontWeight: 500 }}>Goal reached! 🎉</div>}
          </div>
          <MiniRing pct={stepsPct} color={T.blue} size={52} icon="👟" />
        </div>
        <div style={{ borderTop: `1px solid ${T.divider}`, paddingTop: 10, marginTop: 4 }}>
          <span style={{ fontSize: 12, color: T.blue, fontWeight: 600 }}>View Progress →</span>
        </div>
      </div>
    </div>
  )
}

// Sleep card — full width below activity row
function SleepCard({ sleep, isToday, onStatChange }) {
  const sleepVal  = parseFloat(sleep) || 0
  const sleepGoal = 8
  const pct       = sleepVal / sleepGoal
  return (
    <div style={{ background: T.surface, borderRadius: 18, padding: '14px 16px', boxShadow: T.shadowCard, border: `1px solid ${T.divider}`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌙</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Sleep</div>
        <div style={{ height: 5, background: T.surfaceMid, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 1) * 100}%`, height: '100%', background: T.purple, borderRadius: 3, transition: 'width 0.5s' }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {isToday ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <input type="number" value={sleep || ''} onChange={e => onStatChange('sleep', e.target.value)} placeholder="0"
              style={{ width: 40, background: 'transparent', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: T.text, padding: 0, fontFamily: 'inherit', textAlign: 'right' }} />
            <span style={{ fontSize: 12, color: T.textMuted }}>/ {sleepGoal}h</span>
          </div>
        ) : (
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{sleepVal || '—'}<span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400 }}>h</span></div>
        )}
      </div>
    </div>
  )
}

// Old StatCard kept for any stray references — routes to new components
function StatCard({ icon, label, value, onChange, unit, color, placeholder, isToday }) {
  return null
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: T.surface, borderRadius: 22, padding: 24, width: '100%', maxWidth: 380, boxShadow: T.shadowStrong, border: `1px solid ${T.divider}` }}>
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
    <Card style={{ marginBottom: 0, height: '100%', boxSizing: 'border-box' }}>
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
// ─────────────────────────────────────────────────────────────
// WeekStrip — compact date navigator for top of page
// ─────────────────────────────────────────────────────────────
function WeekStrip({ weekDays, selectedDate, todayStr, setSelectedDate, loggedDates, streakDays, weekOffset, setWeekOffset }) {
  const today = new Date()

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Week nav row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>‹</button>

        {/* Day buttons */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {weekDays.map((d, i) => {
            const ds           = d.toISOString().split('T')[0]
            const isSel        = ds === selectedDate
            const isFuture     = d > today
            const isCurrentDay = ds === todayStr
            const isLogged     = loggedDates.has(ds)

            let bg = 'transparent', border = C.border, numColor = isFuture ? C.textDim : C.textMuted
            if (isSel)             { bg = T.purple;      border = 'transparent'; numColor = '#fff' }
            else if (isLogged)     { bg = T.greenLight;  border = T.green + '66' }
            else if (isCurrentDay) { bg = T.purpleLight; border = T.purple + '55'; numColor = T.purple }

            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(ds)} disabled={isFuture}
                style={{
                  flex: 1, padding: '6px 2px 5px', borderRadius: 10,
                  border: `1px solid ${border}`, background: bg,
                  cursor: isFuture ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: isSel ? 'rgba(255,255,255,0.75)' : C.textMuted }}>
                  {DAYS[d.getDay()].slice(0,1)}
                </div>
                <div style={{ fontSize: 13, fontWeight: isSel ? 700 : 500, color: numColor, lineHeight: 1 }}>
                  {d.getDate()}
                </div>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: isLogged ? (isSel ? 'rgba(255,255,255,0.8)' : T.green) : 'transparent' }} />
              </button>
            )
          })}
        </div>

        <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))} disabled={weekOffset === 0}
          style={{ background: 'none', border: 'none', color: weekOffset === 0 ? C.textDim : C.textMuted, fontSize: 18, cursor: weekOffset === 0 ? 'default' : 'pointer', padding: '0 2px', lineHeight: 1 }}>›</button>

        {/* Streak badge inline */}
        {streakDays > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 9px', borderRadius: 20, background: T.amberLight || 'rgba(245,166,35,0.12)', flexShrink: 0 }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>{streakDays}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// WeeklyProgress — kept for any future reference (unused)
// ─────────────────────────────────────────────────────────────
function WeeklyProgress({ weekDays, selectedDate, todayStr, setSelectedDate, loggedDates, streakDays, weekOffset, setWeekOffset }) {
  return <WeekStrip weekDays={weekDays} selectedDate={selectedDate} todayStr={todayStr} setSelectedDate={setSelectedDate} loggedDates={loggedDates} streakDays={streakDays} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
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

  // Welcome screen — shown once per user, dismissed to localStorage
  const welcomeKey = userId ? `auron_welcomed_${userId}` : null
  const [showWelcome, setShowWelcome] = useState(() => {
    if (!welcomeKey) return false
    return localStorage.getItem(welcomeKey) !== 'seen'
  })
  const dismissWelcome = () => {
    if (welcomeKey) localStorage.setItem(welcomeKey, 'seen')
    setShowWelcome(false)
  }
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
  const firstName   = profile?.full_name?.split(' ')[0] || ''
  const hey         = firstName ? `${firstName}, ` : ''
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

  // Coach mood — maps app state to Auron's expression
  const hour = new Date().getHours()

  const coachMood = getAuronMood({
    isToday,
    totalCal,
    calorieGoal,
    streakDays,
    workoutCount: workoutLogs.length,
    hour,
  })

  // Coach message — personal, direct, uses first name
  const coachMessage = !isToday
    ? `${hey}you're looking back at a previous day. Keep the momentum going today.`
    : totalCal > calorieGoal
    ? `${hey}you're ${(totalCal - calorieGoal).toLocaleString()} kcal over. Keep dinner light and stay hydrated.`
    : streakDays >= 7
    ? `${hey}${streakDays} days in a row — that's a real streak. Don't break it now.`
    : workoutLogs.length > 0 && totalCal > 0
    ? `${hey}workout done and meals tracked. Today is a great day — keep it up!`
    : workoutLogs.length > 0
    ? `Workout logged${firstName ? `, ${firstName}` : ''}! Now fuel up — log your meals to stay on target.`
    : streakDays >= 3
    ? `${hey}${streakDays}-day streak and counting. ${(calorieGoal - totalCal) > 0 ? `${(calorieGoal - totalCal).toLocaleString()} kcal left today.` : "You're right on target."}`
    : streakDays >= 1
    ? `Day ${streakDays}${firstName ? `, ${firstName}` : ''} — you're building something real. Keep showing up.`
    : totalCal === 0 && hour < 10
    ? `Good morning${firstName ? `, ${firstName}` : ''}! Ready for a great day? Start by logging breakfast.`
    : totalCal === 0 && hour >= 10
    ? `${hey}nothing logged yet. Start small — even one meal keeps the streak alive.`
    : hour >= 20
    ? `Evening${firstName ? `, ${firstName}` : ''}. How did today go? Log anything you missed.`
    : `${hey}ready when you are. Log your first meal to get started.`

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* Welcome screen */}
      {showWelcome && (
        <AuronWelcomeScreen userId={userId} onDismiss={dismissWelcome} />
      )}

      {/* Week strip — compact, at the very top */}
      <WeekStrip
        weekDays={weekDays}
        selectedDate={selectedDate}
        todayStr={todayStr}
        setSelectedDate={setSelectedDate}
        loggedDates={loggedDates}
        streakDays={streakDays}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />

      {/* Coach Auron */}
      <CoachHero
        mood={coachMood}
        message={coachMessage}
      />

      {/* 1 ── Calorie ring + macros */}
      <HeroCard
        consumed={totalCal}  goal={calorieGoal}
        proteinG={totalP}    proteinGoal={proteinGoal}
        carbsG={totalC}      fatG={totalF}
      />

      {/* 2 ── 2-col: Activity + Steps */}
      <ActivityStepsRow
        workoutLogs={workoutLogs}
        steps={dailyStats.steps}
        burned={dailyStats.burned}
        isToday={isToday}
        onStatChange={handleStatChange}
      />

      {/* 3 ── Sleep bar — compact full-width */}
      <SleepCard
        sleep={dailyStats.sleep}
        isToday={isToday}
        onStatChange={handleStatChange}
      />

      {/* 4 ── Medication card */}
      <MedicationCard onOpenTracker={() => {}} />

      {/* 5 ── Water tracker — full width now insight is removed */}
      <WaterTracker
        userId={userId}
        profile={profile}
        updateProfile={updateProfile}
        selectedDate={selectedDate}
      />

      {/* 6 ── Meals */}
      <MealsSection foodLogs={foodLogs} isToday={isToday} />

      {/* 7 ── Workout */}
      <WorkoutSection
        workoutLogs={workoutLogs}
        savedPlans={savedPlans}
        selectedDate={selectedDate}
        isToday={isToday}
      />

    </div>
  )
}
