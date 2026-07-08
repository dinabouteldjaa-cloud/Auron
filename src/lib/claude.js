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
async function callGroq(systemPrompt, userMessage, maxTokens = 1000, temperature = 0.7) {
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
        temperature,
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
    cuisine_preference   = '',
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

  if (cuisine_preference && cuisine_preference.trim()) {
    lines.push('')
    lines.push(`CUISINE PREFERENCE: The user prefers ${cuisine_preference.trim()} cuisine. Prioritise meal suggestions inspired by ${cuisine_preference.trim()} dishes and ingredients whenever it's practical and fits their calorie/macro targets. It's fine to occasionally suggest other cuisines for variety, but ${cuisine_preference.trim()}-style options should come first.`)
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

export async function askMealSuggestion(preferences, { totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF }, lang = 'en', options = {}) {
  const { customRequest = '', avoidDish = '' } = options
  const system   = buildMealPrompt(preferences, lang)
  const calLeft  = calorieGoal - totalCal
  const protLeft = proteinGoal - totalP

  let user = `The user has eaten ${totalCal} kcal today (goal: ${calorieGoal} kcal, ${calLeft > 0 ? calLeft + ' remaining' : Math.abs(calLeft) + ' over'}).
Macros so far: ${Math.round(totalP)}g protein (${Math.round(protLeft)}g left), ${Math.round(totalC)}g carbs, ${Math.round(totalF)}g fat.
What should they eat next? Give 1 specific, practical suggestion in 2 sentences max. Name the food and approximate calories.
Vary your suggestions — favour different proteins, cuisines, and preparations across requests rather than always defaulting to the same dish.`

  if (avoidDish) {
    user += `\n\nThe user was already suggested this and wants something different this time — do NOT suggest the same dish or a close variant of it: "${avoidDish}"`
  }
  if (customRequest && customRequest.trim()) {
    user += `\n\nThe user added this note — take it into account when choosing the suggestion: "${customRequest.trim()}"`
  }

  // Slightly higher temperature here specifically so repeated taps give real variety
  return callGroq(system, user, 200, 0.95)
}

export async function estimateMealFromDescription(preferences, description, lang = 'en', options = {}) {
  const { answers = null } = options
  const clarifying = !!answers

  const system = buildMealPrompt(preferences, lang) + `

You are also a careful nutrition estimator. A user will describe a meal they ate and you must estimate its nutrition.

STEP 1 — Decide if the description is clear enough to estimate confidently.
A description is CLEAR ENOUGH if it includes (even roughly): what the food is, and either a portion size, a common reference (e.g. "a bowl", "a plate", "one sandwich"), or enough detail that a reasonable assumption can be made.
A description is TOO VAGUE if it's just a dish name with no sense of portion, ingredients, or preparation at all (e.g. "pasta", "a sandwich", "some chicken and rice") AND the user hasn't already answered clarifying questions.

STEP 2 — If TOO VAGUE and no clarifying answers have been given yet, do NOT estimate. Instead ask 1–3 short follow-up questions, focused only on: portion size, cooking method, sauces/oils used, and main ingredients. Pick only the questions that are actually missing — don't ask about something already stated.

STEP 3 — If clear enough (or the user has already answered clarifying questions), produce the estimate:
- Use conservative (moderate, not generous) portion assumptions whenever exact quantity is still unknown.
- If portion size is still uncertain even after any answers, prefer a calorie RANGE over a single confident number — populate calorieRangeLow and calorieRangeHigh, and set "calories" to the midpoint of that range.
- If portion size is well known, set calorieRangeLow and calorieRangeHigh equal to "calories" (no artificial range).
- Briefly state your portion assumption in "assumptions" so the user knows what was assumed.
- Keep using the existing confidence field ("high"/"medium"/"low") based on how much was actually known vs assumed.

Respond ONLY with valid JSON — no markdown, no explanation. Use exactly one of these two shapes:

If asking clarifying questions:
{"needsClarification":true,"questions":["short question 1","short question 2"]}

If giving a final estimate:
{"needsClarification":false,"meal":"meal name","calories":number,"calorieRangeLow":number,"calorieRangeHigh":number,"protein":number,"carbs":number,"fat":number,"items":[{"name":"item","calories":number}],"confidence":"high/medium/low","assumptions":"one short sentence describing exactly what portion/ingredients were assumed, with no suggestions or recommendations"}

Important: only estimate the meal as described. Do not suggest additions, substitutions, spices, or any changes to the meal — your job is to estimate what was eaten, not to recommend anything.`

  let user = `Meal description: ${description}`
  if (clarifying) {
    const qa = Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a || '(not specified)'}`).join('\n')
    user += `\n\nThe user already answered these clarifying questions — use them and give a FINAL ESTIMATE now, do not ask further questions:\n${qa}`
  }

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
