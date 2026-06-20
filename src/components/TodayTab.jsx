import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { askClaude } from '../lib/claude'

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const C = {
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.14)', goldDark: '#8B6914',
  dark: '#0D0E12', surface: '#16181F', surfaceLight: '#1E2029', surfaceMid: '#1A1C24',
  border: 'rgba(201,168,76,0.18)', borderStrong: 'rgba(201,168,76,0.38)',
  text: '#F0EDE6', textMuted: '#8A8A90', textDim: '#52525A',
  green: '#4CAF72', greenLight: 'rgba(76,175,114,0.14)',
  red: '#E05252', redLight: 'rgba(224,82,82,0.12)',
  blue: '#5B9BD5', blueLight: 'rgba(91,155,213,0.13)',
  amber: '#D4924A', amberLight: 'rgba(212,146,74,0.13)',
  teal: '#2DD4BF', tealLight: 'rgba(45,212,191,0.12)',
  purple: '#9B72D0', purpleLight: 'rgba(155,114,208,0.13)',
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', time: '6–10am' },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️',  time: '11am–2pm' },
  { id: 'snack',     label: 'Snack',     icon: '🍎',  time: '2–5pm' },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙',  time: '5–9pm' },
]

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, borderRadius: 18,
      border: `1px solid ${C.border}`, padding: '16px 18px',
      cursor: onClick ? 'pointer' : 'default', ...style
    }}>{children}</div>
  )
}

function Label({ children, style = {} }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 12, ...style }}>
      {children}
    </div>
  )
}

function Pill({ children, color, bg }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: bg, color, fontWeight: 500, display: 'inline-block' }}>
      {children}
    </span>
  )
}

function Spinner({ size = 16 }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
  )
}

// ─────────────────────────────────────────────
// Calorie Ring — hero section
// ─────────────────────────────────────────────
function CalRing({ consumed, goal, proteinG, proteinGoal, carbsG, fatG }) {
  const r = 72, circ = 2 * Math.PI * r
  const pct = Math.min(consumed / goal, 1)
  const offset = circ * (1 - pct)
  const over = consumed > goal
  const ringColor = over ? C.red : pct > 0.9 ? C.amber : C.gold

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{ position: 'relative', width: 186, height: 186, margin: '0 auto 16px' }}>
        {/* Outer glow */}
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: `radial-gradient(circle, ${ringColor}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <svg width={186} height={186} viewBox="0 0 186 186">
          {/* Track */}
          <circle cx={93} cy={93} r={r} fill="none" stroke={C.surfaceLight} strokeWidth={13} />
          {/* Progress */}
          <circle cx={93} cy={93} r={r} fill="none" stroke={ringColor} strokeWidth={13}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 93 93)" style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.4s' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', width: '100%' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 600, color: C.text, lineHeight: 1 }}>
            {consumed.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>of {goal.toLocaleString()} kcal</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 5, color: over ? C.red : C.gold }}>
            {over ? `${(consumed-goal).toLocaleString()} over` : `${(goal-consumed).toLocaleString()} left`}
          </div>
        </div>
      </div>

      {/* Macro pills row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {[
          { label: 'Protein', val: proteinG, goal: proteinGoal, color: C.blue },
          { label: 'Carbs', val: carbsG, goal: Math.round((goal * 0.45) / 4), color: C.amber },
          { label: 'Fat', val: fatG, goal: Math.round((goal * 0.25) / 9), color: C.gold },
        ].map(m => {
          const mpct = Math.min(m.val / m.goal, 1)
          return (
            <div key={m.label} style={{ textAlign: 'center', minWidth: 72 }}>
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

// ─────────────────────────────────────────────
// Coach Auron — mascot avatar
// Visual identity: a glowing torch/flame mark that shifts
// expression (glow intensity + color) based on mood.
// moods: 'neutral' | 'hyped' | 'proud' | 'concerned' | 'celebrate'
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Coach Auron — animated flame-spirit mascot
// Real SVG character: body shape, eyes, brows, mouth —
// expressions change by mood, idle bob/blink animation,
// celebration burst on milestones.
// moods: 'neutral' | 'hyped' | 'proud' | 'concerned' | 'celebrate' | 'sleepy'
// ─────────────────────────────────────────────
let coachAnimInjected = false
function injectCoachAnimations() {
  if (coachAnimInjected) return
  coachAnimInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes coachBob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-2deg); } }
    @keyframes coachBobHyped { 0%,100% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-5px) rotate(3deg) scale(1.04); } }
    @keyframes coachBlink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
    @keyframes coachFlicker { 0%,100% { opacity: 1; } 50% { opacity: 0.85; } }
    @keyframes coachPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes coachSparkle { 0% { transform: translate(0,0) scale(0); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; } }
    @keyframes coachDroop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(1px); } }
  `
  document.head.appendChild(style)
}

