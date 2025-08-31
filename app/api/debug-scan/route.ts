import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug scan route called')
    
    // Test 1: Basic route functionality
    console.log('✅ Route is accessible')
    
    // Test 2: Session handling
    let session
    try {
      session = await getServerSession(authOptions)
      console.log('✅ Session handling works')
    } catch (sessionError) {
      console.error('❌ Session error:', sessionError)
      return NextResponse.json({ 
        error: 'Session handling failed',
        details: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
      }, { status: 500 })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', session.user.id)
    
    // Test 3: Request parsing
    let requestBody
    try {
      requestBody = await request.json()
      console.log('✅ Request parsing works:', requestBody)
    } catch (parseError) {
      console.error('❌ Request parsing failed:', parseError)
      return NextResponse.json({ 
        error: 'Request parsing failed',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 })
    }
    
    // Test 4: Environment variables
    const envCheck = {
      PERPLEXITY_API_KEY: !!process.env.PERPLEXITY_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
    }
    
    console.log('🔑 Environment variables check:', envCheck)
    
    // Test 5: Database connection (without complex queries)
    let dbConnection = false
    try {
      // Just test if we can import Prisma
      const { prisma } = await import('@/lib/prisma')
      console.log('✅ Prisma import works')
      
      // Test basic database connection
      await prisma.$queryRaw`SELECT 1`
      dbConnection = true
      console.log('✅ Database connection works')
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      dbConnection = false
    }
    
    // Test 6: AI scanning service import
    let aiServiceImport = false
    try {
      const { aiScanningService } = await import('@/lib/ai-scanning')
      aiServiceImport = true
      console.log('✅ AI scanning service import works')
    } catch (aiError) {
      console.error('❌ AI service import error:', aiError)
      aiServiceImport = false
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug scan route completed',
      timestamp: new Date().toISOString(),
      tests: {
        routeAccessible: true,
        sessionWorking: true,
        requestParsing: true,
        environmentVariables: envCheck,
        databaseConnection: dbConnection,
        aiServiceImport: aiServiceImport
      },
      requestBody,
      userId: session.user.id
    })
    
  } catch (error) {
    console.error('❌ Debug scan route error:', error)
    return NextResponse.json({ 
      error: 'Debug route failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Debug scan route is working',
    timestamp: new Date().toISOString(),
    method: 'GET'
  })
}
