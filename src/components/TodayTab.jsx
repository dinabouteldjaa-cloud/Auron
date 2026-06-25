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
// ─────────────────────────────────────────────
// Coach Auron — chibi cartoon fitness coach
// Proper character: big head, cap, coach jacket,
// real facial expressions per mood, CSS animations.
// gender: 'male' | 'female'
// moods: 'neutral' | 'hyped' | 'proud' | 'concerned' | 'celebrate'
// ─────────────────────────────────────────────
let coachAnimInjected = false
function injectCoachAnimations() {
  if (coachAnimInjected) return
  coachAnimInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes coachIdle    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-3px) rotate(-1.5deg)} }
    @keyframes coachHyped   { 0%,100%{transform:translateY(0) rotate(0deg) scale(1)} 25%{transform:translateY(-6px) rotate(3deg) scale(1.06)} 75%{transform:translateY(-4px) rotate(-2deg) scale(1.04)} }
    @keyframes coachCelebrate { 0%,100%{transform:translateY(0) scale(1)} 20%{transform:translateY(-8px) scale(1.08)} 60%{transform:translateY(-5px) scale(1.05)} }
    @keyframes coachDroop   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(2px) rotate(1deg)} }
    @keyframes coachBlink   { 0%,88%,100%{transform:scaleY(1)} 92%{transform:scaleY(0.08)} }
    @keyframes coachPunch   { 0%,100%{transform:translateX(0)} 30%{transform:translateX(5px) rotate(4deg)} 60%{transform:translateX(-2px) rotate(-1deg)} }
    @keyframes coachSpark   { 0%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:1} 100%{transform:translate(calc(var(--sx)*2.5),calc(var(--sy)*2.5)) scale(1.2);opacity:0} }
    @keyframes coachPop     { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    @keyframes coachSweat   { 0%,100%{transform:translateY(0);opacity:0.7} 50%{transform:translateY(3px);opacity:1} }
  `
  document.head.appendChild(style)
}

function CoachAvatar({ mood = 'neutral', gender = 'male', size = 56, animated = true }) {
  useEffect(() => { injectCoachAnimations() }, [])

  // Mood → animation + expression config
  const moodCfg = {
    neutral:   { anim: 'coachIdle 2.8s ease-in-out infinite',     brow: 'flat',   eye: 'open',    mouth: 'slight' },
    hyped:     { anim: 'coachHyped 1s ease-in-out infinite',       brow: 'raised', eye: 'wide',    mouth: 'grin'   },
    proud:     { anim: 'coachIdle 2.2s ease-in-out infinite',      brow: 'up',     eye: 'open',    mouth: 'smile'  },
    concerned: { anim: 'coachDroop 2.4s ease-in-out infinite',     brow: 'worry',  eye: 'open',    mouth: 'frown'  },
    celebrate: { anim: 'coachCelebrate 1.2s ease-in-out infinite', brow: 'raised', eye: 'happy',   mouth: 'laugh'  },
  }
  const cfg = moodCfg[mood] || moodCfg.neutral

  // Colors — male: blue jacket, female: teal/coral jacket
  const skin = '#F0C89A'
  const skinShade = '#D9A87A'
  const hair = gender === 'female' ? '#5C3D1E' : '#3D2810'
  const jacket = gender === 'female' ? '#E07A85' : '#3A6FC4'
  const jacketShade = gender === 'female' ? '#C45E6A' : '#2A5098'
  const capColor = gender === 'female' ? '#C45E6A' : '#1E2A4A'
  const pantColor = '#1E2030'
  const shoeColor = gender === 'female' ? '#C45E6A' : '#2A5098'
  const whistle = '#E8C84A'

  // Eyebrow paths by expression
  const browLeft  = { flat: 'M13 20 Q16 19.5 19 20', raised: 'M13 18.5 Q16 17.5 19 18.5', up: 'M13 18 Q16 17 19 18', worry: 'M13 19 Q16 20.5 19 18.5' }
  const browRight = { flat: 'M21 20 Q24 19.5 27 20', raised: 'M21 18.5 Q24 17.5 27 18.5', up: 'M21 18 Q24 17 27 18', worry: 'M21 18.5 Q24 20.5 27 19' }

  return (
    <div style={{ position: 'relative', width: size, height: Math.round(size * 1.45), flexShrink: 0 }}>

      {/* Celebrate sparkles */}
      {mood === 'celebrate' && animated && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
          {[[-1,-1],[1,-1],[-1,0],[1,0],[0,-1],[0.5,-0.5],[-0.5,-0.7]].map(([sx, sy], i) => (
            <div key={i} style={{
              position: 'absolute', top: '18%', left: '50%',
              width: Math.max(3, size * 0.07), height: Math.max(3, size * 0.07),
              borderRadius: '50%', background: [C.gold, C.amber, '#fff', C.blue][i % 4],
              '--sx': `${sx * size * 0.38}px`, '--sy': `${sy * size * 0.38}px`,
              animation: `coachSpark 1s ease-out ${i * 0.13}s infinite`,
            }} />
          ))}
        </div>
      )}

      <div style={{
        width: '100%', height: '100%',
        animation: animated ? cfg.anim : 'none',
        transformOrigin: 'center bottom',
      }}>
        <svg viewBox="0 0 40 58" width={size} height={Math.round(size * 1.45)} style={{ overflow: 'visible' }}>

          {/* ── Shadow under feet ── */}
          <ellipse cx="20" cy="57" rx="9" ry="1.8" fill="rgba(0,0,0,0.15)" />

          {/* ── Legs ── */}
          <rect x="13" y="43" width="6" height="10" rx="3" fill={pantColor} />
          <rect x="21" y="43" width="6" height="10" rx="3" fill={pantColor} />

          {/* ── Shoes ── */}
          <ellipse cx="16" cy="53.5" rx="5" ry="2.5" fill={shoeColor} />
          <ellipse cx="24" cy="53.5" rx="5" ry="2.5" fill={shoeColor} />
          <ellipse cx="15.5" cy="53" rx="3.5" ry="1.6" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="23.5" cy="53" rx="3.5" ry="1.6" fill="rgba(255,255,255,0.2)" />

          {/* ── Body / jacket ── */}
          <rect x="11" y="30" width="18" height="15" rx="4" fill={jacket} />
          <rect x="11" y="30" width="18" height="15" rx="4" fill="rgba(0,0,0,0.06)" />
          {/* Jacket zipper line */}
          <line x1="20" y1="31" x2="20" y2="44" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          {/* Jacket shading */}
          <rect x="11" y="30" width="5" height="15" rx="2" fill={jacketShade} opacity="0.4" />

          {/* ── Arms ── */}
          {/* Left arm */}
          <rect x="5" y="30" width="7" height="5.5" rx="2.8" fill={jacket} transform="rotate(10 8.5 32.5)" />
          {/* Right arm — fist pump on hyped/celebrate */}
          <g style={{ animation: (mood === 'hyped' || mood === 'celebrate') && animated ? 'coachPunch 1s ease-in-out infinite' : 'none', transformOrigin: '31px 32px' }}>
            <rect x="28" y="30" width="7" height="5.5" rx="2.8" fill={jacket} transform="rotate(-10 31.5 32.5)" />
            {/* Fist */}
            <circle cx="34.5" cy="31" r="3" fill={skin} />
            <ellipse cx="34.5" cy="31" rx="3" ry="2.2" fill={skinShade} opacity="0.3" />
          </g>
          {/* Left hand */}
          <circle cx="5.5" cy="34.5" r="2.8" fill={skin} />

          {/* ── Whistle on neck ── */}
          <circle cx="20" cy="32" r="2" fill={whistle} />
          <rect x="19.4" y="29" width="1.2" height="3" rx="0.6" fill={whistle} />

          {/* ── Neck ── */}
          <rect x="17" y="27.5" width="6" height="4.5" rx="2" fill={skin} />

          {/* ── Head ── */}
          <ellipse cx="20" cy="18" rx="12.5" ry="13" fill={skin} />
          {/* Head shading */}
          <ellipse cx="26" cy="15" rx="5" ry="6" fill={skinShade} opacity="0.18" />

          {/* ── Hair ── */}
          {gender === 'female' ? (
            <g fill={hair}>
              {/* Ponytail */}
              <ellipse cx="20" cy="7" rx="11" ry="6.5" />
              <ellipse cx="31" cy="14" rx="3" ry="7" transform="rotate(15 31 14)" />
            </g>
          ) : (
            <ellipse cx="20" cy="7.5" rx="11" ry="6" fill={hair} />
          )}

          {/* ── Cap brim + body ── */}
          <ellipse cx="20" cy="9" rx="12" ry="5.5" fill={capColor} />
          <ellipse cx="20" cy="9" rx="12" ry="3" fill={capColor} />
          {/* Cap brim extending forward */}
          <ellipse cx="20" cy="12" rx="13.5" ry="2.5" fill={capColor} />
          <ellipse cx="20" cy="12.5" rx="13.5" ry="1.2" fill="rgba(0,0,0,0.2)" />
          {/* Cap top button */}
          <circle cx="20" cy="5" r="1.2" fill={gender === 'female' ? '#E8C84A' : '#4A90D9'} />

          {/* ── Beard (male only) ── */}
          {gender === 'male' && (
            <ellipse cx="20" cy="27" rx="5.5" ry="2.5" fill="#5C4030" opacity="0.55" />
          )}

          {/* ── Ears ── */}
          <ellipse cx="7.8" cy="19" rx="2.2" ry="2.8" fill={skin} />
          <ellipse cx="32.2" cy="19" rx="2.2" ry="2.8" fill={skin} />
          <ellipse cx="7.8" cy="19" rx="1.2" ry="1.8" fill={skinShade} opacity="0.4" />

          {/* ── Eyebrows ── */}
          <path d={browLeft[cfg.brow] || browLeft.flat} stroke={hair} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d={browRight[cfg.brow] || browRight.flat} stroke={hair} strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* ── Eyes ── */}
          {cfg.eye === 'happy' ? (
            /* Happy squint — arc eyes */
            <g stroke="#2A1A0A" strokeWidth="1.5" fill="none" strokeLinecap="round">
              <path d="M13.5 22.5 Q16 20.5 18.5 22.5" />
              <path d="M21.5 22.5 Q24 20.5 26.5 22.5" />
            </g>
          ) : cfg.eye === 'wide' ? (
            /* Wide excited eyes */
            <g fill="#2A1A0A">
              <circle cx="16" cy="22.5" r="2.8" />
              <circle cx="24" cy="22.5" r="2.8" />
              <circle cx="16.8" cy="21.8" r="0.9" fill="white" />
              <circle cx="24.8" cy="21.8" r="0.9" fill="white" />
            </g>
          ) : (
            /* Normal eyes with blink */
            <g fill="#2A1A0A">
              <ellipse cx="16" cy="22.5" rx="2.4" ry="2.4"
                style={{ animation: animated ? 'coachBlink 4.2s ease-in-out infinite' : 'none', transformOrigin: '16px 22.5px' }} />
              <ellipse cx="24" cy="22.5" rx="2.4" ry="2.4"
                style={{ animation: animated ? 'coachBlink 4.2s ease-in-out infinite 0.07s' : 'none', transformOrigin: '24px 22.5px' }} />
              <circle cx="16.9" cy="21.7" r="0.8" fill="white" />
              <circle cx="24.9" cy="21.7" r="0.8" fill="white" />
            </g>
          )}

          {/* ── Nose ── */}
          <ellipse cx="20" cy="25" rx="1.5" ry="1" fill={skinShade} opacity="0.5" />

          {/* ── Mouth ── */}
          {cfg.mouth === 'grin' && <path d="M15.5 27.5 Q20 31.5 24.5 27.5" stroke="#3A1A0A" strokeWidth="1.4" strokeLinecap="round" fill="none" />}
          {cfg.mouth === 'laugh' && (
            <>
              <path d="M14.5 27.5 Q20 33 25.5 27.5" stroke="#3A1A0A" strokeWidth="1.4" strokeLinecap="round" fill="#D4827A" />
              <path d="M14.5 27.5 Q20 33 25.5 27.5" fill="#D4827A" opacity="0.6" />
            </>
          )}
          {cfg.mouth === 'smile' && <path d="M16.5 27.5 Q20 30 23.5 27.5" stroke="#3A1A0A" strokeWidth="1.4" strokeLinecap="round" fill="none" />}
          {cfg.mouth === 'slight' && <path d="M17 27.5 Q20 29 23 27.5" stroke="#3A1A0A" strokeWidth="1.3" strokeLinecap="round" fill="none" />}
          {cfg.mouth === 'frown' && <path d="M16 28.5 Q20 26 24 28.5" stroke="#3A1A0A" strokeWidth="1.4" strokeLinecap="round" fill="none" />}

          {/* ── Sweat drop (concerned) ── */}
          {mood === 'concerned' && (
            <ellipse cx="29" cy="17" rx="1.4" ry="2.2" fill="#6ABFE0" opacity="0.8"
              style={{ animation: animated ? 'coachSweat 2s ease-in-out infinite' : 'none' }} />
          )}

          {/* ── Energy lines (hyped) ── */}
          {(mood === 'hyped' || mood === 'celebrate') && (
            <g stroke={C.amber} strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
              <line x1="32" y1="10" x2="35" y2="7" />
              <line x1="34" y1="14" x2="37.5" y2="14" />
              <line x1="32" y1="18" x2="35" y2="21" />
            </g>
          )}

          {/* ── Stars (celebrate) ── */}
          {mood === 'celebrate' && (
            <g fill={C.gold} opacity="0.9">
              <polygon points="5,8 5.8,10.5 8.5,10.5 6.3,12 7.2,14.5 5,13 2.8,14.5 3.7,12 1.5,10.5 4.2,10.5" />
            </g>
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
function AICoachCard({ consumed, goal, proteinG, proteinGoal, waterAmt, waterGoal, workoutCount, streakDays, userGoal, isToday, gender }) {
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
        <CoachAvatar mood={cardMood} gender={gender} size={32} />
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
  const coachGender   = profile?.coach_gender || 'male'
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <CoachAvatar mood={greeting.mood} gender={coachGender} size={64} />
        <div>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Coach Auron</div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.45, fontWeight: 500 }}>
            {greeting.text}
          </div>
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
              <CoachAvatar mood={mood} gender={coachGender} size={30} />
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
        gender={coachGender}
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
