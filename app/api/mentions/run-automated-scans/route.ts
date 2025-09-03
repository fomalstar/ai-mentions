import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aiScanningService } from '@/lib/ai-scanning'

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a scheduled task (cron job)
    // It will run automated scans for all enabled projects and topics
    
    console.log('🚀 Starting automated scan run...')
    
    // Get all enabled automated scans
    const enabledBrands = await prisma.brandTracking.findMany({
      where: {
        autoScanEnabled: true,
        isActive: true
      },
      include: {
        keywordTracking: {
          where: {
            autoScanEnabled: true,
            isActive: true
          }
        },
        user: {
          select: { id: true, email: true }
        }
      }
    })

    console.log(`📊 Found ${enabledBrands.length} brands with automated scanning enabled`)

    let totalScansRun = 0
    let totalMentionsFound = 0
    const results = []

    for (const brand of enabledBrands) {
      // Check if it's time to scan this brand (24 hours since last scan)
      const lastScanTime = brand.lastScanAt ? new Date(brand.lastScanAt).getTime() : 0
      const nextScanTime = brand.nextScanAt ? new Date(brand.nextScanAt).getTime() : 0
      const currentTime = Date.now()

      // Skip if not yet time to scan
      if (nextScanTime > currentTime) {
        console.log(`⏰ Brand ${brand.displayName} not ready for scan yet. Next scan at: ${new Date(nextScanTime)}`)
        continue
      }

      console.log(`🔍 Running automated scan for brand: ${brand.displayName}`)

      // Scan each enabled topic for this brand
      for (const keyword of brand.keywordTracking) {
        try {
          console.log(`📝 Scanning topic: ${keyword.topic} for keyword: ${keyword.keyword}`)

          // Run the AI scan
          const scanResults = await aiScanningService.scanKeyword({
            userId: brand.user.id,
            brandTrackingId: brand.id,
            keywordTrackingId: keyword.id,
            brandName: brand.displayName,
            keyword: keyword.keyword,
            topic: keyword.topic
          })

          // Store scan results
          await aiScanningService.storeScanResults({
            userId: brand.user.id,
            brandTrackingId: brand.id,
            keywordTrackingId: keyword.id,
            brandName: brand.displayName,
            keyword: keyword.keyword,
            topic: keyword.topic
          }, scanResults)

          // Count mentions found
          const mentionsFound = scanResults.filter(result => result.brandMentioned).length
          totalMentionsFound += mentionsFound

          // Update keyword tracking with scan results
          await prisma.keywordTracking.update({
            where: { id: keyword.id },
            data: {
              lastScanAt: new Date(),
              autoScanLastRun: new Date(),
              scanCount: { increment: 1 }
            }
          })

          totalScansRun++
          console.log(`✅ Completed scan for ${keyword.topic}. Found ${mentionsFound} mentions.`)

          results.push({
            brandId: brand.id,
            brandName: brand.displayName,
            keywordId: keyword.id,
            keyword: keyword.keyword,
            topic: keyword.topic,
            mentionsFound,
            scanResults: scanResults.length
          })

        } catch (error) {
          console.error(`❌ Failed to scan topic ${keyword.topic}:`, error)
          
          // Update keyword tracking to mark failed scan
          await prisma.keywordTracking.update({
            where: { id: keyword.id },
            data: {
              autoScanLastRun: new Date()
            }
          })
        }
      }

      // Update brand tracking with next scan time
      await prisma.brandTracking.update({
        where: { id: brand.id },
        data: {
          lastScanAt: new Date(),
          autoScanLastRun: new Date(),
          nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Schedule next scan in 24 hours
        }
      })

      console.log(`✅ Completed automated scan for brand: ${brand.displayName}`)
    }

    console.log(`🎉 Automated scan run completed! Ran ${totalScansRun} scans, found ${totalMentionsFound} mentions`)

    return NextResponse.json({
      success: true,
      message: 'Automated scan run completed',
      summary: {
        totalScansRun,
        totalMentionsFound,
        brandsProcessed: enabledBrands.length
      },
      results
    })

  } catch (error) {
    console.error('Automated scan run error:', error)
    return NextResponse.json({ 
      error: 'Failed to run automated scans',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get status of automated scanning
    const enabledBrands = await prisma.brandTracking.findMany({
      where: {
        autoScanEnabled: true,
        isActive: true
      },
      select: {
        id: true,
        displayName: true,
        autoScanStartedAt: true,
        autoScanLastRun: true,
        nextScanAt: true,
        lastScanAt: true,
        _count: {
          select: {
            keywordTracking: {
              where: { autoScanEnabled: true }
            }
          }
        }
      }
    })

    const totalEnabledTopics = enabledBrands.reduce((sum, brand) => sum + brand._count.keywordTracking, 0)

    return NextResponse.json({
      success: true,
      status: {
        totalEnabledBrands: enabledBrands.length,
        totalEnabledTopics,
        nextScheduledScan: enabledBrands.length > 0 ? 
          Math.min(...enabledBrands.map(b => b.nextScanAt ? new Date(b.nextScanAt).getTime() : Date.now())) : null
      },
      brands: enabledBrands
    })

  } catch (error) {
    console.error('Get automated scan status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get automated scan status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
