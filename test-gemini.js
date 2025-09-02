// Test Gemini AI API directly
const testGemini = async () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here'
  
  if (GEMINI_API_KEY === 'your-api-key-here') {
    console.log('❌ Please set GEMINI_API_KEY environment variable')
    return
  }

  console.log('🧪 Testing Gemini AI API directly...')
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 10)}...`)

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        contents: [
          {
            parts: [
              {
                text: `Research and analyze the topic "search engines". Provide a comprehensive, factual response with current information, trends, and insights. Focus on the topic itself, not any specific company or brand.`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7
        }
      })
    })

    console.log(`📡 Response status: ${response.status}`)
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Gemini API error: ${response.status}`)
      console.error(`❌ Error details: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log('✅ Gemini API response received!')
    console.log('📊 Response structure:', JSON.stringify(data, null, 2))
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('\n📝 Response text:')
    console.log('='.repeat(50))
    console.log(responseText)
    console.log('='.repeat(50))
    console.log(`📏 Text length: ${responseText.length} characters`)
    
    // Check for brand mentions
    const brandName = 'Yandex'
    const hasBrandMention = responseText.toLowerCase().includes(brandName.toLowerCase())
    console.log(`🔍 Brand "${brandName}" mentioned: ${hasBrandMention ? 'YES' : 'NO'}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testGemini()
