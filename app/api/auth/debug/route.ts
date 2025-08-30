import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check OAuth environment variables
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 
        `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'MISSING',
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GITHUB_ID: !!process.env.GITHUB_ID,
      GITHUB_SECRET: !!process.env.GITHUB_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    // Test user table access
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        userCount: userCount
      },
      environment: envCheck,
      timestamp: new Date().toISOString(),
      expectedCallbackUrls: [
        `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
      ]
    })
  } catch (error) {
    console.error('Debug check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