function CoachAvatar({ mood = 'neutral', size = 34, animated = true }) {
  useEffect(() => { injectCoachAnimations() }, [])

  const palettes = {
    neutral:   { body: [C.gold, C.amber],         glow: C.gold + '26',  brow: 0,  mouth: 'smile',  bob: 'coachBob' },
    hyped:     { body: [C.amber, '#FF8A4C'],       glow: C.amber + '38', brow: -4, mouth: 'grin',   bob: 'coachBobHyped' },
    proud:     { body: [C.gold, '#F0D27A'],        glow: C.gold + '44',  brow: -2, mouth: 'smile',  bob: 'coachBob' },
    concerned: { body: ['#9B948A', C.gold],        glow: C.gold + '14',  brow: 6,  mouth: 'flat',   bob: 'coachDroop' },
    celebrate: { body: ['#FFB84C', C.gold],        glow: C.amber + '4D', brow: -5, mouth: 'grin',   bob: 'coachBobHyped' },
    sleepy:    { body: [C.textDim, '#7A766C'],     glow: 'transparent',  brow: 2,  mouth: 'flat',   bob: 'coachBob' },
  }
  const p = palettes[mood] || palettes.neutral
  const eyeH = mood === 'sleepy' ? 1.2 : 3.4

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Ambient glow */}
      {p.glow !== 'transparent' && (
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: `radial-gradient(circle, ${p.glow} 0%, transparent 72%)`, pointerEvents: 'none' }} />
      )}

      {/* Celebration sparkle burst */}
      {mood === 'celebrate' && animated && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[[-14,-10],[14,-10],[-16,6],[16,6],[0,-18]].map(([tx,ty], i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, borderRadius: '50%',
              background: C.gold, '--tx': `${tx}px`, '--ty': `${ty}px`,
              animation: `coachSparkle 1.1s ease-out ${i * 0.12}s infinite`,
            }} />
          ))}
        </div>
      )}

      <div style={{
        width: '100%', height: '100%',
        animation: animated ? `${p.bob} ${mood === 'hyped' || mood === 'celebrate' ? '1.1s' : '2.6s'} ease-in-out infinite` : 'none',
      }}>
        <svg viewBox="0 0 40 40" width={size} height={size} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`coachGrad-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p.body[0]} />
              <stop offset="100%" stopColor={p.body[1]} />
            </linearGradient>
          </defs>

          {/* Flame body — teardrop shape */}
          <path
            d="M20 4 C 28 12, 33 18, 33 25 C 33 32.5, 27 37, 20 37 C 13 37, 7 32.5, 7 25 C 7 18, 12 12, 20 4 Z"
            fill={`url(#coachGrad-${mood})`}
            style={{ animation: animated ? 'coachFlicker 2.4s ease-in-out infinite' : 'none' }}
          />

          {/* Inner highlight */}
          <ellipse cx="16" cy="20" rx="4.5" ry="6" fill="rgba(255,255,255,0.18)" />

          {/* Eyebrows — expression driver */}
          <g stroke={C.dark} strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
            <line x1="13.5" y1={16 + p.brow * 0.3} x2="17" y2={16 - p.brow * 0.5} />
            <line x1="23" y1={16 - p.brow * 0.5} x2="26.5" y2={16 + p.brow * 0.3} />
          </g>

          {/* Eyes */}
          <g fill={C.dark} opacity="0.85">
            <rect x="14" y="19.5" width="3.2" height={eyeH} rx="1.6" style={{ animation: animated && mood !== 'sleepy' ? 'coachBlink 4.5s ease-in-out infinite' : 'none', transformOrigin: '15.6px 21px' }} />
            <rect x="22.8" y="19.5" width="3.2" height={eyeH} rx="1.6" style={{ animation: animated && mood !== 'sleepy' ? 'coachBlink 4.5s ease-in-out infinite' : 'none', transformOrigin: '24.4px 21px', animationDelay: '0.05s' }} />
          </g>

          {/* Mouth */}
          {p.mouth === 'grin' && (
            <path d="M15 26 Q20 31 25 26" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
          )}
          {p.mouth === 'smile' && (
            <path d="M16 26.5 Q20 29.5 24 26.5" stroke={C.dark} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
          )}
          {p.mouth === 'flat' && (
            <line x1="16.5" y1="27" x2="23.5" y2="27" stroke={C.dark} strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
          )}
        </svg>
      </div>
    </div>
  )
}

// Streak copy system — Coach Auron's personality by tier
function getStreakMessage(streak) {
  if (streak === 0)
    return { mood: 'neutral', line: "No streak yet — log a meal today and I'll start counting." }
  if (streak === 1)
    return { mood: 'hyped', line: "Day one is done. Show up again tomorrow and we've got something started." }
  if (streak === 2)
    return { mood: 'hyped', line: "Two days running. Don't stop now — momentum is the whole game." }
  if (streak >= 3 && streak <= 6)
    return { mood: 'hyped', line: `${streak} days strong. You're past the hardest part — starting.` }
  if (streak === 7)
    return { mood: 'celebrate', line: "A full week! That's not luck, that's a habit forming. Proud of you." }
  if (streak >= 8 && streak <= 13)
    return { mood: 'proud', line: `${streak} days in a row. This is who you are now, not just what you're doing.` }
  if (streak === 14)
    return { mood: 'celebrate', line: "Two full weeks. Most people quit by now — you didn't." }
  if (streak >= 15 && streak <= 29)
    return { mood: 'proud', line: `${streak} days. I've stopped being surprised — this is just consistency now.` }
  if (streak === 30)
    return { mood: 'celebrate', line: "30 days. A full month of showing up. That's genuinely rare — well done." }
  return { mood: 'proud', line: `${streak} days and counting. Honestly? I'm just here cheering at this point.` }
}

