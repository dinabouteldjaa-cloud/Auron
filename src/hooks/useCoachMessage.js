import { useState, useEffect, useRef } from 'react'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ─────────────────────────────────────────────────────────────
// Mood → expression rules
// Returns one of the AURON_IMAGES keys based on the full context
// ─────────────────────────────────────────────────────────────
export function getAuronMoodFromContext(ctx) {
  const { isToday, totalCal, calorieGoal, streakDays, workoutDone,
          proteinPct, waterPct, missedMeds, hour } = ctx

  if (!isToday)                          return 'mindset'
  if (missedMeds > 0)                    return 'concerned'
  if (totalCal > calorieGoal * 1.1)      return 'concerned'
  if (streakDays >= 7)                   return 'celebrating'
  if (workoutDone && totalCal > 0 && proteinPct >= 80 && waterPct >= 80) return 'happy'
  if (workoutDone && totalCal > 0)       return 'happy'
  if (workoutDone)                       return 'workout'
  if (streakDays >= 3 && streakDays < 7) return 'habit'
  if (streakDays >= 1)                   return 'motivating'
  if (totalCal === 0 && hour < 10)       return 'greeting'
  if (totalCal === 0 && hour >= 10)      return 'concerned'
  if (hour >= 20 && totalCal > 0)        return 'resting'
  if (waterPct < 50 && hour >= 14)       return 'concerned'
  if (proteinPct < 40 && hour >= 16)     return 'thinking'
  return 'happy'
}

// ─────────────────────────────────────────────────────────────
// Build the AI prompt with the full context snapshot
// ─────────────────────────────────────────────────────────────
function buildCoachPrompt(ctx, lang) {
  const {
    firstName, isToday, hour,
    totalCal, calorieGoal, calRemaining, calOver,
    totalP, proteinGoal, proteinShort,
    totalC, totalF,
    waterAmount, waterGoal, waterUnit, waterPct,
    workoutDone, workoutMinutes,
    streakDays,
    missedMeds, nextMedName,
    mood,
  } = ctx

  const langInstruction = lang === 'fr'
    ? 'Tu dois OBLIGATOIREMENT répondre en français. Chaque mot doit être en français.'
    : 'Respond only in English.'

  const system = `You are Coach Auron, a friendly and motivating AI health companion inside the Auron fitness app.
${langInstruction}

Write EXACTLY 1-2 sentences. Be specific — use the actual numbers provided. Use the user's name naturally.
Current expression/mood: ${mood} — match your tone to it:
- greeting: warm and energetic morning welcome
- happy: celebratory and proud
- motivating: encouraging push to keep going  
- celebrating: very excited, milestone energy
- concerned: caring but urgent nudge
- workout: pumped up, fitness focused
- habit: steady encouragement, building momentum
- resting: calm evening wind-down
- thinking: thoughtful, analytical
- mindset: reflective, perspective-giving

NEVER give medical advice. NEVER mention medications by name if missed — just say "medication" generally.
Vary your phrasing every time — never repeat the same sentence structure.
Be conversational, warm, and specific to the data.`

  const lines = [`User: ${firstName || 'the user'}`]
  lines.push(`Time: ${hour}:00, Today: ${isToday}`)

  if (isToday) {
    lines.push(`Calories: ${totalCal} eaten / ${calorieGoal} goal (${calRemaining > 0 ? calRemaining + ' remaining' : calOver + ' over'})`)
    lines.push(`Protein: ${Math.round(totalP)}g / ${proteinGoal}g (${Math.round(totalP/proteinGoal*100)}% of goal, ${Math.round(proteinShort)}g short)`)
    lines.push(`Carbs: ${Math.round(totalC)}g, Fat: ${Math.round(totalF)}g`)
    lines.push(`Water: ${waterAmount} / ${waterGoal} ${waterUnit} (${Math.round(waterPct)}% of goal)`)
    lines.push(`Workout: ${workoutDone ? `done (${workoutMinutes} min)` : 'not done today'}`)
    lines.push(`Streak: ${streakDays} days`)
    if (missedMeds > 0) lines.push(`Missed medications today: ${missedMeds}`)
    if (nextMedName)    lines.push(`Next medication: ${nextMedName}`)
  } else {
    lines.push('User is viewing a past day.')
    lines.push(`Streak: ${streakDays} days`)
  }

  lines.push(`\nWrite a short, specific, personalized coach message for this user right now.`)

  return { system, user: lines.join('\n') }
}

// Cache key — changes when significant state changes
function buildCacheKey(ctx) {
  const { firstName, totalCal, totalP, waterAmount, workoutDone, missedMeds, streakDays, isToday } = ctx
  const today = new Date().toISOString().split('T')[0]
  // Quantize to reduce unnecessary refetches (every 200 kcal, every 20g protein, etc.)
  const calBucket   = Math.floor(totalCal / 200)
  const protBucket  = Math.floor(totalP / 20)
  const waterBucket = Math.floor(waterAmount)
  return `${today}_${firstName}_${calBucket}_${protBucket}_${waterBucket}_${workoutDone}_${missedMeds}_${streakDays}_${isToday}`
}

