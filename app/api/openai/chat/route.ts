import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, model = 'gpt-4', maxTokens = 1000 } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if user has OpenAI API key configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 })
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide accurate, helpful responses and when possible, include relevant source URLs.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      success: true,
      response,
      model,
      usage: completion.usage
    })

  } catch (error) {
    console.error('OpenAI chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get response from OpenAI',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
