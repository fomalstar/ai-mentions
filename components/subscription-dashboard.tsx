'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  CreditCard, 
  BarChart3, 
  Target, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap
} from "lucide-react"
import { toast } from 'sonner'

interface Subscription {
  id: string
  planType: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
}

interface Usage {
  aiKeywordsTracked: number
  aiKeywordsLimit: number
  reportsGenerated: number
  reportsLimit: number
  contentBriefs: number
  contentBriefsLimit: number
  competitorsTracked: number
  competitorsLimit: number
}

interface SubscriptionData {
  subscription: Subscription | null
  usage: Usage
  demoMode: boolean
}

const planDetails = {
  free: {
    name: 'Free',
    price: '$0',
    description: 'Basic access to AI keyword research',
    features: ['3 AI Keywords', '5 Reports', 'Basic Analytics'],
    color: 'bg-gray-100 text-gray-800'
  },
  explorer: {
    name: 'Explorer',
    price: '$29',
    description: 'Perfect for students and hobbyists',
    features: ['15 AI Keywords', '10 Reports', '1 Content Brief', 'Basic Support'],
    color: 'bg-blue-100 text-blue-800'
  },
  starter: {
    name: 'Starter',
    price: '$79',
    description: 'Ideal for freelancers and small businesses',
    features: ['100 AI Keywords', '50 Reports', '10 Content Briefs', '3 Competitors', 'Email Support'],
    color: 'bg-green-100 text-green-800'
  },
  pro: {
    name: 'Pro',
    price: '$199',
    description: 'Most popular for marketing teams',
    features: ['500 AI Keywords', '200 Reports', '50 Content Briefs', '5 Competitors', 'Priority Support', '7-day Free Trial'],
    color: 'bg-purple-100 text-purple-800'
  },
  agency: {
    name: 'Agency',
    price: '$499',
    description: 'For marketing agencies and large teams',
    features: ['2,000 AI Keywords', '1,000 Reports', '200 Content Briefs', '10 Competitors', 'Dedicated Support', 'Custom Integrations'],
    color: 'bg-orange-100 text-orange-800'
  }
}

export function SubscriptionDashboard() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    loadSubscriptionData()
  }, [isClient])

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const subscriptionData = await response.json()
        setData(subscriptionData)
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPlanInfo = (planType: string) => {
    return planDetails[planType as keyof typeof planDetails] || planDetails.free
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Unable to load subscription data</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  const { subscription, usage, demoMode } = data
  const currentPlan = subscription?.planType || 'free'
  const planInfo = getPlanInfo(currentPlan)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription & Billing</h2>
          <p className="text-muted-foreground">
            Manage your subscription plan and track usage
          </p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Billing
        </Button>
      </div>

      {/* Demo Mode Notice */}
      {demoMode && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                <strong>Demo Mode:</strong> You're viewing sample subscription data. Set up your database to track real usage.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={planInfo.color}>
                  {planInfo.name}
                </Badge>
                <span className="text-2xl font-bold">{planInfo.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-4">{planInfo.description}</p>
              
              {/* Trial Status */}
              {subscription?.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Free trial ends {new Date(subscription.trialEnd).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Billing Period */}
              {subscription && (
                <div className="text-sm text-muted-foreground">
                  Billing period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <Button variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your usage across all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Keywords */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">AI Keywords Tracked</span>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.aiKeywordsTracked, usage.aiKeywordsLimit))}`}>
                  {usage.aiKeywordsTracked} / {usage.aiKeywordsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.aiKeywordsTracked, usage.aiKeywordsLimit)} className="h-2" />
            </div>

            {/* Reports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Reports Generated</span>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.reportsGenerated, usage.reportsLimit))}`}>
                  {usage.reportsGenerated} / {usage.reportsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.reportsGenerated, usage.reportsLimit)} className="h-2" />
            </div>

            {/* Content Briefs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Content Briefs</span>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.contentBriefs, usage.contentBriefsLimit))}`}>
                  {usage.contentBriefs} / {usage.contentBriefsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.contentBriefs, usage.contentBriefsLimit)} className="h-2" />
            </div>

            {/* Competitors */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Competitors Tracked</span>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.competitorsTracked, usage.competitorsLimit))}`}>
                  {usage.competitorsTracked} / {usage.competitorsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.competitorsTracked, usage.competitorsLimit)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            What's included in your {planInfo.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {currentPlan !== 'agency' && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Ready to scale up?</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade your plan to unlock more features and higher limits
              </p>
              <Button size="lg">
                <Crown className="w-4 h-4 mr-2" />
                View All Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