// ─────────────────────────────────────────────────────────────
// useCoachMessage hook
// ─────────────────────────────────────────────────────────────
export function useCoachMessage(ctx, lang, groqKey) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const cacheRef    = useRef({}) // in-memory cache: cacheKey → message
  const lastKeyRef  = useRef('')

  useEffect(() => {
    if (!ctx || !ctx.isToday === undefined) return
    if (!groqKey) {
      // No API key — fall back to static message
      setMessage(getFallbackMessage(ctx, lang))
      return
    }

    const key = buildCacheKey(ctx)

    // Same state — don't refetch
    if (key === lastKeyRef.current && message) return

    // In-memory cache hit
    if (cacheRef.current[key]) {
      setMessage(cacheRef.current[key])
      lastKeyRef.current = key
      return
    }

    // Fetch new message
    let cancelled = false
    setLoading(true)

    const { system, user } = buildCoachPrompt(ctx, lang)

    fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 80,
        temperature: 0.85, // higher temp = more variety
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const msg = data.choices?.[0]?.message?.content?.trim()
        if (msg) {
          cacheRef.current[key] = msg
          lastKeyRef.current    = key
          setMessage(msg)
        } else {
          setMessage(getFallbackMessage(ctx, lang))
        }
      })
      .catch(() => {
        if (!cancelled) setMessage(getFallbackMessage(ctx, lang))
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [buildCacheKey(ctx), lang]) // re-run when state bucket changes or language changes

  return { message, loading }
}

// ─────────────────────────────────────────────────────────────
// Fallback messages (when API unavailable)
// Varied by mood to avoid repetition
// ─────────────────────────────────────────────────────────────
function getFallbackMessage(ctx, lang) {
  const { firstName: name, mood, totalCal, calorieGoal, streakDays,
          totalP, proteinGoal, waterPct, workoutDone, missedMeds } = ctx
  const hey = name ? `${name}, ` : ''
  const fr  = lang === 'fr'

  const messages = {
    greeting: fr
      ? [`Bonjour ${name || ''} ! Prêt(e) pour une belle journée ? Commencez par enregistrer votre petit-déjeuner.`]
      : [`Good morning ${name || ''}! Ready to make today count? Start by logging breakfast.`],
    happy: fr
      ? [`${hey}super journée — séance faite et repas suivis. Continuez comme ça !`]
      : [`${hey}great day — workout done and meals tracked. Keep this energy going!`],
    celebrating: fr
      ? [`${streakDays} jours d'affilée ${name ? ', ' + name : ''} ! C'est une vraie habitude maintenant.`]
      : [`${streakDays} days straight${name ? ', ' + name : ''}! You're building a real habit now.`],
    concerned: fr
      ? [missedMeds > 0 ? `${hey}n'oubliez pas votre médicament aujourd'hui.` : `${hey}il reste du travail aujourd'hui — chaque petit pas compte.`]
      : [missedMeds > 0 ? `${hey}don't forget your medication today.` : `${hey}there's still time to turn today around — every step counts.`],
    workout: fr
      ? [`Séance enregistrée${name ? ', ' + name : ''} ! Maintenant rechargez les batteries avec un bon repas.`]
      : [`Workout logged${name ? ', ' + name : ''}! Now refuel with a solid meal to recover well.`],
    habit: fr
      ? [`${streakDays} jours consécutifs${name ? ', ' + name : ''} — vous êtes dans le rythme maintenant.`]
      : [`${streakDays} days in a row${name ? ', ' + name : ''} — you're finding your rhythm now.`],
    motivating: fr
      ? [`${hey}chaque jour compte. Enregistrez un repas et gardez la série vivante.`]
      : [`${hey}every day counts. Log a meal and keep the streak alive.`],
    resting: fr
      ? [`Belle journée${name ? ', ' + name : ''}. Reposez-vous bien ce soir.`]
      : [`Nice work today${name ? ', ' + name : ''}. Rest up tonight and come back strong tomorrow.`],
    thinking: fr
      ? [`${hey}pensez à vos protéines — il en reste encore ${Math.round(proteinGoal - totalP)}g à atteindre.`]
      : [`${hey}think about protein — you still have ${Math.round(proteinGoal - totalP)}g to go today.`],
    mindset: fr
      ? [`${hey}regarder en arrière aide à avancer. Continuez aujourd'hui.`]
      : [`${hey}looking back helps you move forward. Apply those lessons today.`],
  }

  const pool = messages[mood] || messages.happy
  return pool[Math.floor(Math.random() * pool.length)]
}
