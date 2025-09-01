import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Database diagnostics starting...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      userId: dbUser.id,
      email: dbUser.email,
      tables: {}
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.connection = '✅ Connected'
    } catch (connError) {
      diagnostics.connection = `❌ Failed: ${connError instanceof Error ? connError.message : 'Unknown'}`
      return NextResponse.json({ success: false, diagnostics }, { status: 500 })
    }

    // Check each table for the user
    try {
      // User table
      const userCount = await prisma.user.count({ where: { id: dbUser.id } })
      diagnostics.tables.user = { count: userCount, status: userCount > 0 ? '✅' : '❌' }

      // Brand tracking
      const brandTracking = await prisma.brandTracking.findMany({
        where: { userId: dbUser.id },
        select: { id: true, brandName: true, displayName: true, keywords: true }
      })
      diagnostics.tables.brandTracking = {
        count: brandTracking.length,
        status: brandTracking.length >= 0 ? '✅' : '❌',
        records: brandTracking
      }

      // Keyword tracking
      const keywordTracking = await prisma.keywordTracking.findMany({
        where: { userId: dbUser.id },
        select: { id: true, keyword: true, topic: true, brandTrackingId: true }
      })
      diagnostics.tables.keywordTracking = {
        count: keywordTracking.length,
        status: keywordTracking.length >= 0 ? '✅' : '❌',
        records: keywordTracking
      }

      // Scan results
      const scanResults = await prisma.scanResult.count({ where: { userId: dbUser.id } })
      diagnostics.tables.scanResults = { count: scanResults, status: '✅' }

      // Scan queue
      const scanQueue = await prisma.scanQueue.count({ where: { userId: dbUser.id } })
      diagnostics.tables.scanQueue = { count: scanQueue, status: '✅' }

    } catch (tableError) {
      diagnostics.tables.error = `❌ Table access failed: ${tableError instanceof Error ? tableError.message : 'Unknown'}`
    }

    // Check for foreign key violations
    try {
      const orphanedKeywords = await prisma.keywordTracking.findMany({
        where: {
          userId: dbUser.id,
          brandTracking: null  // This would indicate FK violation
        }
      })
      diagnostics.orphanedKeywords = orphanedKeywords.length
    } catch (fkError) {
      diagnostics.foreignKeyCheck = `❌ FK check failed: ${fkError instanceof Error ? fkError.message : 'Unknown'}`
    }

    return NextResponse.json({
      success: true,
      message: 'Database diagnostics completed',
      diagnostics
    })

  } catch (error) {
    console.error('❌ Diagnostics error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Diagnostics failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'manual-queries') {
      // Get database user
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
      
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }

      // Generate manual SQL queries for admin tool
      const queries = {
        instructions: "Run these queries in your database admin tool (in this order):",
        queries: [
          `-- Step 1: Delete scan results for user ${dbUser.id}`,
          `DELETE FROM "ScanResult" WHERE "userId" = '${dbUser.id}';`,
          ``,
          `-- Step 2: Delete scan queue for user ${dbUser.id}`,
          `DELETE FROM "ScanQueue" WHERE "userId" = '${dbUser.id}';`,
          ``,
          `-- Step 3: Delete keyword tracking for user ${dbUser.id}`,
          `DELETE FROM "KeywordTracking" WHERE "userId" = '${dbUser.id}';`,
          ``,
          `-- Step 4: Delete brand tracking for user ${dbUser.id}`,
          `DELETE FROM "BrandTracking" WHERE "userId" = '${dbUser.id}';`,
          ``,
          `-- Step 5: (Optional) Create fresh brand tracking`,
          `INSERT INTO "BrandTracking" ("id", "userId", "brandName", "displayName", "keywords", "isActive", "scanningEnabled", "scanInterval", "createdAt", "updatedAt")`,
          `VALUES (gen_random_uuid(), '${dbUser.id}', 'my-brand', 'My Brand', ARRAY['how to do seo'], true, true, 24, NOW(), NOW());`,
          ``,
          `-- Step 6: (Optional) Create fresh keyword tracking`,
          `INSERT INTO "KeywordTracking" ("id", "userId", "brandTrackingId", "keyword", "topic", "isActive", "createdAt", "updatedAt")`,
          `SELECT gen_random_uuid(), '${dbUser.id}', bt.id, 'how to do seo', 'how to do seo', true, NOW(), NOW()`,
          `FROM "BrandTracking" bt WHERE bt."userId" = '${dbUser.id}' LIMIT 1;`
        ]
      }

      return NextResponse.json({
        success: true,
        message: 'Manual cleanup queries generated',
        ...queries
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use: manual-queries' 
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Manual queries error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate manual queries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
