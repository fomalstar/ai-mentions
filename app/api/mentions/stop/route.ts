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

    const { brandTrackingId, stopAll = false } = await request.json()

    if (stopAll) {
      // Stop all scanning for user
      await prisma.brandTracking.updateMany({
        where: { userId: session.user.id },
        data: { scanningEnabled: false }
      })

      // Cancel pending queue items
      await prisma.scanQueue.updateMany({
        where: {
          userId: session.user.id,
          status: 'pending'
        },
        data: {
          status: 'cancelled',
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'All scanning stopped successfully'
      })
    } else {
      // Stop specific brand tracking
      if (!brandTrackingId) {
        return NextResponse.json({ 
          error: 'Brand tracking ID is required when not stopping all' 
        }, { status: 400 })
      }

      const brandTracking = await prisma.brandTracking.findFirst({
        where: {
          id: brandTrackingId,
          userId: session.user.id
        }
      })

      if (!brandTracking) {
        return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
      }

      // Disable scanning for this brand
      await prisma.brandTracking.update({
        where: { id: brandTrackingId },
        data: { scanningEnabled: false }
      })

      // Cancel pending queue items for this brand
      await prisma.scanQueue.updateMany({
        where: {
          brandTrackingId,
          status: 'pending'
        },
        data: {
          status: 'cancelled',
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `Scanning stopped for ${brandTracking.displayName}`
      })
    }

  } catch (error) {
    console.error('Stop scanning error:', error)
    return NextResponse.json({ 
      error: 'Failed to stop scanning',
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

    // Get scanning status for all user's brands
    const brands = await prisma.brandTracking.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        displayName: true,
        scanningEnabled: true,
        lastScanAt: true,
        nextScanAt: true,
        scanInterval: true
      }
    })

    // Get active queue items
    const activeQueue = await prisma.scanQueue.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['pending', 'running'] }
      },
      include: {
        brandTracking: {
          select: { displayName: true }
        }
      }
    })

    return NextResponse.json({
      brands,
      activeQueue,
      summary: {
        totalBrands: brands.length,
        enabledBrands: brands.filter(b => b.scanningEnabled).length,
        pendingScans: activeQueue.filter(q => q.status === 'pending').length,
        runningScans: activeQueue.filter(q => q.status === 'running').length
      }
    })

  } catch (error) {
    console.error('Get scanning status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get scanning status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
