import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow any authenticated user to run database setup
    console.log('🔐 User authorized for database setup:', session.user.email)

    console.log('🔄 Setting up enhanced mention tracking database...')

    // SAFE: Only create missing tables without destroying existing data
    try {
      console.log('🔄 Checking and creating missing tables safely...')
      
      // Check which tables exist and create only missing ones
      const existingTables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('scan_result', 'scan_queue')
      `
      
      const existingTableNames = existingTables.map((t: any) => t.table_name)
      console.log('📊 Existing tables:', existingTableNames)
      
      // Create scan_result table if it doesn't exist
      if (!existingTableNames.includes('scan_result')) {
        console.log('🔧 Creating scan_result table...')
        await prisma.$executeRaw`
          CREATE TABLE scan_result (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "brandTrackingId" TEXT NOT NULL,
            "keywordTrackingId" TEXT NOT NULL,
            platform TEXT NOT NULL,
            query TEXT NOT NULL,
            "brandMentioned" BOOLEAN DEFAULT false,
            position INTEGER,
            "responseText" TEXT,
            "brandContext" TEXT,
            "sourceUrls" JSONB,
            confidence DOUBLE PRECISION,
            "scanDuration" INTEGER,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        console.log('✅ scan_result table created')
      } else {
        console.log('✅ scan_result table already exists')
      }
      
      // Create scan_queue table if it doesn't exist
      if (!existingTableNames.includes('scan_queue')) {
        console.log('🔧 Creating scan_queue table...')
        await prisma.$executeRaw`
          CREATE TABLE scan_queue (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "brandTrackingId" TEXT NOT NULL,
            "keywordTrackingId" TEXT,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 5,
            "scheduledAt" TIMESTAMP NOT NULL,
            "startedAt" TIMESTAMP,
            "completedAt" TIMESTAMP,
            attempts INTEGER DEFAULT 0,
            "maxAttempts" INTEGER DEFAULT 3,
            "lastError" TEXT,
            "scanType" TEXT NOT NULL,
            metadata JSONB,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        console.log('✅ scan_queue table created')
      } else {
        console.log('✅ scan_queue table already exists')
      }
      
      console.log('✅ Database setup completed safely without data loss!')
      
      return NextResponse.json({
        success: true,
        message: 'Database setup completed safely without data loss',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Safe database setup failed:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Database setup API error:', error)
    return NextResponse.json({ 
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check database connectivity and table status
    const tables = ['scan_result', 'scan_queue']
    const tableStatus: Record<string, boolean> = {}
    
    for (const table of tables) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM ${table} LIMIT 1`
        tableStatus[table] = true
      } catch (error) {
        tableStatus[table] = false
      }
    }
    
    return NextResponse.json({
      success: true,
      databaseStatus: 'connected',
      tables: tableStatus,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
