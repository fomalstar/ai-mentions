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

    // Check if user is admin (you can modify this logic)
    if (session.user.email !== 'foma@example.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔄 Setting up enhanced mention tracking database...')

    // Try to create the missing tables by running Prisma commands
    try {
      const { execSync } = require('child_process')
      
      // Push the schema to create missing tables
      console.log('📦 Pushing schema to database...')
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      
      // Generate Prisma client
      console.log('🔧 Generating Prisma client...')
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      
      console.log('✅ Database setup completed successfully!')
      
      return NextResponse.json({
        success: true,
        message: 'Database setup completed successfully',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Database setup failed:', error)
      
      // Fallback: try to create tables manually via SQL
      try {
        console.log('🔄 Attempting manual table creation...')
        
        // Create scan_results table if it doesn't exist
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS scan_results (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            brand_tracking_id TEXT NOT NULL,
            keyword_tracking_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            query TEXT NOT NULL,
            brand_mentioned BOOLEAN DEFAULT false,
            position INTEGER,
            response_text TEXT,
            brand_context TEXT,
            source_urls JSONB,
            confidence DOUBLE PRECISION,
            scan_duration INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        
        // Create scan_queue table if it doesn't exist
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS scan_queue (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            brand_tracking_id TEXT NOT NULL,
            keyword_tracking_id TEXT,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 5,
            scheduled_at TIMESTAMP NOT NULL,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            last_error TEXT,
            scan_type TEXT NOT NULL,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        
        console.log('✅ Manual table creation completed!')
        
        return NextResponse.json({
          success: true,
          message: 'Database setup completed via manual table creation',
          timestamp: new Date().toISOString()
        })
        
      } catch (manualError) {
        console.error('❌ Manual table creation also failed:', manualError)
        
        return NextResponse.json({
          success: false,
          error: 'Database setup failed',
          details: {
            prismaError: error.message,
            manualError: manualError.message
          }
        }, { status: 500 })
      }
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
    const tables = ['scan_results', 'scan_queue']
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
