import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createBillingPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, running in demo mode')
    }

    if (!isDatabaseAvailable) {
      // Return demo billing portal
      return NextResponse.json({
        url: `${baseUrl}/dashboard?demo=billing`,
        demoMode: true
      })
    }

    // Get user with Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No billing account found. Please subscribe to a plan first.' 
      }, { status: 400 })
    }

    // Create billing portal session
    const billingPortalSession = await createBillingPortalSession(
      user.stripeCustomerId,
      `${baseUrl}/dashboard`
    )

    return NextResponse.json({ url: billingPortalSession.url })

  } catch (error) {
    console.error('Billing portal session creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create billing portal session' 
    }, { status: 500 })
  }
}
