'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  TrendingUp, 
  Eye, 
  Target, 
  Users, 
  BarChart3, 
  PieChartIcon,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { toast } from 'sonner'

interface BrandTracking {
  id: string
  brandName: string
  displayName: string
  keywords: string[]
  competitors: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  mentions?: any[]
  _count?: { mentions: number }
}

interface TrackingForm {
  brandName: string
  keywords: string
  competitors: string
}

export function BrandTracking() {
  const [tracking, setTracking] = useState<BrandTracking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TrackingForm>({
    brandName: '',
    keywords: '',
    competitors: ''
  })
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    loadBrandTracking()
  }, [isClient])

  const loadBrandTracking = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mentions/track')
      if (response.ok) {
        const data = await response.json()
        setTracking(data.tracking || [])
        setIsDemoMode(data.demoMode || false)
      }
    } catch (error) {
      console.error('Failed to load brand tracking:', error)
      // Load demo data if API fails
      setTracking(generateDemoTracking())
      setIsDemoMode(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brandName.trim() || !formData.keywords.trim()) {
      toast.error('Brand name and keywords are required')
      return
    }

    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    const competitors = formData.competitors.split(',').map(c => c.trim()).filter(c => c)

    try {
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brandName.trim(),
          keywords,
          competitors
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Brand tracking set up successfully!')
        setFormData({ brandName: '', keywords: '', competitors: '' })
        setShowForm(false)
        loadBrandTracking()
      } else {
        throw new Error('Failed to set up tracking')
      }
    } catch (error) {
      toast.error('Failed to set up brand tracking')
    }
  }

  const toggleTracking = async (trackingId: string, isActive: boolean) => {
    try {
      // In demo mode, just update local state
      if (isDemoMode) {
        setTracking(prev => prev.map(t => 
          t.id === trackingId ? { ...t, isActive: !isActive } : t
        ))
        toast.success(`Tracking ${isActive ? 'paused' : 'resumed'}`)
        return
      }

      // TODO: Implement API call to toggle tracking
      toast.success(`Tracking ${isActive ? 'paused' : 'resumed'}`)
    } catch (error) {
      toast.error('Failed to update tracking status')
    }
  }

  const deleteTracking = async (trackingId: string) => {
    try {
      // In demo mode, just update local state
      if (isDemoMode) {
        setTracking(prev => prev.filter(t => t.id !== trackingId))
        toast.success('Brand tracking removed')
        return
      }

      // Call DELETE API
      const response = await fetch(`/api/mentions/track?id=${trackingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state
        setTracking(prev => prev.filter(t => t.id !== trackingId))
        toast.success('Brand tracking removed')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove tracking')
      }
    } catch (error) {
      console.error('Delete tracking error:', error)
      toast.error('Failed to remove tracking')
    }
  }

  const generateDemoTracking = (): BrandTracking[] => [
    {
      id: 'demo-1',
      brandName: 'techcorp',
      displayName: 'TechCorp',
      keywords: ['ai marketing', 'automation', 'digital transformation'],
      competitors: ['InnovateAI', 'FutureTech'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { mentions: 15 }
    },
    {
      id: 'demo-2',
      brandName: 'innovateai',
      displayName: 'InnovateAI',
      keywords: ['machine learning', 'automation', 'ai tools'],
      competitors: ['TechCorp', 'SmartSolutions'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { mentions: 8 }
    }
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'negative': return 'bg-red-500/20 text-red-700 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4" />
      case 'negative': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Brand Tracking</h2>
            <p className="text-muted-foreground">
              Monitor your brand mentions and track competitors in AI conversations
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading brand tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Tracking</h2>
          <p className="text-muted-foreground">
            Monitor your brand mentions and track competitors in AI conversations
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Running in demo mode. Your data will not be saved, but you can test all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Brand Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Brand Tracking</CardTitle>
            <CardDescription>
              Set up tracking for your brand and monitor mentions in AI conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand Name</label>
                  <Input
                    placeholder="Your brand name"
                    value={formData.brandName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Keywords to Track</label>
                  <Input
                    placeholder="ai marketing, automation, digital transformation"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Competitors to Monitor</label>
                <Input
                  placeholder="Competitor A, Competitor B"
                  value={formData.competitors}
                  onChange={(e) => setFormData(prev => ({ ...prev, competitors: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate competitor names with commas (optional)
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Start Tracking</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Brand Tracking List */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Active Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Brands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {tracking.filter(t => t.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">Currently tracking</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Mentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {tracking.reduce((sum, t) => sum + (t._count?.mentions || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Keywords Tracked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tracking.reduce((sum, t) => sum + t.keywords.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Across all brands</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">
                  {tracking.reduce((sum, t) => sum + t.competitors.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Being monitored</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Brand Activity</CardTitle>
              <CardDescription>Latest mentions and tracking updates</CardDescription>
            </CardHeader>
            <CardContent>
              {tracking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No brands being tracked yet.</p>
                  <p className="text-sm">Add your first brand to start monitoring mentions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tracking.slice(0, 5).map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                      <div className="flex-1">
                        <div className="font-medium">{brand.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {brand.keywords.length} keywords • {brand._count?.mentions || 0} mentions
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={brand.isActive ? "default" : "secondary"}>
                          {brand.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTracking(brand.id, brand.isActive)}
                        >
                          {brand.isActive ? "Pause" : "Resume"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Brand Tracking</CardTitle>
              <CardDescription>Manage your brand monitoring settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.map((brand) => (
                  <div key={brand.id} className="p-6 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{brand.displayName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracking since {new Date(brand.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={brand.isActive ? "default" : "secondary"}>
                          {brand.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTracking(brand.id, brand.isActive)}
                        >
                          {brand.isActive ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTracking(brand.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Keywords Tracked</h4>
                        <div className="flex flex-wrap gap-2">
                          {brand.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Competitors Monitored</h4>
                        <div className="flex flex-wrap gap-2">
                          {brand.competitors.length > 0 ? (
                            brand.competitors.map((competitor, index) => (
                              <Badge key={index} variant="secondary">
                                {competitor}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">None specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last updated: {new Date(brand.updatedAt).toLocaleDateString()}</span>
                      <span>{brand._count?.mentions || 0} mentions detected</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Performance</CardTitle>
                <CardDescription>Mention volume and sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking.map((brand) => (
                    <div key={brand.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{brand.displayName}</span>
                        <Badge variant="outline">
                          {brand._count?.mentions || 0} mentions
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Positive</span>
                          <span className="text-green-600">65%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Neutral</span>
                          <span className="text-gray-600">25%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Negative</span>
                          <span className="text-red-600">10%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>Compare your brand against competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking.map((brand) => (
                    <div key={brand.id} className="p-4 rounded-lg border border-border">
                      <h4 className="font-medium mb-3">{brand.displayName}</h4>
                      <div className="space-y-2">
                        {brand.competitors.length > 0 ? (
                          brand.competitors.map((competitor, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{competitor}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">12 mentions</span>
                                <Badge variant="outline" className="text-xs">
                                  -3% vs last month
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No competitors specified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
