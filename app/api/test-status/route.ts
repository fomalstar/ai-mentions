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

    console.log('🧪 Testing status route for user:', session.user.email)

    // Get the actual database user ID
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    console.log('🔍 Database user found:', dbUser.id)

    // Test direct brand tracking query
    const brandTracking = await prisma.brandTracking.findMany({
      where: { userId: dbUser.id },
      include: {
        keywordTracking: {
          where: { isActive: true }
        }
      }
    })

    console.log('📋 Brand tracking found:', brandTracking.length, 'records')
    console.log('📋 Brand tracking data:', JSON.stringify(brandTracking, null, 2))

    // Check what data would be in the response format
    const formattedData = brandTracking.map(brand => ({
      id: brand.id,
      displayName: brand.displayName,
      brandName: brand.brandName,
      website: brand.website,
      description: brand.description,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      keywordTracking: brand.keywordTracking
    }))

    console.log('📊 Formatted brand tracking data:', JSON.stringify(formattedData, null, 2))

    return NextResponse.json({
      success: true,
      testResults: {
        sessionUserId: session.user.id,
        databaseUserId: dbUser.id,
        brandTrackingCount: brandTracking.length,
        brandTrackingData: brandTracking,
        formattedData: formattedData,
        userEmail: session.user.email,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Test status error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
