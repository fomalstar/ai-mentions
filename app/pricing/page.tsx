'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap, Users, Target, FileText, AlertCircle } from "lucide-react"
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

const plans = [
  {
    name: 'Explorer',
    price: '$29',
    description: 'Perfect for students and hobbyists',
    features: [
      '15 AI Keywords Tracked',
      '10 AI Keyword Reports / Month',
      '1 Content Brief / Month',
      'Basic Support',
      'Email Support'
    ],
    popular: false,
    trial: false,
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'Starter',
    price: '$79',
    description: 'Ideal for freelancers and small businesses',
    features: [
      '100 AI Keywords Tracked',
      '50 AI Keyword Reports / Month',
      '10 Content Briefs / Month',
      '3 Competitors / Keyword',
      'Email Support',
      'Priority Support'
    ],
    popular: false,
    trial: false,
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-green-100 text-green-800'
  },
  {
    name: 'Pro',
    price: '$199',
    description: 'Most popular for marketing teams',
    features: [
      '500 AI Keywords Tracked',
      '200 AI Keyword Reports / Month',
      '50 Content Briefs / Month',
      '5 Competitors / Keyword',
      'Priority Support',
      '7-day Free Trial',
      'Advanced Analytics',
      'API Access'
    ],
    popular: true,
    trial: true,
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    name: 'Agency',
    price: '$499',
    description: 'For marketing agencies and large teams',
    features: [
      '2,000 AI Keywords Tracked',
      '1,000 AI Keyword Reports / Month',
      '200 Content Briefs / Month',
      '10 Competitors / Keyword',
      'Dedicated Support',
      'Custom Integrations',
      'White-label Options',
      'Team Management',
      'Advanced Reporting'
    ],
    popular: false,
    trial: false,
    color: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800'
  }
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle URL parameters for success/cancel
  useEffect(() => {
    if (isClient) {
      const success = searchParams.get('success')
      const canceled = searchParams.get('canceled')
      const plan = searchParams.get('plan')

      if (success && plan) {
        toast.success(`Successfully subscribed to ${plan} plan!`)
        router.push('/dashboard')
      } else if (canceled) {
        toast.info('Subscription was canceled')
      }
    }
  }, [isClient, searchParams, router])

  const handleSubscribe = async (planName: string) => {
    if (!session) {
      toast.error('Please sign in to subscribe')
      router.push('/auth/signin')
      return
    }

    setIsLoading(planName)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planName.toLowerCase()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.demoMode) {
          toast.success(`Demo mode: Would redirect to ${planName} checkout`)
          router.push(data.url)
        } else {
          // Redirect to Stripe checkout
          window.location.href = data.url
        }
      } else {
        toast.error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout')
    } finally {
      setIsLoading(null)
    }
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our AI keyword research tool and scale as you grow. 
            All plans include our core features with different usage limits.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  <strong>Demo Mode:</strong> This is a demo environment. In production, you would be redirected to Stripe for secure payment processing.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.color} hover:shadow-lg transition-shadow duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.trial && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                    Free Trial
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isLoading === plan.name}
                >
                  {isLoading === plan.name ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {plan.trial ? 'Start Free Trial' : 'Get Started'}
                      {plan.popular && <Crown className="w-4 h-4 ml-2" />}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">Yes, the Pro plan includes a 7-day free trial. No credit card required to start.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards through our secure Stripe payment processor.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">Absolutely. You can cancel your subscription at any time with no cancellation fees.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of marketers who are already using AI keyword research to boost their visibility.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push('/auth/signin')}
              >
                Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
