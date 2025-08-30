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

    const { searchParams } = new URL(request.url)
    const brandTrackingId = searchParams.get('brandTrackingId')
    const keywordTrackingId = searchParams.get('keywordTrackingId')
    const platform = searchParams.get('platform')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = { 
      userId: session.user.id,
      brandMentioned: true // Only get results where brand was mentioned
    }
    
    if (brandTrackingId) {
      where.brandTrackingId = brandTrackingId
    }
    
    if (keywordTrackingId) {
      where.keywordTrackingId = keywordTrackingId
    }
    
    if (platform) {
      where.platform = platform
    }

    // Get scan results with source URLs
    const scanResults = await prisma.scanResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        brandTracking: {
          select: { displayName: true }
        },
        keywordTracking: {
          select: { keyword: true, topic: true }
        }
      }
    })

    // Process and organize source URLs
    const sources: Array<{
      id: string
      brandName: string
      keyword: string
      topic: string
      platform: string
      position: number | null
      confidence: number
      scanDate: string
      urls: Array<{
        url: string
        domain: string
        title: string
        date?: string
      }>
    }> = []

    const uniqueDomains = new Set<string>()
    const domainCounts: Record<string, number> = {}

    scanResults.forEach(result => {
      if (result.sourceUrls && Array.isArray(result.sourceUrls)) {
        const urls = result.sourceUrls.map((urlData: any) => {
          // Count domain frequency
          const domain = urlData.domain || 'unknown'
          uniqueDomains.add(domain)
          domainCounts[domain] = (domainCounts[domain] || 0) + 1
          
          return {
            url: urlData.url || '',
            domain,
            title: urlData.title || domain,
            date: urlData.date || result.createdAt.toISOString()
          }
        })

        if (urls.length > 0) {
          sources.push({
            id: result.id,
            brandName: result.brandTracking?.displayName || 'Unknown',
            keyword: result.keywordTracking?.keyword || 'Unknown',
            topic: result.keywordTracking?.topic || 'Unknown',
            platform: result.platform,
            position: result.position,
            confidence: result.confidence || 0,
            scanDate: result.createdAt.toISOString(),
            urls
          })
        }
      }
    })

    // Get top domains
    const topDomains = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([domain, count]) => ({ domain, count }))

    // Calculate statistics
    const stats = {
      totalSources: sources.length,
      totalUrls: sources.reduce((sum, source) => sum + source.urls.length, 0),
      uniqueDomains: uniqueDomains.size,
      platformBreakdown: calculatePlatformBreakdown(sources),
      avgPosition: calculateAveragePosition(sources),
      avgConfidence: calculateAverageConfidence(sources),
      dateRange: {
        from: sources.length > 0 ? sources[sources.length - 1].scanDate : null,
        to: sources.length > 0 ? sources[0].scanDate : null
      }
    }

    return NextResponse.json({
      success: true,
      sources,
      topDomains,
      stats,
      filters: {
        brandTrackingId,
        keywordTrackingId,
        platform,
        limit
      }
    })

  } catch (error) {
    console.error('Get sources error:', error)
    return NextResponse.json({ 
      error: 'Failed to get sources',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculatePlatformBreakdown(sources: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {}
  
  sources.forEach(source => {
    breakdown[source.platform] = (breakdown[source.platform] || 0) + 1
  })
  
  return breakdown
}

function calculateAveragePosition(sources: any[]): number | null {
  const positions = sources
    .filter(s => s.position !== null)
    .map(s => s.position)
  
  if (positions.length === 0) return null
  
  return Math.round((positions.reduce((sum: number, pos: number) => sum + pos, 0) / positions.length) * 10) / 10
}

function calculateAverageConfidence(sources: any[]): number {
  if (sources.length === 0) return 0
  
  const totalConfidence = sources.reduce((sum, source) => sum + source.confidence, 0)
  return Math.round((totalConfidence / sources.length) * 100) / 100
}
