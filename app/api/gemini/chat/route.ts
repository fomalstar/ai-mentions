import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, model = 'gemini-pro', maxTokens = 1000 } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if user has Gemini API key configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      model,
      usage: {
        promptTokenCount: data.usageMetadata?.promptTokenCount,
        candidatesTokenCount: data.usageMetadata?.candidatesTokenCount,
        totalTokenCount: data.usageMetadata?.totalTokenCount
      }
    })

  } catch (error) {
    console.error('Gemini chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get response from Gemini',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
