// Test script for AI Scanning Service
// This will help us verify if the AI APIs are working correctly

const testAIScanning = async () => {
  console.log('🧪 Testing AI Scanning Service...\n')
  
  // Test 1: Check if environment variables are loaded
  console.log('1️⃣ Checking environment variables...')
  const requiredVars = ['OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY']
  
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (value && value.length > 10) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 10)}...`)
    } else {
      console.log(`   ❌ ${varName}: NOT SET or too short`)
    }
  }
  
  // Test 2: Test Perplexity API directly
  console.log('\n2️⃣ Testing Perplexity API...')
  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: 'What are the best search engines available today? Please provide a comprehensive list with brief descriptions.'
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    })
    
    if (perplexityResponse.ok) {
      const data = await perplexityResponse.json()
      const content = data.choices[0]?.message?.content
      console.log(`   ✅ Perplexity API working! Response length: ${content?.length || 0} characters`)
      console.log(`   📝 Sample: ${content?.substring(0, 100)}...`)
    } else {
      const errorText = await perplexityResponse.text()
      console.log(`   ❌ Perplexity API failed: ${perplexityResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Perplexity API error: ${error.message}`)
  }
  
  // Test 3: Test OpenAI API directly
  console.log('\n3️⃣ Testing OpenAI API...')
  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'What are the best search engines available today? Please provide a comprehensive list with brief descriptions.'
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })
    
    if (openaiResponse.ok) {
      const data = await openaiResponse.json()
      const content = data.choices[0]?.message?.content
      console.log(`   ✅ OpenAI API working! Response length: ${content?.length || 0} characters`)
      console.log(`   📝 Sample: ${content?.substring(0, 100)}...`)
    } else {
      const errorText = await openaiResponse.text()
      console.log(`   ❌ OpenAI API failed: ${openaiResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ OpenAI API error: ${error.message}`)
  }
  
  // Test 4: Test Gemini API directly
  console.log('\n4️⃣ Testing Gemini API...')
  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'What are the best search engines available today? Please provide a comprehensive list with brief descriptions.'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    })
    
    if (geminiResponse.ok) {
      const data = await geminiResponse.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log(`   ✅ Gemini API working! Response length: ${content?.length || 0} characters`)
      console.log(`   📝 Sample: ${content?.substring(0, 100)}...`)
    } else {
      const errorText = await geminiResponse.text()
      console.log(`   ❌ Gemini API failed: ${geminiResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Gemini API error: ${error.message}`)
  }
  
  // Test 5: Test our internal API routes
  console.log('\n5️⃣ Testing internal API routes...')
  try {
    // Test OpenAI route
    const openaiRouteResponse = await fetch('http://localhost:3000/api/openai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'What are the best search engines available today?',
        model: 'gpt-4',
        maxTokens: 500
      })
    })
    
    if (openaiRouteResponse.ok) {
      const data = await openaiRouteResponse.json()
      console.log(`   ✅ OpenAI route working! Response: ${data.response?.substring(0, 100)}...`)
    } else {
      const errorText = await openaiRouteResponse.text()
      console.log(`   ❌ OpenAI route failed: ${openaiRouteResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ OpenAI route error: ${error.message}`)
  }
  
  console.log('\n🎯 Test Summary:')
  console.log('If you see ❌ errors above, the AI scanning won\'t work properly.')
  console.log('Make sure your .env.local file contains the correct API keys.')
  console.log('The keys should be the same as in LOCAL_API_KEYS.md')
}

// Run the test
testAIScanning().catch(console.error)
