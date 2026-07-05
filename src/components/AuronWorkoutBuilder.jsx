import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { AuronCharacter } from './CoachAuron'
import { getExercise } from '../lib/workoutData.js'

const C = T
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ─────────────────────────────────────────────
// Questions definition
// ─────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'goal', mood: 'motivating',
    q: "What's your main goal?",
    sub: "This helps Auron build the right plan for you.",
    type: 'single',
    options: [
      { label: 'Lose fat',        emoji: '🔥' },
      { label: 'Build muscle',    emoji: '💪' },
      { label: 'Improve fitness', emoji: '🏃' },
      { label: 'Get stronger',    emoji: '🏋️' },
      { label: 'Stay healthy',    emoji: '❤️' },
    ],
  },
  {
    id: 'location', mood: 'thinking',
    q: 'Where will you train?',
    sub: "Auron will pick exercises that fit your space.",
    type: 'single',
    options: [
      { label: 'Home',    emoji: '🏠' },
      { label: 'Gym',     emoji: '🏋️' },
      { label: 'Outdoor', emoji: '🌳' },
      { label: 'Mix',     emoji: '🔄' },
    ],
  },
  {
    id: 'equipment', mood: 'workout',
    q: 'What equipment do you have?',
    sub: "Be honest — Auron only uses what you have.",
    type: 'single',
    options: [
      { label: 'No equipment',     emoji: '🙌' },
      { label: 'Dumbbells',        emoji: '🏋️' },
      { label: 'Resistance bands', emoji: '〰️' },
      { label: 'Full gym',         emoji: '💪' },
      { label: 'Other',            emoji: '⚙️' },
    ],
  },
  {
    id: 'days', mood: 'habit',
    q: 'How many days per week?',
    sub: "Consistency beats intensity. Pick what you can commit to.",
    type: 'single',
    options: [
      { label: '2 days', emoji: '🗓️' },
      { label: '3 days', emoji: '🗓️' },
      { label: '4 days', emoji: '🗓️' },
      { label: '5 days', emoji: '🗓️' },
      { label: '6 days', emoji: '🗓️' },
    ],
  },
  {
    id: 'duration', mood: 'thinking',
    q: 'How long per session?',
    sub: "Short and consistent beats long and sporadic.",
    type: 'single',
    options: [
      { label: '15 minutes', emoji: '⚡' },
      { label: '30 minutes', emoji: '🕐' },
      { label: '45 minutes', emoji: '🕐' },
      { label: '60 minutes', emoji: '🕐' },
    ],
  },
  {
    id: 'level', mood: 'greeting',
    q: "What's your fitness level?",
    sub: "No judgement — be honest for the best results.",
    type: 'single',
    options: [
      { label: 'Beginner',     emoji: '🌱' },
      { label: 'Intermediate', emoji: '⚡' },
      { label: 'Advanced',     emoji: '🔥' },
    ],
  },
  {
    id: 'focus', mood: 'workout',
    q: 'Any areas to focus on?',
    sub: "Select all that apply.",
    type: 'multi',
    options: [
      { label: 'Arms',      emoji: '💪' },
      { label: 'Chest',     emoji: '🦋' },
      { label: 'Shoulders', emoji: '🏋️' },
      { label: 'Back',      emoji: '🔙' },
      { label: 'Legs',      emoji: '🦵' },
      { label: 'Core',      emoji: '🧘' },
      { label: 'Full body', emoji: '⭐' },
    ],
  },
  {
    id: 'limitations', mood: 'concerned',
    q: 'Any limitations or exercises to avoid?',
    sub: "Mention injuries, mobility issues, or anything to skip.",
    type: 'text',
    placeholder: 'e.g. Bad knees, avoid jumping, no overhead pressing...',
  },
  {
    id: 'request', mood: 'thinking',
    q: 'Any specific request for Auron?',
    sub: "Anything else you want in your plan.",
    type: 'text',
    placeholder: 'e.g. I want a simple dumbbell plan, avoid jumping, focus on arms and chest.',
  },
]

// Medical safety keywords
const MEDICAL_KEYWORDS = ['heart', 'cardiac', 'surgery', 'cancer', 'diabetes', 'epilepsy', 'pregnant', 'pregnancy', 'chronic', 'condition', 'disorder', 'disease', 'injury', 'fracture', 'herniat', 'arthritis']
const hasMedicalConcern = text => text && MEDICAL_KEYWORDS.some(k => text.toLowerCase().includes(k))

