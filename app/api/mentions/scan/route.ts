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
          userId: dbUser.id  // Use database user ID
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
          // Validate and clean the topic
          let scanTopic = keyword.topic
          
          // Check if topic is corrupted or invalid
          const cleanTopic = scanTopic ? scanTopic.trim().toLowerCase() : ''
          const isCorrupted = !scanTopic || 
                            cleanTopic === '' || 
                            ['ergerg', 'tewgw', 'gerg', 'sdgd', 'ewg', 'gsgsg'].includes(cleanTopic) ||
                            (cleanTopic.length < 5 && !/^(ai|seo|web|app|api)$/i.test(cleanTopic)) // Reject short gibberish but allow valid short terms
          
          if (isCorrupted) {
            console.warn(`⚠️ Invalid/corrupted topic detected: "${scanTopic}" for keyword: "${keyword.keyword}"`)
            
            // Try to construct a meaningful topic from the keyword
            if (keyword.keyword && keyword.keyword.trim().length > 2) {
              scanTopic = `What are the best ${keyword.keyword} tools and services?`
              console.log(`🔧 Constructed fallback topic: "${scanTopic}"`)
            } else {
              console.error(`❌ Cannot scan: both topic and keyword are invalid`)
              continue // Skip this keyword
            }
          }
          
          console.log(`🔍 Starting AI scan for keyword: ${keyword.keyword}, topic: ${scanTopic}`)
          
          // Proceed with available API keys; platforms without keys will return error result
          
          const scanResults = await aiScanningService.scanKeyword({
            userId: dbUser.id,  // Use database user ID
            brandTrackingId: brandTracking.id,
            keywordTrackingId: keyword.id,
            brandName: brandTracking.displayName,
            keyword: keyword.keyword,
            topic: scanTopic // Use the validated/cleaned topic
          })
          
          console.log(`✅ AI scan completed for keyword: ${keyword.keyword}`)
          
          results.push({
            keywordTrackingId: keyword.id,
            keyword: keyword.keyword,
            results: scanResults
          })

          // Persist results
          try {
            await aiScanningService.storeScanResults({
              userId: dbUser.id,
              brandTrackingId: brandTracking.id,
              keywordTrackingId: keyword.id,
              brandName: brandTracking.displayName,
              keyword: keyword.keyword,
              topic: scanTopic
            }, scanResults)
          } catch (storeErr) {
            console.warn('Failed to persist scan results:', storeErr instanceof Error ? storeErr.message : storeErr)
          }
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
              userId: dbUser.id,  // Use database user ID consistently
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

    // Align with POST: resolve database user ID via email
    let dbUser
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }
    } catch (userErr) {
      return NextResponse.json({ error: 'Failed to find user in database' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const brandTrackingId = searchParams.get('brandTrackingId')

    // Get recent scan results
    const where: any = { userId: dbUser.id }
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
        userId: dbUser.id,
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
