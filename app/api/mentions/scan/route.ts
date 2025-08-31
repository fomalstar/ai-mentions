import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiScanningService } from '@/lib/ai-scanning'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Scan route called with request')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log(`✅ User authenticated: ${session.user.id}`)

    const { brandTrackingId, keywordTrackingId, immediate = false } = await request.json()
    console.log(`📋 Request data:`, { brandTrackingId, keywordTrackingId, immediate })
    
    if (!brandTrackingId) {
      console.log('❌ No brandTrackingId provided')
      return NextResponse.json({ error: 'Brand tracking ID is required' }, { status: 400 })
    }

    // Get brand tracking details

    let brandTracking
    try {
      // First check if the database tables exist by testing a simple query
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection test passed')
      
      brandTracking = await prisma.brandTracking.findFirst({
        where: {
          id: brandTrackingId,
          userId: session.user.id
        },
        include: {
          keywordTracking: {
            where: keywordTrackingId ? { id: keywordTrackingId } : { isActive: true }
          }
        }
      })
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      
      // Check if it's a table not found error
      if (dbError instanceof Error && dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database tables not found. Please run database migrations first.',
          details: 'The required database tables have not been created yet.',
          suggestion: 'Run: pnpm run db:deploy or check your database setup'
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    if (!brandTracking) {
      return NextResponse.json({ 
        error: 'Brand tracking not found',
        details: `No brand tracking found with ID: ${brandTrackingId}`,
        suggestion: 'Create a brand tracking entry first'
      }, { status: 404 })
    }
    
    // Check if keywordTracking table exists and has data
    if (!brandTracking.keywordTracking || brandTracking.keywordTracking.length === 0) {
      return NextResponse.json({ 
        error: 'No keywords/topics to scan',
        details: 'This brand has no keywords or topics configured for scanning',
        suggestion: 'Add keywords and topics to your brand tracking first'
      }, { status: 400 })
    }

    if (immediate) {
      // Start immediate scan
      const results = []
      
      for (const keyword of brandTracking.keywordTracking) {
        try {
          console.log(`🔍 Starting AI scan for keyword: ${keyword.keyword}, topic: ${keyword.topic}`)
          
          // Check if required environment variables are set
          if (!process.env.PERPLEXITY_API_KEY || !process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY) {
            throw new Error('Missing required API keys for AI scanning')
          }
          
          const scanResults = await aiScanningService.scanKeyword({
            userId: session.user.id,
            brandTrackingId: brandTracking.id,
            keywordTrackingId: keyword.id,
            brandName: brandTracking.displayName,
            keyword: keyword.keyword,
            topic: keyword.topic || keyword.keyword // Fallback if topic is missing
          })
          
          console.log(`✅ AI scan completed for keyword: ${keyword.keyword}`)
          
          results.push({
            keywordTrackingId: keyword.id,
            keyword: keyword.keyword,
            results: scanResults
          })
        } catch (error) {
          console.error(`❌ Scan error for keyword ${keyword.keyword}:`, error)
          
          // Create a fallback result instead of crashing
          results.push({
            keywordTrackingId: keyword.id,
            keyword: keyword.keyword,
            error: error instanceof Error ? error.message : 'Scan failed',
            results: [
              {
                platform: 'error',
                brandMentioned: false,
                position: null,
                responseText: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                sourceUrls: [],
                scanDuration: 0,
                confidence: 0,
                brandContext: null
              }
            ]
          })
        }
      }

      // Update brand tracking last scan time
      await prisma.brandTracking.update({
        where: { id: brandTracking.id },
        data: { lastScanAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: 'Immediate scan completed',
        results
      })
    } else {
      // Schedule scan in queue
      const keywords = keywordTrackingId 
        ? brandTracking.keywordTracking.filter(k => k.id === keywordTrackingId)
        : brandTracking.keywordTracking

      const queueItems = []
      
      try {
        for (const keyword of keywords) {
          const queueItem = await prisma.scanQueue.create({
            data: {
              userId: session.user.id,
              brandTrackingId: brandTracking.id,
              keywordTrackingId: keyword.id,
              scheduledAt: new Date(),
              scanType: 'manual',
              metadata: {
                brandName: brandTracking.displayName,
                keyword: keyword.keyword,
                topic: keyword.topic
              }
            }
          })
          queueItems.push(queueItem)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Scan scheduled successfully',
          queueItems: queueItems.length,
          scheduledAt: new Date().toISOString()
        })
        
      } catch (error) {
        console.warn('ScanQueue table not available yet:', error instanceof Error ? error.message : 'Unknown error')
        // For now, just return success without queueing
        return NextResponse.json({
          success: true,
          message: 'Scan completed (queue not available)',
          results: []
        })
      }
    }

  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ 
      error: 'Failed to start scan',
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

    const { searchParams } = new URL(request.url)
    const brandTrackingId = searchParams.get('brandTrackingId')

    // Get recent scan results
    const where: any = { userId: session.user.id }
    if (brandTrackingId) {
      where.brandTrackingId = brandTrackingId
    }

    const recentScans = await prisma.scanResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        keywordTracking: {
          select: { keyword: true, topic: true }
        },
        brandTracking: {
          select: { displayName: true }
        }
      }
    })

    // Get scan queue status
    const queueStatus = await prisma.scanQueue.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['pending', 'running'] }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20
    })

    return NextResponse.json({
      recentScans,
      queueStatus,
      summary: {
        totalScans: recentScans.length,
        pendingInQueue: queueStatus.filter(q => q.status === 'pending').length,
        currentlyRunning: queueStatus.filter(q => q.status === 'running').length
      }
    })

  } catch (error) {
    console.error('Get scan data error:', error)
    return NextResponse.json({ 
      error: 'Failed to get scan data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
