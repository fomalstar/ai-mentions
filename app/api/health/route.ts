import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 503 })
  }
}