// ─────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${(current / total) * 100}%`, background: C.purple, borderRadius: 2, transition: 'width 0.3s ease' }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Question screen
// ─────────────────────────────────────────────
function QuestionScreen({ q, value, onChange, onNext, onBack, idx, total }) {
  const canNext = q.type === 'text'
    ? true
    : q.type === 'multi'
    ? (value || []).length > 0
    : !!value

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 300, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {idx > 0 && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1 }}>‹</button>
          )}
          <div style={{ flex: 1 }}>
            <ProgressBar current={idx + 1} total={total} />
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
            {idx + 1}/{total}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        {/* Auron */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AuronCharacter mood={q.mood} size="compact" />
        </div>

        {/* Question */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>{q.q}</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>{q.sub}</div>
        </div>

        {/* Options */}
        {q.type === 'single' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(opt => {
              const selected = value === opt.label
              return (
                <button key={opt.label} onClick={() => onChange(opt.label)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', border: `2px solid ${selected ? C.purple : C.divider}`, background: selected ? C.purpleLight : C.surface, transition: 'all 0.15s', boxShadow: selected ? `0 0 0 1px ${C.purple}` : C.shadowCard }}>
                  <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: selected ? 700 : 500, color: selected ? C.purple : C.text }}>{opt.label}</span>
                  {selected && <span style={{ marginLeft: 'auto', color: C.purple, fontSize: 18 }}>✓</span>}
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'multi' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {q.options.map(opt => {
              const arr = value || []
              const selected = arr.includes(opt.label)
              return (
                <button key={opt.label} onClick={() => {
                  const next = selected ? arr.filter(v => v !== opt.label) : [...arr, opt.label]
                  onChange(next)
                }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px', borderRadius: 16, cursor: 'pointer', border: `2px solid ${selected ? C.purple : C.divider}`, background: selected ? C.purpleLight : C.surface, transition: 'all 0.15s', boxShadow: selected ? `0 0 0 1px ${C.purple}` : C.shadowCard }}>
                  <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? C.purple : C.text, textAlign: 'center' }}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'text' && (
          <div>
            <textarea
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={q.placeholder}
              rows={4}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 16, background: C.surface, border: `2px solid ${C.divider}`, color: C.text, fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: C.shadowCard }}
              onFocus={e => e.target.style.borderColor = C.purple}
              onBlur={e => e.target.style.borderColor = C.divider}
            />
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>Leave blank to skip</div>
          </div>
        )}

        <div style={{ height: 100 }} />
      </div>

      {/* Next button */}
      <div style={{ padding: '12px 24px 36px', background: C.pageBg || '#F0EFF8', borderTop: `1px solid ${C.divider}`, flexShrink: 0 }}>
        <button onClick={onNext} disabled={!canNext}
          style={{ width: '100%', padding: '16px', borderRadius: 20, background: canNext ? C.purple : C.surfaceMid, border: 'none', color: canNext ? '#fff' : C.textDim, fontSize: 16, fontWeight: 700, cursor: canNext ? 'pointer' : 'default', transition: 'all 0.15s' }}>
          {idx === total - 1 ? '✨ Build my plan' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Generating screen
// ─────────────────────────────────────────────
function GeneratingScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <AuronCharacter mood="workout" size="hero" />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 20, marginBottom: 8, textAlign: 'center' }}>
        Building your plan...
      </div>
      <div style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', marginBottom: 32 }}>
        Coach Auron is designing a personalised workout plan just for you.
      </div>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: C.purple, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────
// Plan preview screen
// ─────────────────────────────────────────────
function PlanPreviewScreen({ plan, answers, onSave, onRegenerate, onEditRequest, onCancel, saving }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 300, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 14, cursor: 'pointer', padding: 0 }}>✕ Cancel</button>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: C.text, textAlign: 'center' }}>Your plan is ready</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {/* Auron card */}
        <div style={{ background: C.purpleLight, borderRadius: 20, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16, border: `1px solid ${C.border}` }}>
          <AuronCharacter mood="happy" size="compact" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Coach Auron</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
              Here's your personalised {plan.difficulty?.toLowerCase()} plan for {answers.goal?.toLowerCase()}. {plan.daysPerWeek} days/week, {plan.sessionDuration} sessions.
            </div>
          </div>
        </div>

        {/* Plan name */}
        <div style={{ background: C.surface, borderRadius: 16, padding: '14px 16px', marginBottom: 12, border: `1px solid ${C.divider}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Plan name</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{plan.planName}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            {plan.daysPerWeek} days/week · {plan.sessionDuration} · {plan.difficulty}
          </div>
        </div>

        {/* Weekly schedule */}
        {plan.weeklySchedule?.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 16, padding: '14px 16px', marginBottom: 12, border: `1px solid ${C.divider}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Weekly schedule</div>
            {plan.weeklySchedule.map((day, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < plan.weeklySchedule.length - 1 ? `1px solid ${C.divider}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: day.rest ? C.surfaceMid : C.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: day.rest ? C.textMuted : C.purple, flexShrink: 0 }}>
                  {day.day?.slice(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{day.day}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{day.focus || (day.rest ? 'Rest' : '')}</div>
                </div>
                {day.rest && <span style={{ fontSize: 11, color: C.textMuted }}>😴</span>}
              </div>
            ))}
          </div>
        )}

        {/* Workouts */}
        {plan.workouts?.map((workout, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.divider}`, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: C.purpleLight, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.purple }}>{workout.title}</div>
              {workout.notes && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{workout.notes}</div>}
            </div>
            {workout.warmup && (
              <div style={{ padding: '8px 16px', background: `${C.amber}10`, borderBottom: `1px solid ${C.divider}`, fontSize: 12, color: C.textMuted }}>
                🔥 Warmup: {workout.warmup}
              </div>
            )}
            <div style={{ padding: '8px 16px' }}>
              {workout.exercises?.map((ex, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: j < workout.exercises.length - 1 ? `1px solid ${C.divider}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: C.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {getExercise(typeof ex === 'string' ? ex : ex.name).icon || '💪'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{typeof ex === 'string' ? ex : ex.name}</div>
                    {(ex.sets || ex.reps) && (
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps}`}{ex.rest && ` · ${ex.rest} rest`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {workout.cooldown && (
              <div style={{ padding: '8px 16px', background: `${C.blue}08`, borderTop: `1px solid ${C.divider}`, fontSize: 12, color: C.textMuted }}>
                🧊 Cooldown: {workout.cooldown}
              </div>
            )}
          </div>
        ))}

        <div style={{ height: 120 }} />
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '12px 20px 36px', background: C.pageBg || '#F0EFF8', borderTop: `1px solid ${C.divider}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onSave} disabled={saving}
          style={{ width: '100%', padding: 14, borderRadius: 18, background: C.purple, border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer', boxShadow: `0 4px 20px ${C.purple}44` }}>
          {saving ? 'Saving…' : '✓ Save plan'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRegenerate}
            style={{ flex: 1, padding: 12, borderRadius: 14, background: C.surfaceMid, border: 'none', color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 Regenerate
          </button>
          <button onClick={onEditRequest}
            style={{ flex: 1, padding: 12, borderRadius: 14, background: C.surfaceMid, border: 'none', color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit request
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main AuronWorkoutBuilder
// ─────────────────────────────────────────────
export default function AuronWorkoutBuilder({ userId, onClose, onPlanSaved }) {
  const [step,      setStep]      = useState(0)     // 0–8 = questions, 'generating', 'preview', 'error'
  const [answers,   setAnswers]   = useState({})
  const [plan,      setPlan]      = useState(null)
  const [error,     setError]     = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [medWarn,   setMedWarn]   = useState(false)

  const total = QUESTIONS.length

  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }))

  const goNext = async () => {
    const q = QUESTIONS[step]
    // Safety check on text fields
    if (q.type === 'text' && hasMedicalConcern(answers[q.id])) {
      setMedWarn(true)
    }
    if (step < total - 1) {
      setStep(s => s + 1)
    } else {
      await generate()
    }
  }

  const generate = async () => {
    setStep('generating')
    setError(null)
    try {
      const plan = await callAI(answers)
      setPlan(plan)
      setStep('preview')
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  const handleSave = async () => {
    if (!plan) return
    setSaving(true)
    // Convert AI plan to workout_plans format
    const exercises = plan.workouts?.flatMap(w =>
      (w.exercises || []).map(ex => {
        const name = typeof ex === 'string' ? ex : ex.name
        return {
          name,
          icon: getExercise(name).icon || '💪',
          muscles: getExercise(name).muscles || '',
          timed: getExercise(name).timed || false,
          sets: parseInt(ex.sets) || 3,
          reps: parseInt(ex.reps) || 10,
          notes: ex.notes || w.title || '',
        }
      })
    ) || []

    await supabase.from('workout_plans').insert({
      user_id: userId,
      name: plan.planName || 'Auron Plan',
      exercises,
      notes: `Generated by Coach Auron. Goal: ${answers.goal}. Level: ${answers.level}. ${answers.request || ''}`.trim(),
      schedule: null,
      created_at: new Date().toISOString(),
    })
    setSaving(false)
    onPlanSaved?.()
    onClose()
  }

  // ── Render ───────────────────────────────────
  if (step === 'generating') return <GeneratingScreen />

  if (step === 'error') return (
    <div style={{ position: 'fixed', inset: 0, background: C.pageBg || '#F0EFF8', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <AuronCharacter mood="concerned" size="compact" />
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 16, marginBottom: 8, textAlign: 'center' }}>Something went wrong</div>
      <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', marginBottom: 24 }}>{error}</div>
      <button onClick={generate} style={{ padding: '12px 28px', borderRadius: 16, background: C.purple, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>Try again</button>
      <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 16, background: 'none', border: 'none', color: C.textMuted, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
    </div>
  )

  if (step === 'preview') return (
    <PlanPreviewScreen
      plan={plan}
      answers={answers}
      saving={saving}
      onSave={handleSave}
      onRegenerate={generate}
      onEditRequest={() => setStep(total - 1)}
      onCancel={onClose}
    />
  )

  const q = QUESTIONS[step]
  return (
    <>
      {/* Medical warning banner */}
      {medWarn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400, background: C.amber, padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#7C4A00' }}>
          ⚠️ Please check with a healthcare professional before starting a new workout plan.
          <button onClick={() => setMedWarn(false)} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#7C4A00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>×</button>
        </div>
      )}
      <QuestionScreen
        q={q}
        value={answers[q.id]}
        onChange={val => setAnswer(q.id, val)}
        onNext={goNext}
        onBack={() => setStep(s => Math.max(0, s - 1))}
        idx={step}
        total={total}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// AI call — returns structured JSON plan
// ─────────────────────────────────────────────
async function callAI(answers) {
  const key = import.meta.env.VITE_GROQ_KEY
  if (!key) throw new Error('No AI key configured.')

  const prompt = `You are Coach Auron, an expert fitness coach. Generate a personalised workout plan as JSON only.

User profile:
- Goal: ${answers.goal}
- Location: ${answers.location}
- Equipment: ${answers.equipment}
- Days per week: ${answers.days}
- Session duration: ${answers.duration}
- Fitness level: ${answers.level}
- Focus areas: ${Array.isArray(answers.focus) ? answers.focus.join(', ') : answers.focus || 'full body'}
- Limitations: ${answers.limitations || 'none'}
- Special request: ${answers.request || 'none'}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "planName": "string",
  "goal": "string",
  "daysPerWeek": number,
  "sessionDuration": "string",
  "difficulty": "Beginner|Intermediate|Advanced",
  "weeklySchedule": [
    { "day": "Monday", "focus": "Push", "rest": false },
    { "day": "Tuesday", "focus": null, "rest": true }
  ],
  "workouts": [
    {
      "title": "string",
      "notes": "string",
      "warmup": "string",
      "cooldown": "string",
      "exercises": [
        { "name": "Exercise name", "sets": 3, "reps": "10-12", "rest": "60s", "notes": "" }
      ]
    }
  ]
}

Rules:
- Only include exercises appropriate for the equipment and location specified
- Match difficulty to fitness level
- Plan must fit in the specified session duration
- Do not give medical advice
- Keep exercise names simple and real (e.g. "Push Ups", "Dumbbell Curl")
- Generate exactly ${parseInt(answers.days) || 3} workout days`

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`AI request failed (${res.status})`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''

  // Parse JSON — strip any markdown fences
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end   = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('AI returned invalid format. Please try again.')

  return JSON.parse(clean.slice(start, end + 1))
}
