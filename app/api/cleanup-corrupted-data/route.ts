import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleanup corrupted data route called')
    
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

    const { action } = await request.json()
    
    if (action === 'cleanup-corrupted-keywords') {
      console.log('🧹 Starting cleanup of corrupted keywords...')
      
      // Find and delete corrupted keyword tracking entries
      const corruptedKeywords = await prisma.keywordTracking.findMany({
        where: {
          userId: dbUser.id,
          OR: [
            { keyword: { contains: 'erg' } },
            { topic: { contains: 'erg' } },
            { keyword: { contains: 'tewgw' } },
            { keyword: { contains: 'gerg' } },
            { keyword: { contains: 'google' } },
            { keyword: { contains: 'new schedule' } },
            { topic: { contains: 'erge' } },
            { topic: { contains: 'gre' } },
            { topic: { contains: 'ewgerg' } },
            { topic: { contains: 'ergerg' } }
          ]
        },
        select: {
          id: true,
          keyword: true,
          topic: true,
          brandTrackingId: true
        }
      })
      
      console.log(`🔍 Found ${corruptedKeywords.length} corrupted keywords to clean up:`)
      corruptedKeywords.forEach(k => {
        console.log(`  - ${k.keyword} (topic: ${k.topic})`)
      })
      
      if (corruptedKeywords.length > 0) {
        // Delete corrupted keywords (cascade will clean up related data)
        const deleteResult = await prisma.keywordTracking.deleteMany({
          where: {
            userId: dbUser.id,
            OR: [
              { keyword: { contains: 'erg' } },
              { topic: { contains: 'erg' } },
              { keyword: { contains: 'tewgw' } },
              { keyword: { contains: 'gerg' } },
              { keyword: { contains: 'google' } },
              { keyword: { contains: 'new schedule' } },
              { topic: { contains: 'erge' } },
              { topic: { contains: 'gre' } },
              { topic: { contains: 'ewgerg' } },
              { topic: { contains: 'ergerg' } }
            ]
          }
        })
        
        console.log(`✅ Deleted ${deleteResult.count} corrupted keywords`)
        
        // Also clean up related scan results
        const scanResultDelete = await prisma.scanResult.deleteMany({
          where: {
            userId: dbUser.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
        
        console.log(`✅ Deleted ${scanResultDelete.count} related scan results`)
        
        // Clean up scan queue items
        const scanQueueDelete = await prisma.scanQueue.deleteMany({
          where: {
            userId: dbUser.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
        
        console.log(`✅ Deleted ${scanQueueDelete.count} related scan queue items`)
        
        return NextResponse.json({
          success: true,
          message: 'Corrupted data cleanup completed',
          deleted: {
            keywords: deleteResult.count,
            scanResults: scanResultDelete.count,
            scanQueueItems: scanQueueDelete.count
          },
          corruptedKeywords: corruptedKeywords.map(k => ({
            keyword: k.keyword,
            topic: k.topic
          }))
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'No corrupted keywords found',
          deleted: {
            keywords: 0,
            scanResults: 0,
            scanQueueItems: 0
          }
        })
      }
      
    } else if (action === 'list-keywords') {
      // List all current keywords for inspection
      const allKeywords = await prisma.keywordTracking.findMany({
        where: { userId: dbUser.id },
        select: {
          id: true,
          keyword: true,
          topic: true,
          brandTrackingId: true,
          createdAt: true,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Current keywords listed',
        keywords: allKeywords
      })
      
    } else if (action === 'reset-to-default') {
      // Reset to a clean state with just the correct SEO keyword
      console.log('🔄 Resetting to default clean state...')
      
      // First, delete all existing keyword tracking
      const deleteAll = await prisma.keywordTracking.deleteMany({
        where: { userId: dbUser.id }
      })
      
      console.log(`✅ Deleted all ${deleteAll.count} existing keywords`)
      
      // Clean up related data
      await prisma.scanResult.deleteMany({
        where: { userId: dbUser.id }
      })
      
      await prisma.scanQueue.deleteMany({
        where: { userId: dbUser.id }
      })
      
      // Get the brand tracking entry
      const brandTracking = await prisma.brandTracking.findFirst({
        where: { userId: dbUser.id }
      })
      
      if (brandTracking) {
        // Create the correct keyword tracking entry
        const newKeyword = await prisma.keywordTracking.create({
          data: {
            userId: dbUser.id,
            brandTrackingId: brandTracking.id,
            keyword: 'how to do seo',
            topic: 'how to do seo',
            isActive: true
          }
        })
        
        console.log(`✅ Created clean keyword: ${newKeyword.keyword} with topic: ${newKeyword.topic}`)
        
        return NextResponse.json({
          success: true,
          message: 'Reset to default clean state completed',
          newKeyword: {
            keyword: newKeyword.keyword,
            topic: newKeyword.topic
          }
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'Reset completed, but no brand tracking found to attach keyword to'
        })
      }
      
    } else if (action === 'comprehensive-cleanup') {
      // Comprehensive cleanup - check all possible sources of corrupted data
      console.log('🧹 Starting comprehensive cleanup...')
      
      let totalDeleted = 0
      const cleanupResults = []
      
      // 1. Clean corrupted keywords
      const corruptedKeywords = await prisma.keywordTracking.findMany({
        where: {
          userId: dbUser.id,
          OR: [
            { keyword: { contains: 'erg' } },
            { topic: { contains: 'erg' } },
            { keyword: { contains: 'tewgw' } },
            { keyword: { contains: 'gerg' } },
            { keyword: { contains: 'google' } },
            { keyword: { contains: 'new schedule' } },
            { topic: { contains: 'erge' } },
            { topic: { contains: 'gre' } },
            { topic: { contains: 'ewgerg' } },
            { topic: { contains: 'ergerg' } }
          ]
        }
      })
      
      if (corruptedKeywords.length > 0) {
        const deleteResult = await prisma.keywordTracking.deleteMany({
          where: {
            userId: dbUser.id,
            OR: [
              { keyword: { contains: 'erg' } },
              { topic: { contains: 'erg' } },
              { keyword: { contains: 'tewgw' } },
              { keyword: { contains: 'gerg' } },
              { keyword: { contains: 'google' } },
              { keyword: { contains: 'new schedule' } },
              { topic: { contains: 'erge' } },
              { topic: { contains: 'gre' } },
              { topic: { contains: 'ewgerg' } },
              { topic: { contains: 'ergerg' } }
            ]
          }
        })
        
        totalDeleted += deleteResult.count
        cleanupResults.push(`Deleted ${deleteResult.count} corrupted keywords`)
        
        // Clean related data
        await prisma.scanResult.deleteMany({
          where: {
            userId: dbUser.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
        
        await prisma.scanQueue.deleteMany({
          where: {
            userId: dbUser.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
      }
      
      // 2. Check brand tracking for corrupted data
      const brandTracking = await prisma.brandTracking.findMany({
        where: { userId: dbUser.id }
      })
      
      for (const brand of brandTracking) {
        if (brand.keywords && Array.isArray(brand.keywords)) {
          const hasCorruptedKeywords = brand.keywords.some((k: string) => 
            k.includes('erg') || k.includes('tewgw') || k.includes('gerg') || 
            k.includes('google') || k.includes('new schedule')
          )
          
          if (hasCorruptedKeywords) {
            console.log(`⚠️ Found corrupted keywords in brand tracking: ${brand.displayName}`)
            
            // Clean the keywords array
            const cleanKeywords = brand.keywords.filter((k: string) => 
              !k.includes('erg') && !k.includes('tewgw') && !k.includes('gerg') && 
              !k.includes('google') && !k.includes('new schedule')
            )
            
            if (cleanKeywords.length === 0) {
              cleanKeywords.push('how to do seo') // Add default clean keyword
            }
            
            await prisma.brandTracking.update({
              where: { id: brand.id },
              data: { keywords: cleanKeywords }
            })
            
            cleanupResults.push(`Cleaned corrupted keywords in brand: ${brand.displayName}`)
          }
        }
      }
      
      // 3. Create clean keyword if none exist
      const remainingKeywords = await prisma.keywordTracking.count({
        where: { userId: dbUser.id }
      })
      
      if (remainingKeywords === 0) {
        const brandTracking = await prisma.brandTracking.findFirst({
          where: { userId: dbUser.id }
        })
        
        if (brandTracking) {
          const newKeyword = await prisma.keywordTracking.create({
            data: {
              userId: dbUser.id,
              brandTrackingId: brandTracking.id,
              keyword: 'how to do seo',
              topic: 'how to do seo',
              isActive: true
            }
          })
          
          cleanupResults.push(`Created clean default keyword: ${newKeyword.keyword}`)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Comprehensive cleanup completed',
        deleted: totalDeleted,
        cleanupResults,
        remainingKeywords: await prisma.keywordTracking.count({
          where: { userId: dbUser.id }
        })
      })
      
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use: cleanup-corrupted-keywords, list-keywords, or reset-to-default' 
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Cleanup route error:', error)
    return NextResponse.json({ 
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cleanup API is working',
    availableActions: [
      'cleanup-corrupted-keywords',
      'list-keywords', 
      'reset-to-default'
    ],
    description: 'POST with action to clean up corrupted data'
  })
}
