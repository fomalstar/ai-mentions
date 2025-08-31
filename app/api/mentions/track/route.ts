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
    keywords: [
      { keyword: 'ai marketing', isActive: true },
      { keyword: 'automation', isActive: true },
      { keyword: 'digital transformation', isActive: true }
    ],
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
