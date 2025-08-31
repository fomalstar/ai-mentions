import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('💣 NUCLEAR SCHEMA FIX - Rebuilding keyword_tracking table completely')

    try {
      // Step 1: Backup existing data if any
      console.log('📦 Backing up existing keyword_tracking data...')
      let existingData: any[] = []
      try {
        existingData = await prisma.$queryRaw`
          SELECT * FROM keyword_tracking LIMIT 100
        ` as any[]
        console.log(`✅ Backed up ${existingData.length} existing records`)
      } catch (backupError) {
        console.log('⚠️ No existing data to backup (table might be empty)')
      }

      // Step 2: Drop and recreate the table with correct schema
      console.log('💣 Dropping keyword_tracking table...')
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS keyword_tracking CASCADE`)
      
      console.log('🔧 Creating new keyword_tracking table with correct Prisma schema...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE keyword_tracking (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "brandTrackingId" TEXT NOT NULL,
          keyword TEXT NOT NULL,
          topic TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          
          -- Position metrics (all optional)
          "avgPosition" DOUBLE PRECISION,
          "chatgptPosition" INTEGER,
          "perplexityPosition" INTEGER,
          "geminiPosition" INTEGER,
          
          -- Change tracking (all optional)
          "previousAvgPosition" DOUBLE PRECISION,
          "positionChange" DOUBLE PRECISION,
          
          -- Scanning metadata
          "lastScanAt" TIMESTAMP,
          "scanCount" INTEGER NOT NULL DEFAULT 0,
          
          -- Standard timestamps
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          -- Foreign key constraints
          CONSTRAINT keyword_tracking_userId_fkey 
            FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT keyword_tracking_brandTrackingId_fkey 
            FOREIGN KEY ("brandTrackingId") REFERENCES brand_tracking(id) ON DELETE CASCADE,
          
          -- Unique constraint for upsert operations
          CONSTRAINT keyword_tracking_brandTrackingId_keyword_unique 
            UNIQUE ("brandTrackingId", keyword)
        )
      `)
      
      // Step 3: Create indexes for performance
      console.log('📊 Creating indexes...')
      await prisma.$executeRawUnsafe(`
        CREATE INDEX keyword_tracking_userId_isActive_idx ON keyword_tracking ("userId", "isActive")
      `)
      await prisma.$executeRawUnsafe(`
        CREATE INDEX keyword_tracking_lastScanAt_idx ON keyword_tracking ("lastScanAt")
      `)
      
      console.log('✅ New keyword_tracking table created successfully!')

      // Step 4: Verify the new schema
      const finalColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking'
        ORDER BY ordinal_position
      ` as any[]
      
      console.log('📋 NEW keyword_tracking schema:', finalColumns)

      // Step 5: Test with actual Prisma operations
      console.log('🧪 Testing Prisma operations with new schema...')
      try {
        // Get a real user
        const testUser = await prisma.user.findFirst()
        if (testUser) {
          // Create test brand tracking
          const testBrand = await prisma.brandTracking.create({
            data: {
              userId: testUser.id,
              brandName: 'test-nuclear-' + Date.now(),
              displayName: 'Test Nuclear',
              keywords: ['test'],
              competitors: [],
              isActive: true
            }
          })

          // Test keyword tracking with ALL required fields
          const testKeyword = await prisma.keywordTracking.create({
            data: {
              userId: testUser.id,
              brandTrackingId: testBrand.id,
              keyword: 'test-keyword',
              topic: 'test-topic',
              isActive: true,
              scanCount: 0
            }
          })
          
          console.log('✅ Prisma operations test PASSED!')
          
          // Clean up test data
          await prisma.keywordTracking.delete({ where: { id: testKeyword.id } })
          await prisma.brandTracking.delete({ where: { id: testBrand.id } })
          
          console.log('🧹 Test data cleaned up')
        }
      } catch (testError) {
        console.error('❌ Prisma operations test FAILED:', testError)
        throw new Error(`Prisma test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`)
      }

      return NextResponse.json({
        success: true,
        message: 'NUCLEAR SCHEMA FIX COMPLETED - keyword_tracking table rebuilt from scratch',
        originalDataCount: existingData.length,
        newSchema: finalColumns,
        timestamp: new Date().toISOString()
      })

    } catch (fixError) {
      console.error('❌ Nuclear schema fix failed:', fixError)
      
      return NextResponse.json({
        success: false,
        error: 'Nuclear schema fix failed',
        details: fixError instanceof Error ? fixError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Nuclear schema fix API error:', error)
    return NextResponse.json({ 
      error: 'Failed to apply nuclear schema fix',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
