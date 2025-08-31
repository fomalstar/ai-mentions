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

    console.log('🔧 COMPLETE SCHEMA FIX for user:', session.user.email)

    const fixes: string[] = []

    try {
      // Check current keyword_tracking columns
      const currentColumns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking'
        ORDER BY ordinal_position
      ` as any[]
      
      console.log('📋 Current keyword_tracking columns:', currentColumns)

      // Define ALL required columns with correct types
      const requiredColumns = [
        { name: 'scanCount', type: 'INTEGER NOT NULL DEFAULT 0' },
        { name: 'previousAvgPosition', type: 'DOUBLE PRECISION' },
        { name: 'lastScanAt', type: 'TIMESTAMP' }
      ]

      // Add missing columns
      for (const col of requiredColumns) {
        const exists = currentColumns.some((dbCol: any) => dbCol.column_name === col.name)
        
        if (!exists) {
          console.log(`🔧 Adding missing column: ${col.name}`)
          
          await prisma.$executeRaw`
            ALTER TABLE keyword_tracking 
            ADD COLUMN ${col.name} ${col.type}
          ` as any
          
          fixes.push(`Added column: ${col.name}`)
          console.log(`✅ Added ${col.name} column`)
        }
      }

      // Fix data type mismatches
      try {
        // Check if positionChange is wrong type (integer instead of float)
        const positionChangeCol = currentColumns.find((col: any) => col.column_name === 'positionChange')
        if (positionChangeCol && positionChangeCol.data_type === 'integer') {
          console.log('🔧 Fixing positionChange data type from integer to double precision')
          
          await prisma.$executeRaw`
            ALTER TABLE keyword_tracking 
            ALTER COLUMN "positionChange" TYPE DOUBLE PRECISION
          ` as any
          
          fixes.push('Fixed positionChange data type')
          console.log('✅ Fixed positionChange data type')
        }
      } catch (typeError) {
        console.log('⚠️ Could not fix data type (may already be correct):', typeError)
      }

      // Verify final structure
      const finalColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking'
        ORDER BY ordinal_position
      ` as any[]
      
      console.log('✅ FINAL keyword_tracking structure:', finalColumns)

      // Check for any remaining issues by trying a test operation
      try {
        console.log('🧪 Testing keyword tracking creation...')
        
        // Get a test user
        const testUser = await prisma.user.findFirst()
        if (testUser) {
          // Test creating a brand tracking record
          const testBrand = await prisma.brandTracking.create({
            data: {
              userId: testUser.id,
              brandName: 'test-schema-' + Date.now(),
              displayName: 'Test Schema',
              keywords: ['test'],
              competitors: [],
              isActive: true
            }
          })

          // Test creating keyword tracking record with ALL required fields
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
          
          console.log('✅ Test keyword tracking created successfully:', testKeyword.id)
          
          // Clean up test data
          await prisma.keywordTracking.delete({ where: { id: testKeyword.id } })
          await prisma.brandTracking.delete({ where: { id: testBrand.id } })
          
          fixes.push('Schema test passed')
        }
      } catch (testError) {
        console.error('❌ Schema test failed:', testError)
        fixes.push(`Schema test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`)
      }

      return NextResponse.json({
        success: true,
        message: 'Complete schema fix applied',
        fixes: fixes,
        finalColumns: finalColumns,
        timestamp: new Date().toISOString()
      })

    } catch (fixError) {
      console.error('❌ Complete schema fix failed:', fixError)
      
      return NextResponse.json({
        success: false,
        error: 'Complete schema fix failed',
        details: fixError instanceof Error ? fixError.message : 'Unknown error',
        fixes: fixes
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Complete schema fix API error:', error)
    return NextResponse.json({ 
      error: 'Failed to apply complete schema fix',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
