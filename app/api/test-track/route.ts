import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test track route called')
    
    // 1. Check session
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Check database connection
    console.log('🔌 Testing database connection...')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // 3. Check if tables exist
    console.log('📋 Checking table existence...')
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('brand_tracking', 'keyword_tracking', 'users')
      `
      console.log('✅ Tables found:', tables)
    } catch (tableError) {
      console.error('❌ Table check failed:', tableError)
    }
    
    // 4. Check user exists in database
    console.log('👤 Checking user in database...')
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true }
      })
      console.log('✅ User found in database:', user)
    } catch (userError) {
      console.error('❌ User lookup failed:', userError)
    }
    
    // 5. Test simple brand tracking creation
    console.log('🧪 Testing brand tracking creation...')
    try {
      const testTracking = await prisma.brandTracking.create({
        data: {
          userId: session.user.id,
          brandName: 'test-brand-' + Date.now(),
          displayName: 'Test Brand',
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
        details: createError instanceof Error ? createError.message : 'Unknown error'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tests passed',
      session: { userId: session.user.id, email: session.user.email }
    })
    
  } catch (error) {
    console.error('❌ Test track route error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
