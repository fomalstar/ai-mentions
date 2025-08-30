import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicName, brandName } = await request.json()

    if (!topicName?.trim() || !brandName?.trim()) {
      return NextResponse.json({ error: 'Topic name and brand name are required' }, { status: 400 })
    }

    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      // Return demo data
      return NextResponse.json({
        success: true,
        topic: {
          id: 'demo-topic-id',
          topicName: topicName.trim(),
          brandName: brandName.trim(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        demoMode: true
      })
    }

    // Check user's subscription tier and topic limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { topics: true }
    })

    if (user) {
      const activeTopics = user.topics.filter(t => t.isActive).length
      
      // Check topic limits based on subscription tier
      const limits = {
        free: 3,
        explorer: 5,
        starter: 10,
        pro: 25,
        agency: 100
      }

      const userLimit = limits[user.subscriptionTier as keyof typeof limits] || 3
      
      if (activeTopics >= userLimit) {
        return NextResponse.json({ 
          error: `Topic limit reached (${activeTopics}/${userLimit}). Please upgrade your plan.` 
        }, { status: 429 })
      }
    }

    // Create or update topic
    const topic = await prisma.topic.upsert({
      where: {
        userId_topicName_brandName: {
          userId: session.user.id,
          topicName: topicName.trim(),
          brandName: brandName.trim()
        }
      },
      update: {
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        topicName: topicName.trim(),
        brandName: brandName.trim(),
        isActive: true
      }
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        userId: session.user.id,
        actionType: 'topic_tracking',
        usageCount: 1,
        metadata: { topicName: topicName.trim(), brandName: brandName.trim() }
      }
    })

    return NextResponse.json({ success: true, topic })

  } catch (error) {
    console.error('Topic tracking error:', error)
    return NextResponse.json({ 
      error: 'Failed to track topic' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      // Return demo data
      return NextResponse.json({
        topics: generateDemoTopics(),
        demoMode: true
      })
    }

    const topics = await prisma.topic.findMany({
      where: { userId: session.user.id },
      include: {
        brandMentions: {
          orderBy: { mentionDate: 'desc' },
          take: 5
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ topics, demoMode: false })

  } catch (error) {
    console.error('Topic retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve topics' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId, isActive } = await request.json()

    if (topicId === undefined || isActive === undefined) {
      return NextResponse.json({ error: 'Topic ID and active status are required' }, { status: 400 })
    }

    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      return NextResponse.json({ 
        success: true, 
        message: 'Demo mode - topic status updated in memory',
        demoMode: true
      })
    }

    const topic = await prisma.topic.update({
      where: { 
        id: topicId,
        userId: session.user.id // Ensure user owns the topic
      },
      data: { isActive }
    })

    return NextResponse.json({ success: true, topic })

  } catch (error) {
    console.error('Topic update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update topic' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('id')

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      return NextResponse.json({ 
        success: true, 
        message: 'Demo mode - topic deleted from memory',
        demoMode: true
      })
    }

    // Delete topic and all related brand mentions
    await prisma.topic.delete({
      where: { 
        id: topicId,
        userId: session.user.id // Ensure user owns the topic
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Topic deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete topic' 
    }, { status: 500 })
  }
}

function generateDemoTopics() {
  return [
    {
      id: 'demo-1',
      topicName: 'project management software',
      brandName: 'FlowTask',
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      brandMentions: [
        {
          id: 'mention-1',
          mentionDate: new Date().toISOString(),
          source: 'ChatGPT',
          responseText: 'FlowTask is an excellent project management solution for small teams...'
        }
      ]
    },
    {
      id: 'demo-2',
      topicName: 'AI marketing tools',
      brandName: 'FlowTask',
      isActive: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      brandMentions: []
    },
    {
      id: 'demo-3',
      topicName: 'team collaboration platforms',
      brandName: 'FlowTask',
      isActive: false,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      brandMentions: []
    }
  ]
}
