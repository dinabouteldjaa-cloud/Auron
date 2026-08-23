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
async function callGroq(systemPrompt, userMessage, maxTokens = 1000, temperature = 0.7, jsonMode = false) {
  try {
    const body = {
      model: 'openai/gpt-oss-120b',
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    }
    // gpt-oss-120b is a reasoning model — without this, it can mix internal
    // "thinking" tokens into (or in place of) the JSON we asked for.
    if (jsonMode) {
      body.response_format = { type: 'json_object' }
      body.reasoning_effort = 'low'
    }
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKey()}`,
      },
      body: JSON.stringify(body),
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
    const cuisines = cuisine_preference.split(',').map(c => c.trim()).filter(Boolean)
    lines.push('')
    if (cuisines.length > 1) {
      lines.push(`CUISINE PREFERENCE: The user enjoys these cuisines: ${cuisines.join(', ')}. Rotate between them across suggestions — do not default to the same one every time. Pick whichever of these fits best for this specific meal/macro target, and vary the dish and cuisine choice from anything you may have suggested recently.`)
    } else {
      lines.push(`CUISINE PREFERENCE: The user prefers ${cuisines[0]} cuisine. Prioritise meal suggestions inspired by ${cuisines[0]} dishes and ingredients whenever it's practical and fits their calorie/macro targets. Still vary the specific dish suggested each time rather than repeating the same one — it's fine to occasionally suggest other cuisines for variety, but ${cuisines[0]}-style options should come first.`)
    }
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
  const { customRequest = '', avoidDish = '', modification = '', previousMeal = null } = options

  const system = buildMealPrompt(preferences, lang) + `

You are also Coach Auron, giving ONE practical, nutrition-aware meal suggestion the user can realistically prepare and adapt.

Respond ONLY with valid JSON, no markdown, no explanation, in exactly this shape:
{"meal":"meal name","calories":number,"protein":number,"carbs":number,"fat":number,"whyItFits":"one short sentence explaining why this fits the user's remaining calories/macros today","ingredients":["short item 1","short item 2"],"steps":["short step 1","short step 2"]}

Rules:
- Base the suggestion on the user's ACTUAL remaining calories and macros for today, not a generic "healthy meal."
- If one specific gap matters most right now (e.g. remaining protein is low, or fat is already close to the daily limit), mention it briefly in whyItFits. Otherwise keep whyItFits short and still tied to today's numbers — avoid generic nutrition claims that aren't specific to this user's day.
- Respect all dietary preferences, restrictions, allergies, avoided foods, and cuisine preference already provided.
- The "meal" name must be the dish name only — never prefix it with the cuisine/region (e.g. write "Chicken Shawarma", not "Middle Eastern Chicken Shawarma"; "Beef Burger", not "American Beef Burger"). The cuisine should be reflected in the ingredients and preparation, not spelled out in the title.
- ingredients: max 6 short items. steps: max 4 short, practical steps. No long recipe essays — this must be mobile-friendly and quick to read.
- Keep the meal realistic and easy to prepare at home.`

  const calLeft  = calorieGoal - totalCal
  const protLeft = proteinGoal - totalP

  let user = `Today's nutrition so far:
- Calories: ${totalCal} eaten, ${calorieGoal} goal (${calLeft > 0 ? calLeft + ' kcal remaining' : Math.abs(calLeft) + ' kcal over'})
- Protein: ${Math.round(totalP)}g eaten, ${proteinGoal}g goal (${Math.round(protLeft)}g remaining)
- Carbs so far: ${Math.round(totalC)}g
- Fat so far: ${Math.round(totalF)}g

Suggest ONE realistic meal that fits what's remaining today.`

  if (modification && previousMeal) {
    user += `\n\nThe user wants to MODIFY this previously suggested meal — this is not a request for a different meal, it's an adjustment to this one:
${JSON.stringify(previousMeal)}

Modification request: "${modification.trim()}"

Keep the same nutrition context above. Adapt the meal to satisfy the modification request, recalculate calories/protein/carbs/fat for the modified version, and briefly explain why the modified version still fits today.`
  } else if (avoidDish) {
    user += `\n\nThe user already got this suggestion and wants a genuinely different meal this time — do not suggest the same dish or a close variant: "${avoidDish}"`
    if (customRequest && customRequest.trim()) {
      user += `\n\nAdditional note from the user: "${customRequest.trim()}"`
    }
  } else if (customRequest && customRequest.trim()) {
    user += `\n\nAdditional note from the user: "${customRequest.trim()}"`
  }

  // Slightly higher temperature here specifically so repeated taps give real variety
  return callGroq(system, user, 900, 0.9, true)
}

export async function estimateMealFromDescription(preferences, description, lang = 'en', options = {}) {
  const { answers = null } = options
  const clarifying = !!answers

  const base = buildMealPrompt(preferences, lang) + `

You are also a careful nutrition estimator. A user will describe a meal they ate and you must estimate its nutrition.`

  const system = clarifying
    ? base + `

The user already had a chance to answer clarifying questions (some may still be "(not specified)" if they chose to skip). You must now produce a FINAL ESTIMATE — asking another question is not an option anymore, even if some details are still unknown.

- Use conservative (moderate, not generous) portion assumptions for anything still unknown.
- If portion size is still uncertain, prefer a calorie RANGE over a single confident number — populate calorieRangeLow and calorieRangeHigh, and set "calories" to the midpoint of that range. Use a wider range the less is known.
- If portion size is well known, set calorieRangeLow and calorieRangeHigh equal to "calories" (no artificial range).
- Briefly state your assumptions in "assumptions" so the user knows what was assumed.
- Set "confidence" to "low" if very little was actually known — that's fine, just still give numbers.

Respond ONLY with valid JSON — no markdown, no explanation. Use exactly this shape (this is the ONLY valid shape now):
{"needsClarification":false,"meal":"meal name","calories":number,"calorieRangeLow":number,"calorieRangeHigh":number,"protein":number,"carbs":number,"fat":number,"items":[{"name":"item","calories":number}],"confidence":"high/medium/low","assumptions":"one short sentence describing exactly what portion/ingredients were assumed, with no suggestions or recommendations"}

Important: only estimate the meal as described. Do not suggest additions, substitutions, spices, or any changes to the meal — your job is to estimate what was eaten, not to recommend anything.`
    : base + `

STEP 1 — Decide if the description is clear enough to estimate confidently.
A description is CLEAR ENOUGH if it includes (even roughly): what the food is, and either a portion size, a common reference (e.g. "a bowl", "a plate", "one sandwich"), or enough detail that a reasonable assumption can be made.
A description is TOO VAGUE if it's just a dish name with no sense of portion, ingredients, or preparation at all (e.g. "pasta", "a sandwich", "some chicken and rice").

STEP 2 — If TOO VAGUE, do NOT estimate. Instead ask 1–3 short follow-up questions, focused only on: portion size, cooking method, sauces/oils used, and main ingredients. Pick only the questions that are actually missing — don't ask about something already stated.

STEP 3 — If clear enough, produce the estimate:
- Use conservative (moderate, not generous) portion assumptions whenever exact quantity is still unknown.
- If portion size is still uncertain, prefer a calorie RANGE over a single confident number — populate calorieRangeLow and calorieRangeHigh, and set "calories" to the midpoint of that range.
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

  return callGroq(system, user, 900, 0.7, true)
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
