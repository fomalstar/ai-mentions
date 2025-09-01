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

    console.log('🧹 Cleaning up corrupted projects for user:', dbUser.id)

    // Find all brand tracking for this user
    const brandTrackings = await prisma.brandTracking.findMany({
      where: { userId: dbUser.id },
      include: {
        keywordTracking: true
      }
    })

    console.log(`Found ${brandTrackings.length} brand tracking entries`)

    let deletedCount = 0

    // Delete corrupted/problematic projects
    for (const brand of brandTrackings) {
      // Check for corrupted keywords like "ergerg", "tewgw", etc.
      const hasCorruptedKeywords = brand.keywords.some(keyword => 
        ['ergerg', 'tewgw', 'gerg', 'google', 'new schedule', ''].includes(keyword.toLowerCase())
      )

      const hasCorruptedTopics = brand.keywordTracking.some(kw => 
        ['ergerg', 'tewgw', 'gerg', ''].includes(kw.topic.toLowerCase()) ||
        kw.topic.trim() === ''
      )

      if (hasCorruptedKeywords || hasCorruptedTopics) {
        console.log(`🗑️ Deleting corrupted project: ${brand.displayName} (${brand.id})`)
        
        try {
          await prisma.brandTracking.delete({
            where: { id: brand.id }
          })
          deletedCount++
          console.log(`✅ Deleted: ${brand.displayName}`)
        } catch (deleteError) {
          console.error(`❌ Failed to delete ${brand.displayName}:`, deleteError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} corrupted projects`,
      deletedCount,
      totalChecked: brandTrackings.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return NextResponse.json({ 
      error: 'Failed to cleanup old projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
