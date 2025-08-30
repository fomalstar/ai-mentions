'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Users,
  Activity,
  Zap
} from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { toast } from 'sonner'

interface KeywordData {
  keyword: string
  searchVolume: number
  monthlyGrowth: number
  competition: 'low' | 'medium' | 'high'
  cpc: number
  trendData: {
    month: string
    volume: number
  }[]
  relatedKeywords: {
    keyword: string
    volume: number
    growth: number
  }[]
  searchIntent: 'informational' | 'navigational' | 'commercial' | 'transactional'
  seasonality: {
    peak: string
    low: string
    seasonal: boolean
  }
}

export default function KeywordResearch() {
  const { data: session, status } = useSession()
  const [keyword, setKeyword] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const analyzeKeyword = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Demo data
      const demoData: KeywordData = {
        keyword: keyword.trim(),
        searchVolume: Math.floor(Math.random() * 50000) + 1000,
        monthlyGrowth: Math.floor(Math.random() * 100) - 20, // -20 to +80
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        cpc: Math.random() * 5 + 0.5,
        trendData: [
          { month: 'Jan', volume: Math.floor(Math.random() * 50000) + 1000 },
          { month: 'Feb', volume: Math.floor(Math.random() * 50000) + 1000 },
          { month: 'Mar', volume: Math.floor(Math.random() * 50000) + 1000 },
          { month: 'Apr', volume: Math.floor(Math.random() * 50000) + 1000 },
          { month: 'May', volume: Math.floor(Math.random() * 50000) + 1000 },
          { month: 'Jun', volume: Math.floor(Math.random() * 50000) + 1000 },
        ],
        relatedKeywords: [
          { keyword: `${keyword} guide`, volume: Math.floor(Math.random() * 20000) + 500, growth: Math.floor(Math.random() * 50) },
          { keyword: `${keyword} tutorial`, volume: Math.floor(Math.random() * 15000) + 300, growth: Math.floor(Math.random() * 50) },
          { keyword: `best ${keyword}`, volume: Math.floor(Math.random() * 25000) + 800, growth: Math.floor(Math.random() * 50) },
          { keyword: `${keyword} examples`, volume: Math.floor(Math.random() * 12000) + 200, growth: Math.floor(Math.random() * 50) },
        ],
        searchIntent: ['informational', 'navigational', 'commercial', 'transactional'][Math.floor(Math.random() * 4)] as any,
        seasonality: {
          peak: 'December',
          low: 'July',
          seasonal: Math.random() > 0.5
        }
      }
      
      setKeywordData(demoData)
      toast.success('Keyword analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze keyword')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading keyword research tool...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Sign in to access Keyword Research</h1>
          <p className="text-muted-foreground mb-6">
            Get detailed keyword volume statistics and search insights.
          </p>
          <Button 
            onClick={() => setIsAuthModalOpen(true)} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Sign In to Continue
          </Button>
        </div>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="aurora-bg">
        <div className="aurora-tertiary" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Keyword Research Tool
              </h1>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Keyword Volume Research
            </CardTitle>
            <CardDescription>
              Research any keyword to get detailed volume statistics, trends, and competitive insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Enter a keyword to research (e.g., AI tools, project management, marketing automation)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeKeyword()}
                />
              </div>
              <Button 
                onClick={analyzeKeyword}
                disabled={isAnalyzing || !keyword.trim()}
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Research Keyword
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {keywordData && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {keywordData.searchVolume.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Search Volume</p>
                    </div>
                    <Users className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-accent flex items-center gap-1">
                        {keywordData.monthlyGrowth > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : keywordData.monthlyGrowth < 0 ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        {Math.abs(keywordData.monthlyGrowth)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Growth</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        ${keywordData.cpc.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Avg. Cost Per Click</p>
                    </div>
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge 
                        variant={
                          keywordData.competition === 'low' ? 'default' : 
                          keywordData.competition === 'medium' ? 'secondary' : 'destructive'
                        }
                        className="text-lg px-3 py-1"
                      >
                        {keywordData.competition}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Competition</p>
                    </div>
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Search Trends</TabsTrigger>
                <TabsTrigger value="related">Related Keywords</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Volume Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Search Volume</span>
                          <span className="font-medium">{keywordData.searchVolume.toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(keywordData.searchVolume / 50000 * 100, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {keywordData.searchVolume < 1000 ? 'Low volume keyword' :
                           keywordData.searchVolume < 10000 ? 'Medium volume keyword' :
                           keywordData.searchVolume < 50000 ? 'High volume keyword' : 'Very high volume keyword'}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Competition Level</span>
                          <span className="font-medium capitalize">{keywordData.competition}</span>
                        </div>
                        <Progress 
                          value={keywordData.competition === 'low' ? 30 : keywordData.competition === 'medium' ? 60 : 90} 
                          className="h-2" 
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Cost Per Click</span>
                          <span className="font-medium">${keywordData.cpc.toFixed(2)}</span>
                        </div>
                        <Progress value={Math.min(keywordData.cpc / 5 * 100, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Search Intent & Seasonality
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Search Intent</h4>
                        <Badge variant="outline" className="capitalize">
                          {keywordData.searchIntent}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {keywordData.searchIntent === 'informational' ? 'Users looking for information' :
                           keywordData.searchIntent === 'navigational' ? 'Users looking for specific websites' :
                           keywordData.searchIntent === 'commercial' ? 'Users researching products/services' :
                           'Users ready to make a purchase'}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Seasonality</h4>
                        {keywordData.seasonality.seasonal ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Peak Season:</span>
                              <span className="font-medium">{keywordData.seasonality.peak}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Low Season:</span>
                              <span className="font-medium">{keywordData.seasonality.low}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">This keyword shows consistent search volume year-round</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      6-Month Search Trend
                    </CardTitle>
                    <CardDescription>
                      Monthly search volume trends for "{keywordData.keyword}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {keywordData.trendData.map((month, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-medium">{month.month}</div>
                          <div className="flex-1">
                            <Progress value={Math.min(month.volume / 50000 * 100, 100)} className="h-3" />
                          </div>
                          <div className="w-20 text-sm text-right font-medium">
                            {month.volume.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="related" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Related Keywords
                    </CardTitle>
                    <CardDescription>
                      High-potential related keywords with volume data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keywordData.relatedKeywords.map((related, index) => (
                        <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{related.keyword}</h4>
                            <Badge variant="outline">{related.volume.toLocaleString()}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span>+{related.growth}% growth</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Volume Opportunity</p>
                            <p className="text-xs text-muted-foreground">
                              {keywordData.searchVolume > 10000 ? 'High volume keyword with good potential' :
                               keywordData.searchVolume > 5000 ? 'Medium volume with decent opportunity' :
                               'Lower volume but less competition'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Competition Analysis</p>
                            <p className="text-xs text-muted-foreground">
                              {keywordData.competition === 'low' ? 'Low competition - easier to rank for' :
                               keywordData.competition === 'medium' ? 'Moderate competition - requires effort' :
                               'High competition - challenging but valuable'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Cost Efficiency</p>
                            <p className="text-xs text-muted-foreground">
                              {keywordData.cpc < 1 ? 'Low cost per click - good for PPC campaigns' :
                               keywordData.cpc < 3 ? 'Moderate cost - balanced ROI potential' :
                               'High cost - premium keyword with high value'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <h4 className="font-medium text-primary mb-1">Content Strategy</h4>
                          <p className="text-sm text-muted-foreground">
                            Create {keywordData.searchIntent === 'informational' ? 'educational content' :
                                     keywordData.searchIntent === 'commercial' ? 'comparison and review content' :
                                     'product-focused content'} targeting this keyword.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                          <h4 className="font-medium text-accent mb-1">SEO Approach</h4>
                          <p className="text-sm text-muted-foreground">
                            {keywordData.competition === 'low' ? 'Focus on on-page optimization and local SEO' :
                             keywordData.competition === 'medium' ? 'Build quality backlinks and improve user experience' :
                             'Requires comprehensive SEO strategy with strong backlink profile'}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <h4 className="font-medium text-green-600 mb-1">Timing</h4>
                          <p className="text-sm text-muted-foreground">
                            {keywordData.seasonality.seasonal ? 
                              `Focus content creation around ${keywordData.seasonality.peak} for maximum impact` :
                              'Consistent content creation throughout the year recommended'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!keywordData && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Your Keyword Research</h3>
            <p className="text-muted-foreground mb-6">
              Enter a keyword above to get detailed volume statistics, search trends, and competitive insights.
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-muted rounded-full">AI tools</span>
              <span className="px-3 py-1 bg-muted rounded-full">project management</span>
              <span className="px-3 py-1 bg-muted rounded-full">marketing automation</span>
              <span className="px-3 py-1 bg-muted rounded-full">customer relationship management</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

