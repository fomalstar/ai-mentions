import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { stripe, createStripeCustomer, createCheckoutSession, plans } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()

    if (!planType || !plans[planType as keyof typeof plans]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const plan = plans[planType as keyof typeof plans]
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
      // Return demo checkout session
      return NextResponse.json({
        url: `${baseUrl}/dashboard?demo=checkout&plan=${planType}`,
        demoMode: true
      })
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscriptions: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await createStripeCustomer(user.email!, user.name || undefined)
      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id }
      })
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId: plan.stripePriceId,
      planType,
      successUrl: `${baseUrl}/dashboard?success=true&plan=${planType}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}
