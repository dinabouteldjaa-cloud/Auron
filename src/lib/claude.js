export async function askClaude(systemPrompt, userMessage) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: systemPrompt + '\n\n' + userMessage
          }
        ],
      }),
    })
    const data = await res.json()
    console.log('Claude response:', data)
    return data.content?.[0]?.text || 'No response.'
  } catch (err) {
    console.error('Claude error:', err)
    return 'Error: ' + err.message
  }
}

export async function askClaudeWithImage(systemPrompt, base64, mediaType) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: systemPrompt + '\n\nEstimate the nutritional content of this meal photo.' },
          ],
        }],
      }),
    })
    const data = await res.json()
    console.log('Claude image response:', data)
    return data.content?.[0]?.text || ''
  } catch (err) {
    console.error('Claude image error:', err)
    return ''
  }
}
