import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Plan configurations
export const plans = {
  explorer: {
    name: 'Explorer',
    price: 2900, // $29.00 in cents
    interval: 'month',
    features: ['15 AI Keywords', '10 Reports', '1 Content Brief', 'Basic Support'],
    stripePriceId: 'price_explorer_monthly'
  },
  starter: {
    name: 'Starter',
    price: 7900, // $79.00 in cents
    interval: 'month',
    features: ['100 AI Keywords', '50 Reports', '10 Content Briefs', '3 Competitors', 'Email Support'],
    stripePriceId: 'price_starter_monthly'
  },
  pro: {
    name: 'Pro',
    price: 19900, // $199.00 in cents
    interval: 'month',
    features: ['500 AI Keywords', '200 Reports', '50 Content Briefs', '5 Competitors', 'Priority Support', '7-day Free Trial'],
    stripePriceId: 'price_pro_monthly',
    trialDays: 7
  },
  agency: {
    name: 'Agency',
    price: 49900, // $499.00 in cents
    interval: 'month',
    features: ['2,000 AI Keywords', '1,000 Reports', '200 Content Briefs', '10 Competitors', 'Dedicated Support', 'Custom Integrations'],
    stripePriceId: 'price_agency_monthly'
  }
}

// Create Stripe customer
export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'aimentions-app'
      }
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// Create checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  planType,
  successUrl,
  cancelUrl
}: {
  customerId: string
  priceId: string
  planType: string
  successUrl: string
  cancelUrl: string
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planType,
        customerId
      },
      subscription_data: {
        metadata: {
          planType,
          customerId
        },
        ...(planType === 'pro' && { trial_period_days: 7 })
      }
    })
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw error
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Update subscription
export async function updateSubscription(subscriptionId: string, priceId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionId,
          price: priceId,
        },
      ],
    })
    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Handle webhook events
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscriptionCreated.id)
        // Handle subscription creation
        break
        
      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscriptionUpdated.id)
        // Handle subscription updates
        break
        
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscriptionDeleted.id)
        // Handle subscription deletion
        break
        
      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object as Stripe.Invoice
        console.log('Payment succeeded:', invoiceSucceeded.id)
        // Handle successful payment
        break
        
      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice
        console.log('Payment failed:', invoiceFailed.id)
        // Handle failed payment
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event:', error)
    throw error
  }
}
