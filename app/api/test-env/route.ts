import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check environment variables
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
      `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 
      `${process.env.PERPLEXITY_API_KEY.substring(0, 10)}...` : 'NOT SET',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 
      `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
  }

  return NextResponse.json({
    success: true,
    environment: envVars,
    timestamp: new Date().toISOString()
  })
}
