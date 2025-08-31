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

    // Get the actual database user ID (not session ID)
    let dbUser
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
      
      if (!dbUser) {
        console.error('❌ User not found in database for email:', session.user.email)
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }
      
      console.log('🔍 Using database user ID:', dbUser.id, 'instead of session ID:', session.user.id)
    } catch (userError) {
      console.error('❌ Failed to find user in database:', userError)
      return NextResponse.json({ error: 'Failed to find user in database' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const brandTrackingId = searchParams.get('brandTrackingId')

    // Build where clause with the real database user ID
    const where: any = { userId: dbUser.id }
    if (brandTrackingId) {
      where.id = brandTrackingId
    }

    // Get brand tracking status
    const brands = await prisma.brandTracking.findMany({
      where,
      include: {
        keywordTracking: {
          where: { isActive: true },
          select: {
            id: true,
            keyword: true,
            topic: true,
            avgPosition: true,
            chatgptPosition: true,
            perplexityPosition: true,
            geminiPosition: true,
            positionChange: true,
            lastScanAt: true,
            scanCount: true
          }
        },
        _count: {
          select: { 
            scanResults: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            }
          }
        }
      }
    })

    // Get queue status
    let queueItems = []
    try {
      queueItems = await prisma.scanQueue.findMany({
        where: {
          userId: dbUser.id,
          ...(brandTrackingId && { brandTrackingId }),
          status: { in: ['pending', 'running'] }
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
          brandTracking: {
            select: { displayName: true }
          }
        }
      })
    } catch (error) {
      console.warn('ScanQueue table not available yet:', error instanceof Error ? error.message : 'Unknown error')
      // If scan_queue table doesn't exist, try to create it
      if (error instanceof Error && error.message.includes('does not exist')) {
        console.log('🔧 Attempting to create scan_queue table...')
        try {
          await fetch(new URL('/api/create-scan-queue', request.url).toString())
        } catch (createError) {
          console.warn('Failed to auto-create scan_queue table:', createError)
        }
      }
    }

    // Get recent scan results for statistics
    let recentResults = []
    try {
      recentResults = await prisma.scanResult.findMany({
        where: {
          userId: dbUser.id,
          ...(brandTrackingId && { brandTrackingId }),
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          platform: true,
          brandMentioned: true,
          position: true,
          confidence: true,
          createdAt: true,
          brandTrackingId: true
        }
      })
    } catch (error) {
      console.warn('ScanResult table not available yet:', error.message)
    }

    // Calculate statistics
    const stats = {
      totalBrands: brands.length,
      activeBrands: brands.filter(b => b.scanningEnabled).length,
      totalKeywords: brands.reduce((sum, b) => sum + b.keywordTracking.length, 0),
      pendingScans: queueItems.filter(q => q.status === 'pending').length,
      runningScans: queueItems.filter(q => q.status === 'running').length,
      scansLast24h: brands.reduce((sum, b) => sum + b._count.scanResults, 0),
      mentionsFound: recentResults.filter(r => r.brandMentioned).length,
      avgPosition: calculateAveragePosition(recentResults),
      platformBreakdown: calculatePlatformBreakdown(recentResults)
    }

    // Format brand data for response
    const brandData = brands.map(brand => ({
      id: brand.id,
      displayName: brand.displayName,
      scanningEnabled: brand.scanningEnabled,
      lastScanAt: brand.lastScanAt,
      nextScanAt: brand.nextScanAt,
      scanInterval: brand.scanInterval,
      keywords: brand.keywordTracking.map(kw => ({
        id: kw.id,
        keyword: kw.keyword,
        topic: kw.topic,
        avgPosition: kw.avgPosition,
        chatgptPosition: kw.chatgptPosition,
        perplexityPosition: kw.perplexityPosition,
        geminiPosition: kw.geminiPosition,
        positionChange: kw.positionChange,
        lastScanAt: kw.lastScanAt,
        scanCount: kw.scanCount
      })),
      scansLast24h: brand._count.scanResults
    }))

    return NextResponse.json({
      success: true,
      stats,
      brandTracking: brandData, // Frontend expects 'brandTracking' key
      queue: queueItems.map(item => ({
        id: item.id,
        brandName: item.brandTracking?.displayName,
        status: item.status,
        scheduledAt: item.scheduledAt,
        attempts: item.attempts,
        scanType: item.scanType
      })),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get scanning status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get scanning status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateAveragePosition(results: any[]): number | null {
  const positions = results
    .filter(r => r.brandMentioned && r.position !== null)
    .map(r => r.position)
  
  if (positions.length === 0) return null
  
  return Math.round((positions.reduce((sum, pos) => sum + pos, 0) / positions.length) * 10) / 10
}

function calculatePlatformBreakdown(results: any[]): Record<string, number> {
  const breakdown = { chatgpt: 0, perplexity: 0, gemini: 0 }
  
  results.forEach(result => {
    if (result.brandMentioned && result.platform in breakdown) {
      breakdown[result.platform as keyof typeof breakdown]++
    }
  })
  
  return breakdown
}
