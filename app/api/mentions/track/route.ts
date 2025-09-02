import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Track route called')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.log('❌ No valid session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', session.user.id)

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

    const { brandName, keywords, topics, competitors } = await request.json()
    
    if (!brandName || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Brand name and keywords are required' }, { status: 400 })
    }

    if (!topics || !Array.isArray(topics) || topics.length !== keywords.length) {
      return NextResponse.json({ error: 'Topics array must match keywords array' }, { status: 400 })
    }

    // Check if database is available
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      // Return demo data for testing
      return NextResponse.json({
        success: true,
        demoMode: true,
        tracking: {
          brandName,
          keywords,
          competitors: competitors || [],
          status: 'active',
          mentions: generateDemoMentions(brandName, keywords),
          sentiment: {
            positive: Math.floor(Math.random() * 60) + 20,
            neutral: Math.floor(Math.random() * 30) + 10,
            negative: Math.floor(Math.random() * 20) + 5
          }
        }
      })
    }

    console.log('🔄 Creating/updating brand tracking for:', { userId: dbUser.id, brandName, keywords, topics })
    
    // Create or update brand tracking
    let tracking
    try {
      tracking = await prisma.brandTracking.upsert({
        where: { 
          userId_brandName: {
            userId: dbUser.id,
            brandName: brandName.toLowerCase()
          }
        },
        update: {
          keywords,
          competitors: competitors || [],
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId: dbUser.id,
          brandName: brandName.toLowerCase(),
          displayName: brandName,
          keywords,
          competitors: competitors || [],
          isActive: true
        }
      })
      
      console.log('✅ Brand tracking created/updated:', tracking.id)
    } catch (upsertError) {
      console.error('❌ Brand tracking upsert failed:', upsertError)
      throw new Error(`Failed to create/update brand tracking: ${upsertError instanceof Error ? upsertError.message : 'Unknown error'}`)
    }

    // Create tracking keywords with topics
    console.log('🔄 Creating keyword tracking entries...')
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i]
      const topic = topics[i]
      
      try {
        await prisma.keywordTracking.upsert({
          where: {
            brandTrackingId_keyword: {
              brandTrackingId: tracking.id,
              keyword: keyword.toLowerCase()
            }
          },
          update: {
            topic: topic,
            isActive: true,
            updatedAt: new Date()
          },
          create: {
            userId: dbUser.id,
            brandTrackingId: tracking.id,
            keyword: keyword.toLowerCase(),
            topic: topic,
            isActive: true
          }
        })
        
        console.log(`✅ Keyword tracking created for: ${keyword}`)
      } catch (keywordError) {
        console.error(`❌ Failed to create keyword tracking for ${keyword}:`, keywordError)
        throw new Error(`Failed to create keyword tracking: ${keywordError instanceof Error ? keywordError.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      tracking: {
        id: tracking.id,
        brandName: tracking.displayName,
        keywords: tracking.keywords,
        competitors: tracking.competitors,
        status: tracking.isActive ? 'active' : 'inactive',
        createdAt: tracking.createdAt,
        updatedAt: tracking.updatedAt
      }
    })

  } catch (error) {
    console.error('Brand tracking error:', error)
    return NextResponse.json({ 
      error: 'Failed to set up brand tracking' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')
    const keywordId = searchParams.get('keywordId')
    const keyword = searchParams.get('keyword')
    const topic = searchParams.get('topic')

    // Check if database is available
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
      return NextResponse.json({ 
        success: true, 
        message: 'Demo mode - operation completed in memory',
        demoMode: true
      })
    }

    if (keyword && topic) {
      // Delete specific keyword-topic combination from keywordTracking
      console.log(`🗑️ Deleting keyword-topic combination: ${keyword} - ${topic} from keyword tracking`)
      console.log(`🔍 Search params: keyword=${keyword}, topic=${topic}, userId=${dbUser.id}`)
      
      try {
        // Find the keyword-topic combination by text and user ID
        const keywordRecord = await prisma.keywordTracking.findFirst({
          where: {
            keyword: keyword.toLowerCase(),
            topic: topic.toLowerCase(),
            userId: dbUser.id
          },
          include: {
            brandTracking: true
          }
        })

        if (!keywordRecord) {
          console.log(`❌ Keyword-topic combination not found: ${keyword} - ${topic} for user: ${dbUser.id}`)
          console.log(`🔍 Available keywords for user:`, await prisma.keywordTracking.findMany({
            where: { userId: dbUser.id },
            select: { id: true, keyword: true, topic: true, brandTrackingId: true }
          }))
          return NextResponse.json({ error: 'Keyword-topic combination not found or access denied' }, { status: 404 })
        }

        // Delete the keyword-topic combination using the found record's ID
        await prisma.keywordTracking.delete({
          where: {
            id: keywordRecord.id,
            userId: dbUser.id
          }
        })

        // Update the brand tracking keywords array to remove this keyword
        const updatedKeywords = keywordRecord.brandTracking.keywords.filter(k => k !== keyword)
        await prisma.brandTracking.update({
          where: {
            id: keywordRecord.brandTrackingId,
            userId: dbUser.id
          },
          data: {
            keywords: updatedKeywords
          }
        })

        console.log(`✅ Keyword-topic combination deleted successfully: ${keyword} - ${topic}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Keyword-topic combination deleted successfully' 
        })

      } catch (deleteError) {
        console.error('❌ Failed to delete keyword-topic combination:', deleteError)
        return NextResponse.json({ 
          error: 'Failed to delete keyword-topic combination',
          details: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }, { status: 500 })
      }
    } else if (keywordId && keyword) {
      // Delete specific keyword from keywordTracking (legacy support)
      console.log(`🗑️ Deleting keyword: ${keyword} from keyword tracking`)
      console.log(`🔍 Search params: keywordId=${keywordId}, keyword=${keyword}, userId=${dbUser.id}`)
      
      try {
        // Find the keyword by text and user ID, since frontend sends timestamp IDs that don't exist in database
        const keywordRecord = await prisma.keywordTracking.findFirst({
          where: {
            keyword: keyword.toLowerCase(),
            userId: dbUser.id
          },
          include: {
            brandTracking: true
          }
        })

        if (!keywordRecord) {
          console.log(`❌ Keyword not found: ${keyword} for user: ${dbUser.id}`)
          console.log(`🔍 Available keywords for user:`, await prisma.keywordTracking.findMany({
            where: { userId: dbUser.id },
            select: { id: true, keyword: true, brandTrackingId: true }
          }))
          return NextResponse.json({ error: 'Keyword not found or access denied' }, { status: 404 })
        }

        // Delete the keyword using the found record's ID
        await prisma.keywordTracking.delete({
          where: {
            id: keywordRecord.id,
            userId: dbUser.id
          }
        })

        // Update the brand tracking keywords array to remove this keyword
        const updatedKeywords = keywordRecord.brandTracking.keywords.filter(k => k !== keyword)
        await prisma.brandTracking.update({
          where: {
            id: keywordRecord.brandTrackingId,
            userId: dbUser.id
          },
          data: {
            keywords: updatedKeywords
          }
        })

        console.log(`✅ Keyword deleted successfully: ${keyword}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Keyword deleted successfully' 
        })

      } catch (deleteError) {
        console.error('❌ Failed to delete keyword:', deleteError)
        return NextResponse.json({ 
          error: 'Failed to delete keyword',
          details: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }, { status: 500 })
      }

    } else if (id) {
      // Delete entire brand tracking record (existing functionality)
      console.log(`🗑️ Deleting brand tracking: ${id}`)
      
      try {
        // First verify the brand tracking record belongs to this user
        const brandTracking = await prisma.brandTracking.findFirst({
          where: {
            id: id,
            userId: dbUser.id
          }
        })

        if (!brandTracking) {
          return NextResponse.json({ error: 'Brand tracking not found or access denied' }, { status: 404 })
        }

        // Delete the brand tracking record (cascade will handle related data)
        await prisma.brandTracking.delete({
          where: {
            id: id,
            userId: dbUser.id
          }
        })

        console.log(`✅ Brand tracking deleted successfully: ${id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Project deleted successfully' 
        })

      } catch (deleteError) {
        console.error('❌ Failed to delete brand tracking:', deleteError)
        return NextResponse.json({ 
          error: 'Failed to delete project',
          details: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }, { status: 500 })
      }

    } else {
      return NextResponse.json({ 
        error: 'Either id (for entire project), keyword+topic (for specific keyword-topic combination), or keywordId+keyword (for specific keyword) is required' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brand')

    // Check if database is available
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
        tracking: brandName ? generateDemoTracking(brandName) : generateDemoTrackingList(),
        demoMode: true
      })
    }

    if (brandName) {
      // Get specific brand tracking
      const tracking = await prisma.brandTracking.findFirst({
        where: {
          userId: session.user.id,
          brandName: brandName.toLowerCase()
        },
        include: {
          keywords: true,
          mentions: {
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      })

      if (!tracking) {
        return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
      }

      return NextResponse.json({ tracking })
    } else {
      // Get all brand tracking for user
      const tracking = await prisma.brandTracking.findMany({
        where: { userId: session.user.id },
        include: {
          keywords: true,
          _count: {
            select: { mentions: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return NextResponse.json({ tracking })
    }

  } catch (error) {
    console.error('Get tracking error:', error)
    return NextResponse.json({ 
      error: 'Failed to get brand tracking' 
    }, { status: 500 })
  }
}

function generateDemoMentions(brandName: string, keywords: string[]) {
  const mentions = []
  const sources = ['ChatGPT', 'Claude', 'Gemini', 'Bard']
  const sentiments = ['positive', 'neutral', 'negative']
  
  for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    mentions.push({
      id: `demo-${i}`,
      keyword,
      brandName,
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      responseText: `This is a demo mention of ${brandName} in relation to ${keyword}.`,
      confidence: Math.random() * 0.3 + 0.7,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    })
  }
  
  return mentions
}

function generateDemoTracking(brandName: string) {
  return {
    id: 'demo-tracking',
    brandName: brandName.toLowerCase(),
    displayName: brandName,
    keywords: ['ai marketing', 'automation', 'digital transformation'],
    competitors: ['Competitor A', 'Competitor B'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    mentions: generateDemoMentions(brandName, ['ai marketing', 'automation', 'digital transformation'])
  }
}

function generateDemoTrackingList() {
  return [
    {
      id: 'demo-1',
      brandName: 'techcorp',
      displayName: 'TechCorp',
      keywords: [{ keyword: 'ai marketing', isActive: true }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { mentions: 15 }
    },
    {
      id: 'demo-2',
      brandName: 'innovateai',
      displayName: 'InnovateAI',
      keywords: [{ keyword: 'automation', isActive: true }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { mentions: 8 }
    }
  ]
}
