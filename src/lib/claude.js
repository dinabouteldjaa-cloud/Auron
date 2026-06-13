const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function getKey() {
  return import.meta.env.VITE_GROQ_KEY
}

export async function askClaude(systemPrompt, userMessage) {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getKey()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    })
    const data = await res.json()
    console.log('Groq response:', data)
    if (data.error) return `Error: ${data.error.message}`
    return data.choices?.[0]?.message?.content || 'No response.'
  } catch (err) {
    console.error('Groq error:', err)
    return 'Error: ' + err.message
  }
}

// Image scanning not supported on Groq free tier
// Returns a friendly message instead
export async function askClaudeWithImage(systemPrompt, base64, mediaType) {
  return JSON.stringify({
    meal: "Photo scanning unavailable",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    items: [],
    confidence: "low",
    note: "Photo scanning requires a paid AI plan. Please use the 'Describe meal' option instead — it works great and is completely free!"
  })
}
