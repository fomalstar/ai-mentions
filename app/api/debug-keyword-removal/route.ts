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

    // Get the actual database user ID
    let dbUser
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true }
      })
      
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }
    } catch (userError) {
      return NextResponse.json({ error: 'Failed to find user in database' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const topic = searchParams.get('topic')

    if (!keyword || !topic) {
      return NextResponse.json({ error: 'Both keyword and topic parameters are required' }, { status: 400 })
    }

    // Decode URL-encoded parameters
    const decodedKeyword = decodeURIComponent(keyword)
    const decodedTopic = decodeURIComponent(topic)

    // Get all keywords for this user for debugging
    const allKeywords = await prisma.keywordTracking.findMany({
      where: { userId: dbUser.id },
      select: { 
        id: true, 
        keyword: true, 
        topic: true, 
        brandTrackingId: true,
        createdAt: true
      }
    })

    // Try to find the exact match
    const exactMatch = await prisma.keywordTracking.findFirst({
      where: {
        keyword: decodedKeyword.toLowerCase(),
        topic: decodedTopic.toLowerCase(),
        userId: dbUser.id
      }
    })

    // Try to find partial matches for debugging
    const keywordMatches = await prisma.keywordTracking.findMany({
      where: {
        keyword: {
          contains: decodedKeyword.toLowerCase()
        },
        userId: dbUser.id
      }
    })

    const topicMatches = await prisma.keywordTracking.findMany({
      where: {
        topic: {
          contains: decodedTopic.toLowerCase()
        },
        userId: dbUser.id
      }
    })

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          sessionId: session.user.id,
          dbId: dbUser.id,
          email: dbUser.email
        },
        searchParams: {
          originalKeyword: keyword,
          originalTopic: topic,
          decodedKeyword: decodedKeyword,
          decodedTopic: decodedTopic
        },
        matches: {
          exactMatch: exactMatch,
          keywordMatches: keywordMatches,
          topicMatches: topicMatches
        },
        allKeywords: allKeywords
      }
    })

  } catch (error) {
    console.error('Debug keyword removal error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

