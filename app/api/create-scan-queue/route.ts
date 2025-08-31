import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Creating scan_queue table if it doesn\'t exist...')

    // Try to push the schema to ensure all tables exist
    try {
      // This will create the scan_queue table based on our Prisma schema
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "scan_queue" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "brandTrackingId" TEXT NOT NULL,
          "keywordTrackingId" TEXT,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "priority" INTEGER NOT NULL DEFAULT 5,
          "scheduledAt" TIMESTAMP(3) NOT NULL,
          "startedAt" TIMESTAMP(3),
          "completedAt" TIMESTAMP(3),
          "attempts" INTEGER NOT NULL DEFAULT 0,
          "maxAttempts" INTEGER NOT NULL DEFAULT 3,
          "lastError" TEXT,
          "scanType" TEXT NOT NULL,
          "metadata" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "scan_queue_pkey" PRIMARY KEY ("id")
        );
      `)

      // Add indexes
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "scan_queue_status_scheduledAt_idx" ON "scan_queue"("status", "scheduledAt");
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "scan_queue_userId_idx" ON "scan_queue"("userId");
      `)

      // Add foreign key constraints
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "scan_queue" 
        ADD CONSTRAINT "scan_queue_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "scan_queue" 
        ADD CONSTRAINT "scan_queue_brandTrackingId_fkey" 
        FOREIGN KEY ("brandTrackingId") REFERENCES "brand_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "scan_queue" 
        ADD CONSTRAINT "scan_queue_keywordTrackingId_fkey" 
        FOREIGN KEY ("keywordTrackingId") REFERENCES "keyword_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)

      console.log('✅ scan_queue table created successfully')

      return NextResponse.json({
        success: true,
        message: 'scan_queue table created successfully',
        timestamp: new Date().toISOString()
      })

    } catch (createError) {
      console.log('⚠️ Table creation error (might already exist):', createError.message)
      
      return NextResponse.json({
        success: true,
        message: 'scan_queue table already exists or creation skipped',
        error: createError.message,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Create scan queue table error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create scan queue table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
