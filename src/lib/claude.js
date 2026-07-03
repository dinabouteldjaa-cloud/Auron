// ─────────────────────────────────────────────────────────────
// Auron AI — Groq (Llama 3.3) integration
// All meal-related prompts are built through buildMealPrompt()
// so user preferences and language are always respected.
// ─────────────────────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const LANG_INSTRUCTION = {
  en: 'Always respond in English.',
  fr: 'Réponds toujours en français. Tous tes messages, suggestions et conseils doivent être en français.',
}

function getKey() {
  return import.meta.env.VITE_GROQ_KEY
}

// Core fetch — shared by all AI calls
async function callGroq(systemPrompt, userMessage, maxTokens = 1000) {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKey()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
      }),
    })
    const data = await res.json()
    if (data.error) return `Error: ${data.error.message}`
    return data.choices?.[0]?.message?.content || 'No response.'
  } catch (err) {
    return 'Error: ' + err.message
  }
}

// ─────────────────────────────────────────────────────────────
// buildMealPrompt — constructs the system prompt for ALL
// meal-related AI features, baking in preferences AND language.
// ─────────────────────────────────────────────────────────────
export function buildMealPrompt(preferences = {}, lang = 'en') {
  const {
    dietary_preferences = [],
    allergies           = [],
    food_restrictions   = [],
    avoided_foods       = [],
    health_notes        = '',
  } = preferences

  const lines = [
    'You are Coach Auron, a helpful AI wellness and nutrition assistant inside the Auron fitness app.',
    'You provide practical, personalized meal guidance based on the user\'s goals and preferences.',
    '',
    // Language instruction — FIRST so the model prioritises it
    LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en,
    '',
    '── IMPORTANT RULES ──────────────────────────────────────',
    'NEVER provide medical advice, diagnoses, or treatment recommendations.',
    'NEVER suggest changing, stopping, or starting medications.',
    'NEVER claim medical accuracy.',
    'If the user mentions a health condition or disease, provide only general wellness support',
    'and remind them to follow their healthcare provider\'s guidance.',
    '─────────────────────────────────────────────────────────',
  ]

  if (dietary_preferences.length > 0) {
    lines.push('')
    lines.push(`DIETARY PREFERENCES (always follow): ${dietary_preferences.join(', ')}`)
  }

  if (allergies.length > 0) {
    lines.push('')
    lines.push(`ALLERGIES — NEVER include these ingredients in any suggestion: ${allergies.join(', ')}`)
    lines.push('Allergy safety is non-negotiable.')
  }

  if (food_restrictions.length > 0) {
    lines.push('')
    lines.push(`FOOD RESTRICTIONS (always apply): ${food_restrictions.join(', ')}`)
  }

  if (avoided_foods.length > 0) {
    lines.push('')
    lines.push(`FOODS TO AVOID — never include these in any meal suggestion: ${avoided_foods.join(', ')}`)
  }

  if (health_notes.trim()) {
    lines.push('')
    lines.push('USER HEALTH CONTEXT (informational only — do not provide medical advice):')
    lines.push(health_notes.trim())
  }

  lines.push('')
  lines.push('Keep responses concise, practical, and encouraging.')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────
// Public AI functions — all accept lang parameter
// ─────────────────────────────────────────────────────────────

export async function askClaude(systemPrompt, userMessage) {
  return callGroq(systemPrompt, userMessage)
}

export async function askMealSuggestion(preferences, { totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF }, lang = 'en') {
  const system   = buildMealPrompt(preferences, lang)
  const calLeft  = calorieGoal - totalCal
  const protLeft = proteinGoal - totalP

  const user = `The user has eaten ${totalCal} kcal today (goal: ${calorieGoal} kcal, ${calLeft > 0 ? calLeft + ' remaining' : Math.abs(calLeft) + ' over'}).
Macros so far: ${Math.round(totalP)}g protein (${Math.round(protLeft)}g left), ${Math.round(totalC)}g carbs, ${Math.round(totalF)}g fat.
What should they eat next? Give 1 specific, practical suggestion in 2 sentences max. Name the food and approximate calories.`

  return callGroq(system, user, 200)
}

export async function estimateMealFromDescription(preferences, description, lang = 'en') {
  const system = buildMealPrompt(preferences, lang) + `

You are also a nutrition expert. When asked to estimate a meal, respond ONLY with valid JSON — no markdown, no explanation:
{"meal":"meal name","calories":number,"protein":number,"carbs":number,"fat":number,"items":[{"name":"item","calories":number}],"confidence":"high/medium/low","note":"one brief tip"}`

  const user = `Estimate the nutritional content of this meal: ${description}`
  return callGroq(system, user, 600)
}

export async function generateWorkoutPlan(goal, lang = 'en') {
  const system = `You are Coach Auron, an expert personal trainer inside the Auron fitness app.
${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en}
Create concise, practical workout plans. Plain text only — no markdown symbols, no asterisks.
Number each day clearly. Keep it under 250 words.`
  return callGroq(system, `Create a weekly workout plan for: ${goal}`, 800)
}

export async function generateFullPlan(preferences, { goal, days, equipment, diet }, lang = 'en') {
  const system = buildMealPrompt(preferences, lang) + `

You are also an expert fitness coach. Create a combined fitness and nutrition plan.
Plain text only — no markdown symbols, no asterisks. Max 300 words.`

  const user = `Goal: ${goal}. Training days: ${days}/week. Equipment: ${equipment}. Diet preference: ${diet || 'none'}.
Include a weekly workout schedule and basic nutrition guidelines.`
  return callGroq(system, user, 1000)
}

export async function generateWeeklyInsights(stats, lang = 'en') {
  const system = `You are Coach Auron, a fitness coach inside the Auron fitness app.
${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en}
Provide 3 specific, numbered insights based on the user's data. Plain text only. No markdown.
${buildMealPrompt({}, lang)}`
  return callGroq(system, `User this week: ${stats}`, 600)
}

export async function askClaudeWithImage() {
  return JSON.stringify({
    meal: 'Photo scanning unavailable',
    calories: 0, protein: 0, carbs: 0, fat: 0,
    items: [], confidence: 'low',
    note: 'Photo scanning requires a paid AI plan. Please use the Describe meal option instead.',
  })
}

