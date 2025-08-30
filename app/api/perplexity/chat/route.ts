import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, model = 'sonar-pro', maxTokens = 1000 } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if user has Perplexity API key configured
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: 'Perplexity API not configured' }, { status: 500 })
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const perplexityResponse = data.choices?.[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      success: true,
      response: perplexityResponse,
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      }
    })

  } catch (error) {
    console.error('Perplexity chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get response from Perplexity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
