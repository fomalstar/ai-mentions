# 🚀 Stripe Payment System Setup Guide

## Overview

This guide will help you set up Stripe payments for your AI Mentions app. The payment system includes subscription management, billing portal, and webhook handling.

## Prerequisites

- Stripe account (sign up at [stripe.com](https://stripe.com))
- Your app deployed or running locally

## Step 1: Create Stripe Account & Get API Keys

### 1.1 Sign Up for Stripe
1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" and create your account
3. Complete the verification process

### 1.2 Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Create Products and Prices in Stripe

### 2.1 Create Products
1. Go to **Products** in your Stripe Dashboard
2. Create 4 products for your subscription plans:

#### Explorer Plan
- **Name**: Explorer
- **Description**: Perfect for students and hobbyists
- **Price**: $29/month

#### Starter Plan
- **Name**: Starter
- **Description**: Ideal for freelancers and small businesses
- **Price**: $79/month

#### Pro Plan
- **Name**: Pro
- **Description**: Most popular for marketing teams
- **Price**: $199/month
- **Trial**: 7 days

#### Agency Plan
- **Name**: Agency
- **Description**: For marketing agencies and large teams
- **Price**: $499/month

### 2.2 Create Recurring Prices
For each product, create a recurring price:
1. Click on the product
2. Click **Add price**
3. Set up as **Recurring** with monthly billing
4. Note the **Price ID** (starts with `price_`)

## Step 3: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_actual_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## Step 4: Update Stripe Configuration

Update `lib/stripe.ts` with your actual price IDs:

```typescript
export const plans = {
  explorer: {
    name: 'Explorer',
    price: 2900,
    interval: 'month',
    features: ['15 AI Keywords', '10 Reports', '1 Content Brief', 'Basic Support'],
    stripePriceId: 'price_your_explorer_price_id_here'
  },
  starter: {
    name: 'Starter',
    price: 7900,
    interval: 'month',
    features: ['100 AI Keywords', '50 Reports', '10 Content Briefs', '3 Competitors', 'Email Support'],
    stripePriceId: 'price_your_starter_price_id_here'
  },
  pro: {
    name: 'Pro',
    price: 19900,
    interval: 'month',
    features: ['500 AI Keywords', '200 Reports', '50 Content Briefs', '5 Competitors', 'Priority Support', '7-day Free Trial'],
    stripePriceId: 'price_your_pro_price_id_here',
    trialDays: 7
  },
  agency: {
    name: 'Agency',
    price: 49900,
    interval: 'month',
    features: ['2,000 AI Keywords', '1,000 Reports', '200 Content Briefs', '10 Competitors', 'Dedicated Support', 'Custom Integrations'],
    stripePriceId: 'price_your_agency_price_id_here'
  }
}
```

## Step 5: Set Up Webhooks

### 5.1 Create Webhook Endpoint
1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set **Endpoint URL** to: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 5.2 Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your environment variables

## Step 6: Test the Integration

### 6.1 Test Checkout
1. Start your development server: `npm run dev`
2. Go to `/pricing` page
3. Click "Get Started" on any plan
4. You should be redirected to Stripe Checkout

### 6.2 Test Webhooks (Local Development)
For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Step 7: Production Deployment

### 7.1 Update Environment Variables
When deploying to production:
1. Use live Stripe keys (not test keys)
2. Update `NEXTAUTH_URL` to your production domain
3. Set up production webhook endpoint

### 7.2 Render Deployment
For Render deployment, add these environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

## Step 8: Monitor and Test

### 8.1 Stripe Dashboard
Monitor your payments in the Stripe Dashboard:
- **Payments**: View successful and failed payments
- **Customers**: Manage customer information
- **Subscriptions**: Track active subscriptions
- **Webhooks**: Monitor webhook delivery

### 8.2 Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
- Check webhook endpoint URL is correct
- Verify webhook secret in environment variables
- Check server logs for errors

#### Checkout Not Working
- Verify Stripe keys are correct
- Check price IDs in `lib/stripe.ts`
- Ensure environment variables are loaded

#### Database Errors
- Run `npx prisma db push` to update schema
- Check database connection
- Verify Prisma client is generated

### Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** (already implemented)
4. **Use HTTPS** in production
5. **Regularly rotate API keys**

## Next Steps

After setting up Stripe:

1. **Test the complete flow** from signup to payment
2. **Set up email notifications** for payment events
3. **Implement usage tracking** based on subscription limits
4. **Add analytics** to track conversion rates
5. **Set up customer support** for billing issues

---

**Status**: Ready for Stripe integration! 🚀

Once you've completed this setup, your payment system will be fully functional with:
- ✅ Subscription management
- ✅ Secure payment processing
- ✅ Webhook handling
- ✅ Billing portal access
- ✅ Trial period support
