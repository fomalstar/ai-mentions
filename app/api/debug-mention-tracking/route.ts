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

    // Get the actual database user ID
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Get current database state
    const brandTracking = await prisma.brandTracking.findMany({
      where: { userId: dbUser.id },
      include: {
        keywordTracking: {
          where: { isActive: true },
          select: {
            id: true,
            keyword: true,
            topic: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    // Get all keyword tracking entries
    const allKeywordTracking = await prisma.keywordTracking.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        keyword: true,
        topic: true,
        brandTrackingId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      debug: {
        userId: dbUser.id,
        userEmail: dbUser.email,
        brandTrackingCount: brandTracking.length,
        keywordTrackingCount: allKeywordTracking.length,
        brandTracking: brandTracking.map(bt => ({
          id: bt.id,
          brandName: bt.brandName,
          displayName: bt.displayName,
          keywords: bt.keywords, // String array
          keywordTrackingCount: bt.keywordTracking.length,
          keywordTracking: bt.keywordTracking
        })),
        allKeywordTracking: allKeywordTracking
      }
    })

  } catch (error) {
    console.error('Debug mention tracking error:', error)
    return NextResponse.json({ 
      error: 'Failed to debug mention tracking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
