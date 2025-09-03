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

    // Get the actual database user ID
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const { action, brandTrackingId, keywordTrackingId, enabled } = await request.json()
    
    if (!action || !['enable', 'disable'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "enable" or "disable"' }, { status: 400 })
    }

    if (action === 'enable') {
      if (brandTrackingId) {
        // Enable automated scanning for entire brand/project
        await prisma.brandTracking.update({
          where: {
            id: brandTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: true,
            autoScanStartedAt: new Date(),
            nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Schedule next scan in 24 hours
          }
        })

        // Also enable automation for all keywords in this brand
        await prisma.keywordTracking.updateMany({
          where: {
            brandTrackingId: brandTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: true,
            autoScanStartedAt: new Date()
          }
        })

        console.log(`✅ Enabled automated scanning for brand: ${brandTrackingId}`)
        return NextResponse.json({
          success: true,
          message: 'Automated scanning enabled for all topics in this project',
          nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      } else if (keywordTrackingId) {
        // Enable automated scanning for specific topic
        await prisma.keywordTracking.update({
          where: {
            id: keywordTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: true,
            autoScanStartedAt: new Date()
          }
        })

        console.log(`✅ Enabled automated scanning for topic: ${keywordTrackingId}`)
        return NextResponse.json({
          success: true,
          message: 'Automated scanning enabled for this topic',
          nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      } else {
        return NextResponse.json({ error: 'Either brandTrackingId or keywordTrackingId is required' }, { status: 400 })
      }

    } else if (action === 'disable') {
      if (brandTrackingId) {
        // Disable automated scanning for entire brand/project
        await prisma.brandTracking.update({
          where: {
            id: brandTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: false,
            autoScanStartedAt: null,
            nextScanAt: null
          }
        })

        // Also disable automation for all keywords in this brand
        await prisma.keywordTracking.updateMany({
          where: {
            brandTrackingId: brandTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: false,
            autoScanStartedAt: null
          }
        })

        console.log(`❌ Disabled automated scanning for brand: ${brandTrackingId}`)
        return NextResponse.json({
          success: true,
          message: 'Automated scanning disabled for all topics in this project'
        })

      } else if (keywordTrackingId) {
        // Disable automated scanning for specific topic
        await prisma.keywordTracking.update({
          where: {
            id: keywordTrackingId,
            userId: dbUser.id
          },
          data: {
            autoScanEnabled: false,
            autoScanStartedAt: null
          }
        })

        console.log(`❌ Disabled automated scanning for topic: ${keywordTrackingId}`)
        return NextResponse.json({
          success: true,
          message: 'Automated scanning disabled for this topic'
        })

      } else {
        return NextResponse.json({ error: 'Either brandTrackingId or keywordTrackingId is required' }, { status: 400 })
      }
    }

  } catch (error) {
    console.error('Automation API error:', error)
    return NextResponse.json({ 
      error: 'Failed to update automation settings',
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

    // Get the actual database user ID
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const brandTrackingId = searchParams.get('brandTrackingId')

    // Get automation status for user's projects
    const where: any = { userId: dbUser.id }
    if (brandTrackingId) {
      where.id = brandTrackingId
    }

    const brandTracking = await prisma.brandTracking.findMany({
      where,
      include: {
        keywordTracking: {
          select: {
            id: true,
            keyword: true,
            topic: true,
            autoScanEnabled: true,
            autoScanStartedAt: true,
            autoScanLastRun: true,
            lastScanAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      automation: brandTracking.map(brand => ({
        id: brand.id,
        displayName: brand.displayName,
        autoScanEnabled: brand.autoScanEnabled,
        autoScanStartedAt: brand.autoScanStartedAt,
        autoScanLastRun: brand.autoScanLastRun,
        nextScanAt: brand.nextScanAt,
        topics: brand.keywordTracking.map(kw => ({
          id: kw.id,
          keyword: kw.keyword,
          topic: kw.topic,
          autoScanEnabled: kw.autoScanEnabled,
          autoScanStartedAt: kw.autoScanStartedAt,
          autoScanLastRun: kw.autoScanLastRun,
          lastScanAt: kw.lastScanAt
        }))
      }))
    })

  } catch (error) {
    console.error('Get automation status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get automation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
