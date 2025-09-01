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

    console.log('🔧 Creating scan_result table...')

    // Create scan_result table with correct schema
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "scan_result" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "brandTrackingId" TEXT NOT NULL,
        "keywordTrackingId" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "query" TEXT NOT NULL,
        "brandMentioned" BOOLEAN NOT NULL DEFAULT false,
        "position" INTEGER,
        "responseText" TEXT,
        "brandContext" TEXT,
        "sourceUrls" JSONB,
        "confidence" DOUBLE PRECISION,
        "scanDuration" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "scan_result_pkey" PRIMARY KEY ("id")
      );
    `)

    // Add foreign key constraints
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "scan_result" 
      ADD CONSTRAINT IF NOT EXISTS "scan_result_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "scan_result" 
      ADD CONSTRAINT IF NOT EXISTS "scan_result_brandTrackingId_fkey" 
      FOREIGN KEY ("brandTrackingId") REFERENCES "brand_tracking"("id") ON DELETE CASCADE;
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "scan_result" 
      ADD CONSTRAINT IF NOT EXISTS "scan_result_keywordTrackingId_fkey" 
      FOREIGN KEY ("keywordTrackingId") REFERENCES "keyword_tracking"("id") ON DELETE CASCADE;
    `)

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "scan_result_userId_brandTrackingId_idx" ON "scan_result"("userId", "brandTrackingId");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "scan_result_keywordTrackingId_platform_idx" ON "scan_result"("keywordTrackingId", "platform");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "scan_result_createdAt_idx" ON "scan_result"("createdAt");
    `)

    console.log('✅ scan_result table created successfully')

    return NextResponse.json({
      success: true,
      message: 'scan_result table created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Failed to create scan_result table:', error)
    return NextResponse.json({ 
      error: 'Failed to create scan_result table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
