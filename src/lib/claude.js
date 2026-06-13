const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

function getKey() {
  return import.meta.env.VITE_GEMINI_KEY
}

export async function askClaude(systemPrompt, userMessage) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${getKey()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      }),
    })
    const data = await res.json()
    console.log('Gemini response:', data)
    if (data.error) return `Error: ${data.error.message}`
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.'
  } catch (err) {
    console.error('Gemini error:', err)
    return 'Error: ' + err.message
  }
}

export async function askClaudeWithImage(systemPrompt, base64, mediaType) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${getKey()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mediaType,
                  data: base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.4,
        }
      }),
    })
    const data = await res.json()
    console.log('Gemini image response:', data)
    if (data.error) return ''
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (err) {
    console.error('Gemini image error:', err)
    return ''
  }
}