// ─────────────────────────────────────────────
// AI Coach Card
// ─────────────────────────────────────────────
function AICoachCard({ consumed, goal, proteinG, proteinGoal, waterAmt, waterGoal, workoutCount, streakDays, userGoal, isToday }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generate = useCallback(async () => {
    if (loading || !isToday) return
    setLoading(true)
    const calLeft = goal - consumed
    const proteinLeft = proteinGoal - proteinG
    const waterPct = Math.round((waterAmt / waterGoal) * 100)

    const tip = await askClaude(
      'You are a warm, motivating AI fitness coach inside a premium fitness app called Auron. Give exactly one sharp, specific, actionable insight in 1-2 sentences. Be personal and direct. No bullet points. No generic advice. Reference the actual numbers provided.',
      `User stats right now:
- Calories: ${consumed} consumed of ${goal} goal (${calLeft > 0 ? calLeft + ' remaining' : Math.abs(calLeft) + ' over'})
- Protein: ${Math.round(proteinG)}g of ${proteinGoal}g goal
- Water: ${waterPct}% of daily goal
- Workouts today: ${workoutCount}
- Current streak: ${streakDays} days
- User goal: ${userGoal || 'General health'}
Give one specific insight or encouragement based on the most important thing they should focus on right now.`
    )
    setInsight(tip)
    setGenerated(true)
    setLoading(false)
  }, [consumed, goal, proteinG, proteinGoal, waterAmt, waterGoal, workoutCount, streakDays, userGoal, isToday, loading])

  // Auto-generate once data is loaded and it's today
  useEffect(() => {
    if (isToday && !generated && !loading && (consumed > 0 || streakDays > 0)) {
      generate()
    }
  }, [isToday, consumed, streakDays])

  if (!isToday) return null

  // Determine mood from context for the avatar
  const calLeft = goal - consumed
  const cardMood = calLeft < 0 ? 'concerned' : streakDays >= 7 ? 'proud' : streakDays >= 1 ? 'hyped' : 'neutral'

  return (
    <div style={{ marginBottom: 20, borderRadius: 18, background: `linear-gradient(135deg, #1C1A12 0%, #1A1A1A 100%)`, border: `1px solid ${C.borderStrong}`, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle gold shimmer */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at 100% 0%, ${C.gold}0A 0%, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <CoachAvatar mood={cardMood} size={32} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>Coach Auron</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Your AI fitness coach</div>
        </div>
        <button onClick={generate} disabled={loading} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 10px', color: C.textMuted, fontSize: 11, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          {loading ? <><Spinner size={11} /> thinking</> : '↺ refresh'}
        </button>
      </div>

      {loading && !insight && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <Spinner size={13} />
          <span style={{ fontSize: 13, color: C.textMuted }}>Analyzing your day...</span>
        </div>
      )}

      {insight && (
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.65, fontStyle: 'normal' }}>
          {insight}
        </div>
      )}

      {!loading && !insight && (
        <div style={{ fontSize: 13, color: C.textMuted }}>
          Log your first meal to get a personalized insight.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Daily Stats — manual entry, HealthKit-ready
// ─────────────────────────────────────────────
// source: 'manual' | 'healthkit' — enables Apple Health to override cleanly later
function StatCard({ icon, label, value, onChange, unit, color, placeholder, isToday, source = 'manual' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ background: C.surfaceLight, borderRadius: 14, padding: '13px 14px', border: `1px solid ${focused ? color + '44' : C.border}`, transition: 'border-color 0.2s' }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{icon}</span> {label}
        {source === 'healthkit' && <span style={{ marginLeft: 'auto', fontSize: 9, color: C.green, fontWeight: 600 }}>AUTO</span>}
      </div>
      {isToday && source === 'manual' ? (
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: value ? color : C.textDim, fontSize: 20, fontWeight: 600, padding: 0, fontFamily: 'inherit' }}
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

// ─────────────────────────────────────────────
// Meal Section
// ─────────────────────────────────────────────
function MealsSection({ foodLogs, isToday }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ marginBottom: 20 }}>
      <Label>Meals</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MEAL_SLOTS.map(slot => {
          const items = foodLogs.filter(f => f.meal_slot === slot.id)
          const slotCal = items.reduce((s, f) => s + f.calories, 0)
          const slotP   = items.reduce((s, f) => s + (f.protein || 0), 0)
          const isExp = expanded === slot.id
          const hasItems = items.length > 0

          return (
            <div key={slot.id} style={{ background: C.surface, border: `1px solid ${hasItems ? C.borderStrong : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <div onClick={() => hasItems && setExpanded(isExp ? null : slot.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: hasItems ? 'pointer' : 'default' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: hasItems ? C.goldLight : C.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, transition: 'background 0.2s' }}>
                  {slot.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{slot.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
                    {hasItems ? `${items.length} item${items.length > 1 ? 's' : ''} · ${Math.round(slotP)}g protein` : <span style={{ color: C.textDim }}>Nothing logged</span>}
                  </div>
                </div>
                {hasItems && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>{slotCal}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>kcal</div>
                  </div>
                )}
                {hasItems && (
                  <div style={{ fontSize: 14, color: C.textMuted, marginLeft: 4 }}>{isExp ? '▴' : '▾'}</div>
                )}
              </div>

              {isExp && items.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 16px' }}>
                  {items.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.text }}>{f.food_name}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>P {f.protein}g · C {f.carbs}g · F {f.fat}g</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{f.calories} kcal</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state with prompt for today */}
              {!hasItems && isToday && (
                <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, color: C.textDim }}>Nothing logged for {slot.label.toLowerCase()} yet</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {foodLogs.length === 0 && isToday && (
        <div style={{ marginTop: 12, padding: '16px', background: C.surfaceLight, borderRadius: 12, textAlign: 'center', border: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🍽️</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Log your first meal in the Calories tab</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Your food will appear here</div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Exercise Detail Modal — AI explains how to do it (structured)
// ─────────────────────────────────────────────
function ExerciseModal({ exercise, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(false); setData(null)

    askClaude(
      `You are a certified personal trainer. Respond ONLY with valid JSON, no markdown, no explanation, in this exact shape:
{"setup":["short step 1","short step 2"],"execution":["short step 1","short step 2","short step 3"],"mistakes":["common mistake 1","common mistake 2"],"tip":"one short pro tip sentence"}
Rules: each array item must be ONE short sentence (under 14 words). 2-3 items per array max. No fluff, no intros.`,
      `Exercise: ${exercise.name}${exercise.sets ? `. Target: ${exercise.sets} sets × ${exercise.reps || exercise.duration}.` : ''}`
    ).then(raw => {
      if (cancelled) return
      try {
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        setData(parsed)
      } catch {
        setError(true)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [exercise.name])

  const Section = ({ icon, label, color, items }) => {
    if (!items || items.length === 0) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{icon}</span> {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginTop: 7, flexShrink: 0 }} />
              <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, borderRadius: '22px 22px 0 0',
        padding: '24px 20px 40px', width: '100%', maxWidth: 480,
        maxHeight: '82vh', overflowY: 'auto',
        border: `1px solid ${C.borderStrong}`, borderBottom: 'none',
      }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: C.purple + '28', border: `1px solid ${C.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💪</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.text }}>{exercise.name}</div>
            {(exercise.sets || exercise.duration) && (
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {exercise.sets && exercise.reps ? `${exercise.sets} sets × ${exercise.reps} reps` : ''}
                {exercise.sets && exercise.duration && !exercise.reps ? `${exercise.sets} sets × ${exercise.duration}` : ''}
                {exercise.rest ? ` · Rest ${exercise.rest}` : ''}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.textMuted, fontSize: 24, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0' }}>
            <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <span style={{ fontSize: 13, color: C.textMuted }}>Loading instructions...</span>
          </div>
        )}

        {error && !loading && (
          <div style={{ fontSize: 13, color: C.textMuted, padding: '8px 0' }}>
            Couldn't load instructions right now. Try again in a moment.
          </div>
        )}

        {data && !loading && (
          <>
            <Section icon="📍" label="Setup" color={C.blue} items={data.setup} />
            <Section icon="▶" label="Execution" color={C.purple} items={data.execution} />
            <Section icon="⚠" label="Avoid" color={C.amber} items={data.mistakes} />
            {data.tip && (
              <div style={{ background: C.goldLight, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: '12px 14px', marginTop: 4 }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>💡 Coach tip</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{data.tip}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Workout Section
// ─────────────────────────────────────────────
const WORKOUT_TYPE_ICONS = {
  rest: '🛌', run: '🏃', cardio: '🏃', strength: '💪', hiit: '⚡', yoga: '🧘',
  swim: '🏊', cycle: '🚴', mobility: '🤸', upper: '💪', lower: '🦵', full: '🏋️',
  push: '🤜', pull: '🤛', leg: '🦵', core: '🎯',
}
function guessIcon(text = '') {
  const lower = text.toLowerCase()
  for (const [key, icon] of Object.entries(WORKOUT_TYPE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '🏋️'
}

function PlannedWorkoutCard({ plan, workout, planTitle }) {
  const [expanded, setExpanded] = useState(false)
  const [activeExercise, setActiveExercise] = useState(null)
  const isRest = workout.name?.toLowerCase().includes('rest')

  return (
    <>
      <div style={{
        borderRadius: 16, marginBottom: 10, overflow: 'hidden',
        border: `1px solid ${isRest ? C.border : C.purple + '55'}`,
        background: isRest
          ? C.surfaceLight
          : `linear-gradient(135deg, ${C.purple}18 0%, ${C.surface} 100%)`,
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: isRest ? C.surfaceLight : C.purple + '28',
            border: `1px solid ${isRest ? C.border : C.purple + '44'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            {isRest ? '🛌' : guessIcon(workout.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: C.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              Today's plan · {planTitle}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{workout.name}</div>
            {!isRest && (
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                {workout.duration ? `${workout.duration}min` : ''}
                {workout.exercises?.length ? ` · ${workout.exercises.length} exercises` : ''}
              </div>
            )}
          </div>
          {!isRest && workout.exercises?.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{
              background: 'none', border: `1px solid ${C.purple}44`,
              borderRadius: 20, padding: '5px 12px',
              color: C.purple, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            }}>
              {expanded ? '▴ Hide' : '▾ Show'}
            </button>
          )}
          {isRest && (
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: C.surfaceLight, color: C.textMuted, border: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>Rest day</span>
          )}
        </div>

        {/* Warmup */}
        {expanded && workout.warmup && (
          <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 12, color: C.amber }}>Warmup: {workout.warmup}</span>
          </div>
        )}

        {/* Exercise list */}
        {expanded && workout.exercises?.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.purple}22` }}>
            {workout.exercises.map((ex, j) => (
              <div key={j} onClick={() => setActiveExercise(ex)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px',
                  borderBottom: j < workout.exercises.length - 1 ? `1px solid ${C.border}` : 'none',
                  cursor: 'pointer', background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.purple + '0A'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: C.purple + '28', border: `1px solid ${C.purple}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: C.purple,
                }}>{j + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
                    {ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : ''}
                    {ex.sets && ex.duration && !ex.reps ? `${ex.sets} sets × ${ex.duration}` : ''}
                    {!ex.sets && ex.duration ? ex.duration : ''}
                    {ex.rest ? ` · Rest ${ex.rest}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.purple, flexShrink: 0 }}>How to →</div>
              </div>
            ))}
          </div>
        )}

        {/* Cooldown */}
        {expanded && workout.cooldown && (
          <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 14 }}>❄️</span>
            <span style={{ fontSize: 12, color: C.blue }}>Cooldown: {workout.cooldown}</span>
          </div>
        )}

        {/* Rest day message */}
        {isRest && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
              Recovery is part of the plan. Take it easy — light walking or stretching is fine.
            </div>
          </div>
        )}
      </div>

      {activeExercise && <ExerciseModal exercise={activeExercise} onClose={() => setActiveExercise(null)} />}
    </>
  )
}

function WorkoutSection({ workoutLogs, savedPlans, selectedDate, isToday }) {
  const todayDayIndex = new Date(selectedDate + 'T00:00:00').getDay() // 0=Sun…6=Sat

  // Only show plans where:
  // 1. is_active = true
  // 2. chosen_days includes today's day index
  // 3. schedule has an entry for today's day index
  const todayPlans = savedPlans
    .filter(plan => {
      if (!plan.is_active) return false
      const chosenDays = plan.chosen_days || []
      const schedule = plan.schedule || {}
      // Must be a chosen day AND have a schedule entry
      return chosenDays.includes(todayDayIndex) && schedule[todayDayIndex]
    })
    .map(plan => ({
      planTitle: plan.title,
      workout: plan.schedule[todayDayIndex],
    }))

  const totalCalBurned = workoutLogs.reduce((s, w) => s + (w.calories_burned || 0), 0)
  const totalMinutes   = workoutLogs.reduce((s, w) => s + (w.duration_minutes || 0), 0)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Label style={{ marginBottom: 0 }}>Workouts</Label>
        {workoutLogs.length > 1 && (
          <div style={{ fontSize: 11, color: C.textMuted }}>{totalMinutes}min · {totalCalBurned} kcal total</div>
        )}
      </div>

      {/* Today's planned workouts — only if this day is chosen */}
      {todayPlans.map((p, i) => (
        <PlannedWorkoutCard key={i} planTitle={p.planTitle} workout={p.workout} />
      ))}

      {/* Logged workouts */}
      {workoutLogs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {workoutLogs.map(w => (
            <div key={w.id} style={{
              background: C.surface, border: `1px solid ${C.green}33`,
              borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💪</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{w.workout_name}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                  {w.duration_minutes ? `${w.duration_minutes}min` : ''}
                  {w.calories_burned ? ` · ${w.calories_burned} kcal` : ''}
                  {w.workout_type ? ` · ${w.workout_type}` : ''}
                </div>
              </div>
              <Pill color={C.green} bg={C.greenLight}>Done ✓</Pill>
            </div>
          ))}
        </div>
      ) : todayPlans.length === 0 && (
        <div style={{ background: C.surfaceLight, borderRadius: 14, padding: '24px 16px', textAlign: 'center', border: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏃</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.textMuted, marginBottom: 4 }}>
            {isToday ? 'No workout logged today' : 'No workouts this day'}
          </div>
          {isToday && <div style={{ fontSize: 12, color: C.textDim }}>Go to the Workouts tab to log one</div>}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Water Tracker
// ─────────────────────────────────────────────
function WaterSettingsModal({ profile, onSave, onClose }) {
  const [unit, setUnit] = useState(profile?.water_unit || 'cups')
  const [goal, setGoal] = useState(
    profile?.water_unit === 'ml'
      ? (profile?.water_goal_ml || 2000).toString()
      : (profile?.water_goal || 8).toString()
  )
  const [cupSize, setCupSize] = useState((profile?.cup_size_ml || 250).toString())

  const save = () => {
    const updates = { water_unit: unit }
    if (unit === 'cups') {
      updates.water_goal = parseInt(goal) || 8
      updates.cup_size_ml = parseInt(cupSize) || 250
    } else {
      updates.water_goal_ml = parseInt(goal) || 2000
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
            {[['cups','☕ Cups'],['ml','💧 Millilitres']].map(([val,label]) => (
              <button key={val} onClick={() => setUnit(val)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${unit===val?C.gold:C.border}`, background: unit===val?C.goldLight:'transparent', color: unit===val?C.gold:C.textMuted, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
            ))}
          </div>
        </div>

        {unit === 'cups' ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal (cups)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['4','6','8','10','12'].map(n => (
                  <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${goal===n?C.gold:C.border}`, background: goal===n?C.goldLight:'transparent', color: goal===n?C.gold:C.textMuted, fontSize: 13, cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Cup size</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['150','150ml'],['200','200ml'],['250','250ml'],['350','350ml'],['500','500ml']].map(([n,l]) => (
                  <button key={n} onClick={() => setCupSize(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${cupSize===n?C.gold:C.border}`, background: cupSize===n?C.goldLight:'transparent', color: cupSize===n?C.gold:C.textMuted, fontSize: 10, cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>
                Total: <strong style={{ color: C.gold }}>{parseInt(goal||8) * parseInt(cupSize||250)} ml</strong> / day
              </div>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Daily goal</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['1500','2000','2500','3000','3500'].map(n => (
                <button key={n} onClick={() => setGoal(n)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${goal===n?C.gold:C.border}`, background: goal===n?C.goldLight:'transparent', color: goal===n?C.gold:C.textMuted, fontSize: 11, cursor: 'pointer', minWidth: 52 }}>{n}ml</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Custom amount (ml)</div>
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
  const [amount, setAmount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const unit = profile?.water_unit || 'cups'
  const goal = unit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)
  const cupSize = profile?.cup_size_ml || 250
  const pct = Math.min((amount / goal) * 100, 100)
  const goalReached = pct >= 100

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
        if (data) {
          setAmount(unit === 'ml'
            ? (data.amount_ml || (data.cups || 0) * cupSize)
            : (data.cups || 0))
        } else {
          setAmount(0)
        }
      })
      .catch(() => setAmount(0))
      .finally(() => setLoading(false))
  }, [userId, selectedDate, unit, cupSize])

  const save = async (newAmount) => {
    const clamped = Math.max(0, Math.round(newAmount))
    setAmount(clamped)
    setSaving(true)
    const cups = unit === 'cups' ? clamped : Math.round(clamped / cupSize)
    const amount_ml = unit === 'ml' ? clamped : clamped * cupSize
    await supabase
      .from('water_logs')
      .upsert({ user_id: userId, log_date: selectedDate, cups, amount_ml, updated_at: new Date().toISOString() })
    setSaving(false)
  }

  // Fix: tap filled cup → set amount to exactly that index (removes that cup and all after)
  // tap empty cup → set amount to index + 1 (fills up to and including that cup)
  const handleCupTap = (i) => {
    if (!isToday) return
    const newAmount = i < amount ? i : i + 1
    save(newAmount)
  }

  const displayLabel = unit === 'ml'
    ? `${amount} / ${goal} ml`
    : `${amount} / ${goal} cups`
  const mlEquiv = unit === 'cups' ? amount * cupSize : amount
  const activeColor = goalReached ? C.teal : C.blue

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
            💧 Water
            {saving && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 8 }}>saving…</span>}
          </div>
          <div style={{ fontSize: 12, color: activeColor }}>
            {loading ? '…' : displayLabel}
            {unit === 'cups' && amount > 0 && ` · ${mlEquiv} ml`}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '5px 10px', color: C.textMuted, fontSize: 11, cursor: 'pointer' }}>
          ⚙ Settings
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 7, background: C.surfaceLight, borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: goalReached
            ? `linear-gradient(90deg, ${C.blue}, ${C.teal})`
            : C.blue,
          borderRadius: 4,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {unit === 'cups' ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(goal, 12) }, (_, i) => {
            const filled = i < amount
            return (
              <div
                key={i}
                onClick={() => handleCupTap(i)}
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  cursor: isToday ? 'pointer' : 'default',
                  background: filled ? C.blueLight : C.surfaceLight,
                  border: `1px solid ${filled ? activeColor : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17,
                  transition: 'all 0.15s',
                  transform: filled ? 'scale(1.06)' : 'scale(1)',
                  opacity: !isToday ? 0.6 : 1,
                }}>
                💧
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          {/* Quick-add buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[250, 330, 500, 750, 1000].map(ml => (
              <button
                key={ml}
                onClick={() => isToday && save(amount + ml)}
                disabled={!isToday}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.surfaceLight,
                  color: isToday ? C.text : C.textMuted,
                  fontSize: 12,
                  cursor: isToday ? 'pointer' : 'default',
                  minWidth: 50,
                }}>
                +{ml}ml
              </button>
            ))}
          </div>
          {/* Manual adjust */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => isToday && amount > 0 && save(amount - 250)}
              disabled={!isToday || amount === 0}
              style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 20, cursor: amount > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              −
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: activeColor }}>
              {amount}ml
            </div>
            <button
              onClick={() => isToday && save(amount + 250)}
              disabled={!isToday}
              style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </button>
          </div>
        </div>
      )}

      {!isToday && (
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, textAlign: 'center' }}>
          View only — switch to today to log water
        </div>
      )}
      {goalReached && isToday && (
        <div style={{ fontSize: 12, color: C.teal, marginTop: 10, textAlign: 'center', fontWeight: 600 }}>
          🎉 Daily water goal reached!
        </div>
      )}

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

// ─────────────────────────────────────────────
// Main TodayTab
// ─────────────────────────────────────────────
export default function TodayTab({ userId, profile, updateProfile }) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekOffset, setWeekOffset] = useState(0)
  const [foodLogs, setFoodLogs] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [savedPlans, setSavedPlans] = useState([])
  const [dailyStats, setDailyStats] = useState({ steps: '', burned: '', sleep: '' })
  const [waterAmount, setWaterAmount] = useState(0)
  const [loggedDates, setLoggedDates] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const statsTimer = useRef(null)

  const isToday = selectedDate === todayStr

  const getWeekDays = (offset) => {
    const days = []
    const dayOfWeek = today.getDay()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - dayOfWeek + (offset * 7) + i)
      days.push(d)
    }
    return days
  }
  const weekDays = getWeekDays(weekOffset)

  // Load all data for selected date
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      supabase.from('food_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', selectedDate),
      supabase.from('saved_plans').select('*').eq('user_id', userId).eq('is_active', true).limit(5),
      supabase.from('daily_stats').select('*').eq('user_id', userId).eq('log_date', selectedDate).single(),
    ]).then(([food, workout, plans, stats]) => {
      setFoodLogs(food.data || [])
      setWorkoutLogs(workout.data || [])
      setSavedPlans(plans.data || [])
      if (stats.data) {
        setDailyStats({ steps: stats.data.steps || '', burned: stats.data.burned_kcal || '', sleep: stats.data.sleep_hours || '' })
      } else {
        setDailyStats({ steps: '', burned: '', sleep: '' })
      }
      setLoading(false)
    })
  }, [userId, selectedDate])

  // Load logged dates for streak (last 30 days)
  useEffect(() => {
    if (!userId) return
    const from = new Date(today)
    from.setDate(today.getDate() - 30)
    const fromStr = from.toISOString().split('T')[0]
    supabase.from('food_logs').select('log_date').eq('user_id', userId).gte('log_date', fromStr)
      .then(({ data }) => {
        const dates = new Set((data || []).map(r => r.log_date))
        setLoggedDates(dates)
      })
  }, [userId, foodLogs]) // re-run when foodLogs changes so streak updates live

  // Debounced stat save — fixes stale state bug by using value param directly
  const handleStatChange = (key, value) => {
    setDailyStats(prev => ({ ...prev, [key]: value }))
    if (statsTimer.current) clearTimeout(statsTimer.current)
    statsTimer.current = setTimeout(async () => {
      const col = key === 'steps' ? 'steps' : key === 'burned' ? 'burned_kcal' : 'sleep_hours'
      const parsed = key === 'sleep' ? parseFloat(value) : parseInt(value)
      await supabase.from('daily_stats').upsert({
        user_id: userId,
        log_date: selectedDate,
        [col]: isNaN(parsed) ? null : parsed,
        updated_at: new Date().toISOString(),
      })
    }, 900)
  }

  const totalCal  = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalP    = foodLogs.reduce((s, f) => s + (f.protein || 0), 0)
  const totalC    = foodLogs.reduce((s, f) => s + (f.carbs || 0), 0)
  const totalF    = foodLogs.reduce((s, f) => s + (f.fat || 0), 0)
  const calorieGoal   = profile?.calorie_goal || 2200
  const proteinGoal   = profile?.protein_goal || 150
  const waterUnit     = profile?.water_unit || 'cups'
  const waterGoal     = waterUnit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)
  const cupSize       = profile?.cup_size_ml || 250

  // Streak count
  let streakDays = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    if (loggedDates.has(d.toISOString().split('T')[0])) streakDays++
    else break
  }

  const formatDate = (ds) => {
    if (ds === todayStr) return 'Today'
    const d = new Date(ds + 'T00:00:00')
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    if (ds === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
  }

  // Greeting line — Coach Auron's hello, varies by time of day + state
  const getGreeting = () => {
    const hour = new Date().getHours()
    const timeGreeting = hour < 5 ? "Up late?" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 22 ? "Good evening" : "Up late?"
    if (!isToday) return { mood: 'neutral', text: "Looking back, are we?" }
    if (streakDays >= 7) return { mood: 'proud', text: `${timeGreeting}. ${streakDays} days running — let's keep it that way.` }
    if (totalCal === 0 && hour >= 10) return { mood: 'concerned', text: `${timeGreeting}. Nothing logged yet today — let's fix that.` }
    if (totalCal === 0) return { mood: 'neutral', text: `${timeGreeting}. Ready when you are.` }
    return { mood: 'hyped', text: `${timeGreeting}. You're already moving today.` }
  }
  const greeting = getGreeting()

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* ── Coach Auron greeting ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <CoachAvatar mood={greeting.mood} size={42} />
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.4, fontWeight: 500 }}>
          {greeting.text}
        </div>
      </div>

      {/* ── Combined Week Navigator + Streak ── */}
      <div style={{
        marginBottom: 20, borderRadius: 18, padding: '16px 18px',
        background: streakDays > 0 ? `linear-gradient(135deg, ${C.amber}14 0%, ${C.surface} 100%)` : C.surface,
        border: `1px solid ${streakDays > 0 ? C.amber + '44' : C.border}`,
      }}>
        {/* Week offset row + streak badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setWeekOffset(w => w - 1)}
            style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}>‹</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `${Math.abs(weekOffset)} weeks ago`}
            </span>
            {streakDays > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 20, background: C.amber + '22' }}>
                <span style={{ fontSize: 12 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{streakDays}</span>
              </span>
            )}
          </div>

          <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
            style={{ background: 'none', border: 'none', color: weekOffset === 0 ? C.border : C.textMuted, fontSize: 18, cursor: weekOffset === 0 ? 'default' : 'pointer', padding: '2px 6px', lineHeight: 1 }}>›</button>
        </div>

        {/* Day strip — date + streak in one */}
        <div style={{ display: 'flex', gap: 5 }}>
          {weekDays.map((d, i) => {
            const ds = d.toISOString().split('T')[0]
            const isSel = ds === selectedDate
            const isFuture = d > today
            const isCurrentDay = ds === todayStr
            const isLogged = loggedDates.has(ds)

            let bg = 'transparent'
            let border = C.border
            let numColor = isFuture ? C.border : C.textMuted

            if (isSel) { bg = C.gold; border = 'transparent'; numColor = C.dark }
            else if (isLogged) { bg = C.greenLight; border = C.green + '66' }
            else if (isCurrentDay) { bg = C.goldLight; border = C.gold + '66'; numColor = C.gold }

            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(ds)} disabled={isFuture}
                style={{
                  flex: 1, padding: '8px 4px 7px', borderRadius: 13,
                  border: `1px solid ${border}`, background: bg,
                  cursor: isFuture ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: isSel ? C.dark : C.textMuted, opacity: isSel ? 0.7 : 1 }}>
                  {DAYS[d.getDay()].slice(0,1)}
                </div>
                <div style={{ fontSize: 15, fontWeight: isSel ? 700 : 500, color: numColor }}>
                  {d.getDate()}
                </div>
                <div style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isLogged && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSel ? C.dark : C.green }} />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Coach Auron speaks — streak motivation */}
        {(() => {
          const { mood, line } = getStreakMessage(streakDays)
          const isMilestone = [7, 14, 30].includes(streakDays)
          const milestones = [7, 14, 30, 60, 100]
          const nextMilestone = milestones.find(m => m > streakDays)
          const daysToGo = nextMilestone ? nextMilestone - streakDays : null

          return (
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: `1px solid ${streakDays > 0 ? C.amber + '22' : C.border}`,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <CoachAvatar mood={mood} size={30} />
              <div style={{ flex: 1, paddingTop: 1 }}>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontWeight: isMilestone ? 600 : 400 }}>
                  {line}
                </div>
                {streakDays > 0 && !isMilestone && daysToGo && (
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>
                    {daysToGo} more day{daysToGo !== 1 ? 's' : ''} to your {nextMilestone}-day milestone
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ── Page title ── */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.text, marginBottom: 22 }}>
        {formatDate(selectedDate)}
      </div>

      {/* ── Calorie Ring (hero) ── */}
      <CalRing
        consumed={totalCal} goal={calorieGoal}
        proteinG={totalP} proteinGoal={proteinGoal}
        carbsG={totalC} fatG={totalF}
      />

      {/* ── AI Coach Card ── */}
      <AICoachCard
        consumed={totalCal} goal={calorieGoal}
        proteinG={totalP} proteinGoal={proteinGoal}
        waterAmt={waterAmount} waterGoal={waterGoal}
        workoutCount={workoutLogs.length}
        streakDays={streakDays}
        userGoal={profile?.primary_goal}
        isToday={isToday}
      />

      {/* ── Daily Stats ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <Label style={{ marginBottom: 0 }}>Daily stats</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatCard icon="👟" label="Steps" value={dailyStats.steps} onChange={v => handleStatChange('steps', v)} unit="steps" color={C.blue} placeholder="0" isToday={isToday} />
          <StatCard icon="🔥" label="Burned" value={dailyStats.burned} onChange={v => handleStatChange('burned', v)} unit="kcal" color={C.red} placeholder="0" isToday={isToday} />
          <StatCard icon="🌙" label="Sleep" value={dailyStats.sleep} onChange={v => handleStatChange('sleep', v)} unit="hrs" color={C.purple} placeholder="0" isToday={isToday} />
        </div>
      </div>

      {/* ── Meals ── */}
      <MealsSection foodLogs={foodLogs} isToday={isToday} />

      {/* ── Workouts ── */}
      <WorkoutSection workoutLogs={workoutLogs} savedPlans={savedPlans} selectedDate={selectedDate} isToday={isToday} />

      {/* ── Water ── */}
      <WaterTracker
        userId={userId} profile={profile}
        updateProfile={updateProfile}
        selectedDate={selectedDate}
      />
    </div>
  )
}
