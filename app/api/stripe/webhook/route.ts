import { NextRequest, NextResponse } from 'next/server'
import { stripe, handleWebhookEvent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Check database availability
    let isDatabaseAvailable = false
    try {
      await prisma.$queryRaw`SELECT 1`
      isDatabaseAvailable = true
    } catch (error) {
      console.log('Database not available, webhook processing skipped')
      return NextResponse.json({ received: true })
    }

    if (!isDatabaseAvailable) {
      console.log('Database not available, webhook processing skipped')
      return NextResponse.json({ received: true })
    }

    // Handle the event
    await handleWebhookEvent(event)

    // Process specific events
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer
    const planType = subscription.metadata.planType

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        planType,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      },
      create: {
        userId: user.id,
        planType,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    })

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionTier: planType }
    })

    console.log('Subscription created for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer
    const planType = subscription.metadata.planType

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update subscription
    await prisma.subscription.updateMany({
      where: { userId: user.id },
      data: {
        planType,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    })

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionTier: planType }
    })

    console.log('Subscription updated for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update subscription status
    await prisma.subscription.updateMany({
      where: { userId: user.id },
      data: {
        status: 'canceled'
      }
    })

    // Update user's subscription tier to free
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionTier: 'free' }
    })

    console.log('Subscription deleted for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const customerId = invoice.customer
    console.log('Payment succeeded for customer:', customerId)
    // Add any payment success logic here
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer
    console.log('Payment failed for customer:', customerId)
    // Add any payment failure logic here (e.g., send notification)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
