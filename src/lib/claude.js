// ─────────────────────────────────────────────────────────────
// Auron AI — Groq (Llama 3.3) integration
// All meal-related prompts are built through buildMealPrompt()
// so user preferences are always respected.
// ─────────────────────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

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
// meal-related AI features, baking in the user's preferences.
//
// preferences shape (from user_preferences table):
//   dietary_preferences : string[]  e.g. ['Halal', 'Keto']
//   allergies           : string[]  e.g. ['Nuts', 'Dairy']
//   food_restrictions   : string[]  e.g. ['Low sodium']
//   avoided_foods       : string[]  e.g. ['Cheese', 'Onions']
//   health_notes        : string    (for context only, no medical advice)
// ─────────────────────────────────────────────────────────────
export function buildMealPrompt(preferences = {}) {
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
    '── IMPORTANT RULES ──────────────────────────────────────',
    'NEVER provide medical advice, diagnoses, or treatment recommendations.',
    'NEVER suggest changing, stopping, or starting medications.',
    'NEVER claim medical accuracy.',
    'If the user mentions a health condition or disease, provide only general wellness support',
    'and remind them to follow their healthcare provider\'s guidance.',
    'Always add this reminder when health conditions are mentioned:',
    '"Auron provides wellness support and informational guidance only.',
    'Always follow the advice of your healthcare professionals."',
    '─────────────────────────────────────────────────────────',
  ]

  if (dietary_preferences.length > 0) {
    lines.push('')
    lines.push(`DIETARY PREFERENCES (always follow): ${dietary_preferences.join(', ')}`)
  }

  if (allergies.length > 0) {
    lines.push('')
    lines.push(`ALLERGIES — NEVER include these ingredients in any suggestion: ${allergies.join(', ')}`)
    lines.push('Allergy safety is non-negotiable. If a suggested dish might contain any of these, do not suggest it.')
  }

  if (food_restrictions.length > 0) {
    lines.push('')
    lines.push(`FOOD RESTRICTIONS (always apply): ${food_restrictions.join(', ')}`)
  }

  if (avoided_foods.length > 0) {
    lines.push('')
    lines.push(`FOODS TO AVOID — never include these in any meal suggestion: ${avoided_foods.join(', ')}`)
    lines.push('Even as minor ingredients or toppings, do not include any food from this list.')
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
// Public AI functions
// ─────────────────────────────────────────────────────────────

// Generic call — for coach messages, streak tips, workout plans etc.
export async function askClaude(systemPrompt, userMessage) {
  return callGroq(systemPrompt, userMessage)
}

// Meal suggestion — uses preferences
export async function askMealSuggestion(preferences, { totalCal, calorieGoal, totalP, proteinGoal, totalC, totalF }) {
  const system = buildMealPrompt(preferences)
  const calLeft    = calorieGoal - totalCal
  const proteinLeft = proteinGoal - totalP

  const user = `The user has eaten ${totalCal} kcal today (goal: ${calorieGoal} kcal, ${calLeft > 0 ? calLeft + ' remaining' : Math.abs(calLeft) + ' over'}).
Macros so far: ${Math.round(totalP)}g protein (${Math.round(proteinLeft)}g left), ${Math.round(totalC)}g carbs, ${Math.round(totalF)}g fat.
What should they eat next? Give 1 specific, practical suggestion in 2 sentences max. Name the food and approximate calories.`

  return callGroq(system, user, 200)
}

// Meal description estimator — uses preferences
export async function estimateMealFromDescription(preferences, description) {
  const system = buildMealPrompt(preferences) + `

You are also a nutrition expert. When asked to estimate a meal, respond ONLY with valid JSON — no markdown, no explanation:
{"meal":"meal name","calories":number,"protein":number,"carbs":number,"fat":number,"items":[{"name":"item","calories":number}],"confidence":"high/medium/low","note":"one brief tip"}`

  const user = `Estimate the nutritional content of this meal: ${description}`
  return callGroq(system, user, 600)
}

// Workout plan — preferences not needed but uses same pattern
export async function generateWorkoutPlan(goal) {
  const system = `You are Coach Auron, an expert personal trainer inside the Auron fitness app.
Create concise, practical workout plans. Plain text only — no markdown symbols, no asterisks.
Number each day clearly. Keep it under 250 words.`
  return callGroq(system, `Create a weekly workout plan for: ${goal}`, 800)
}

// Fitness + nutrition plan
export async function generateFullPlan(preferences, { goal, days, equipment, diet }) {
  const system = buildMealPrompt(preferences) + `

You are also an expert fitness coach. Create a combined fitness and nutrition plan.
Plain text only — no markdown symbols, no asterisks. Max 300 words.`

  const user = `Goal: ${goal}. Training days: ${days}/week. Equipment: ${equipment}. Diet preference: ${diet || 'none'}.
Include a weekly workout schedule and basic nutrition guidelines.`
  return callGroq(system, user, 1000)
}

// Weekly insights
export async function generateWeeklyInsights(stats) {
  const system = `You are Coach Auron, a fitness coach inside the Auron fitness app.
Provide 3 specific, numbered insights based on the user's data. Plain text only. No markdown.
${buildMealPrompt()}`
  return callGroq(system, `User this week: ${stats}`, 600)
}

// Image scanning not supported on Groq free tier
export async function askClaudeWithImage() {
  return JSON.stringify({
    meal: 'Photo scanning unavailable',
    calories: 0, protein: 0, carbs: 0, fat: 0,
    items: [], confidence: 'low',
    note: 'Photo scanning requires a paid AI plan. Please use the Describe meal option instead.',
  })
}
