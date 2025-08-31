import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug track route called')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Request body:', body)
    
    const { brandName, keywords, topics, competitors } = body
    
    // Step 1: Test database connection
    console.log('🔌 Step 1: Testing database connection...')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // Step 2: Check table structure
    console.log('📋 Step 2: Checking table structure...')
    try {
      const brandTrackingColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'brand_tracking' 
        ORDER BY ordinal_position
      `
      console.log('✅ brand_tracking columns:', brandTrackingColumns)
      
      const keywordTrackingColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking' 
        ORDER BY ordinal_position
      `
      console.log('✅ keyword_tracking columns:', keywordTrackingColumns)
    } catch (tableError) {
      console.error('❌ Table structure check failed:', tableError)
    }
    
    // Step 3: Check existing data
    console.log('📊 Step 3: Checking existing data...')
    try {
      const existingBrandTracking = await prisma.brandTracking.findMany({
        where: { userId: session.user.id },
        take: 5
      })
      console.log('✅ Existing brand tracking records:', existingBrandTracking.length)
      
      const existingKeywordTracking = await prisma.keywordTracking.findMany({
        where: { userId: session.user.id },
        take: 5
      })
      console.log('✅ Existing keyword tracking records:', existingKeywordTracking.length)
    } catch (dataError) {
      console.error('❌ Data check failed:', dataError)
    }
    
    // Step 4: Test brand tracking creation (without upsert)
    console.log('🧪 Step 4: Testing brand tracking creation...')
    try {
      const testTracking = await prisma.brandTracking.create({
        data: {
          userId: session.user.id,
          brandName: 'test-debug-' + Date.now(),
          displayName: 'Test Debug Brand',
          keywords: ['test'],
          competitors: [],
          isActive: true
        }
      })
      console.log('✅ Test brand tracking created:', testTracking.id)
      
      // Clean up test data
      await prisma.brandTracking.delete({
        where: { id: testTracking.id }
      })
      console.log('🧹 Test data cleaned up')
      
    } catch (createError) {
      console.error('❌ Brand tracking creation failed:', createError)
      return NextResponse.json({ 
        error: 'Brand tracking creation failed',
        details: createError instanceof Error ? createError.message : 'Unknown error',
        code: createError.code || 'UNKNOWN'
      }, { status: 500 })
    }
    
    // Step 5: Test the actual upsert operation
    console.log('🧪 Step 5: Testing actual upsert operation...')
    try {
      const actualTracking = await prisma.brandTracking.upsert({
        where: { 
          userId_brandName: {
            userId: session.user.id,
            brandName: brandName.toLowerCase()
          }
        },
        update: {
          keywords,
          competitors: competitors || [],
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          brandName: brandName.toLowerCase(),
          displayName: brandName,
          keywords,
          competitors: competitors || [],
          isActive: true
        }
      })
      
      console.log('✅ Actual upsert successful:', actualTracking.id)
      
      // Clean up
      await prisma.brandTracking.delete({
        where: { id: actualTracking.id }
      })
      console.log('🧹 Actual test data cleaned up')
      
    } catch (upsertError) {
      console.error('❌ Actual upsert failed:', upsertError)
      return NextResponse.json({ 
        error: 'Actual upsert failed',
        details: upsertError instanceof Error ? upsertError.message : 'Unknown error',
        code: upsertError.code || 'UNKNOWN'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All debug tests passed',
      session: { userId: session.user.id, email: session.user.email },
      requestData: { brandName, keywords, topics, competitors }
    })
    
  } catch (error) {
    console.error('❌ Debug track route error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
