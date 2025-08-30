import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

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
      // Return demo subscription data
      return NextResponse.json({
        subscription: {
          id: 'demo-subscription',
          planType: 'pro',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trialEnd: null
        },
        usage: {
          aiKeywordsTracked: 12,
          aiKeywordsLimit: 500,
          reportsGenerated: 45,
          reportsLimit: 200,
          contentBriefs: 8,
          contentBriefsLimit: 50,
          competitorsTracked: 3,
          competitorsLimit: 5
        },
        demoMode: true
      })
    }

    // Get user's subscription and usage
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        aiKeywords: true,
        usageLogs: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = user.subscriptions[0] || null
    const planType = subscription?.planType || 'free'

    // Calculate usage based on plan limits
    const planLimits = {
      free: { aiKeywords: 3, reports: 5, contentBriefs: 0, competitors: 0 },
      explorer: { aiKeywords: 15, reports: 10, contentBriefs: 1, competitors: 0 },
      starter: { aiKeywords: 100, reports: 50, contentBriefs: 10, competitors: 3 },
      pro: { aiKeywords: 500, reports: 200, contentBriefs: 50, competitors: 5 },
      agency: { aiKeywords: 2000, reports: 1000, contentBriefs: 200, competitors: 10 }
    }

    const limits = planLimits[planType as keyof typeof planLimits]

    // Calculate current usage
    const aiKeywordsCount = user.aiKeywords.length
    const reportsCount = user.usageLogs.filter(log => log.actionType === 'keyword_analysis').length
    const contentBriefsCount = user.usageLogs.filter(log => log.actionType === 'content_brief').length
    const competitorsCount = user.usageLogs.filter(log => log.actionType === 'competitor_tracking').length

    const usage = {
      aiKeywordsTracked: aiKeywordsCount,
      aiKeywordsLimit: limits.aiKeywords,
      reportsGenerated: reportsCount,
      reportsLimit: limits.reports,
      contentBriefs: contentBriefsCount,
      contentBriefsLimit: limits.contentBriefs,
      competitorsTracked: competitorsCount,
      competitorsLimit: limits.competitors
    }

    return NextResponse.json({
      subscription,
      usage,
      demoMode: false
    })

  } catch (error) {
    console.error('Subscription retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve subscription' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType, stripeCustomerId } = await request.json()

    if (!planType || !['explorer', 'starter', 'pro', 'agency'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
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
        subscription: {
          id: 'demo-subscription-id',
          planType,
          status: 'active',
          stripeCustomerId: stripeCustomerId || 'demo-customer',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trialEnd: planType === 'pro' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        },
        demoMode: true
      })
    }

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        planType,
        status: 'active',
        stripeCustomerId: stripeCustomerId || null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: planType === 'pro' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
      },
      create: {
        userId: session.user.id,
        planType,
        status: 'active',
        stripeCustomerId: stripeCustomerId || null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: planType === 'pro' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
      }
    })

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionTier: planType }
    })

    return NextResponse.json({ success: true, subscription })

  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create subscription' 
    }, { status: 500 })
  }
}
