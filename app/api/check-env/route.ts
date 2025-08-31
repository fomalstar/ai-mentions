import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      // Database
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      
      // AI API Keys
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
      
      // NextAuth
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
      
      // OAuth (if using)
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      
      // Stripe (if using)
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
      
      // Other
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      RENDER: process.env.RENDER || 'Not set'
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      timestamp: new Date().toISOString(),
      environment: envVars,
      totalSet: Object.values(envVars).filter(v => v === '✅ Set').length,
      totalMissing: Object.values(envVars).filter(v => v === '❌ Missing').length
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
