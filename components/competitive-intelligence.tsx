'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  Globe, 
  Search,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Zap,
  Shield
} from "lucide-react"
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
  domain: string
  marketShare: number
  trafficShare: number
  keywordOverlap: number
  contentGap: number
  backlinkStrength: number
  socialPresence: number
  aiMentions: number
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  recentContent: {
    title: string
    url: string
    publishedAt: string
    engagement: number
  }[]
  aiQueries: {
    query: string
    volume: number
    opportunity: number
  }[]
}

interface CompetitiveAnalysis {
  keyword: string
  competitors: Competitor[]
  marketOverview: {
    totalMarketSize: number
    marketGrowth: number
    topPlayers: string[]
    emergingTrends: string[]
  }
  aiOpportunities: {
    untappedQueries: number
    lowCompetitionKeywords: number
    contentGaps: number
    mentionOpportunities: number
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

export function CompetitiveIntelligence({ keyword }: { keyword: string }) {
  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const analyzeCompetitors = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword first')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/competitive/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze competitors')
      }

      const data = await response.json()
      setAnalysis(data)
      toast.success('Competitive analysis completed!')
    } catch (error) {
      console.error('Competitive analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze competitors')
      
      // Fallback to demo data
      setAnalysis({
        keyword,
        competitors: [
          {
            id: 'comp-1',
            name: 'Competitor A',
            domain: 'competitora.com',
            marketShare: 25,
            trafficShare: 30,
            keywordOverlap: 65,
            contentGap: 15,
            backlinkStrength: 85,
            socialPresence: 70,
            aiMentions: 45,
            strengths: [
              'Strong brand recognition',
              'Extensive content library',
              'High domain authority'
            ],
            weaknesses: [
              'Limited AI integration',
              'Slow content updates',
              'Poor mobile experience'
            ],
            opportunities: [
              'AI-powered features',
              'Video content expansion',
              'Mobile optimization'
            ],
            threats: [
              'New market entrants',
              'Changing algorithms',
              'User behavior shifts'
            ],
            recentContent: [
              {
                title: `How to Master ${keyword} in 2024`,
                url: 'https://competitora.com/master-keyword',
                publishedAt: '2024-01-15',
                engagement: 85
              },
              {
                title: `${keyword} Best Practices Guide`,
                url: 'https://competitora.com/best-practices',
                publishedAt: '2024-01-10',
                engagement: 72
              }
            ],
            aiQueries: [
              {
                query: `best ${keyword} tools`,
                volume: 1200,
                opportunity: 8
              },
              {
                query: `${keyword} tutorial`,
                volume: 800,
                opportunity: 6
              }
            ]
          },
          {
            id: 'comp-2',
            name: 'Competitor B',
            domain: 'competitorb.com',
            marketShare: 18,
            trafficShare: 22,
            keywordOverlap: 45,
            contentGap: 25,
            backlinkStrength: 65,
            socialPresence: 85,
            aiMentions: 30,
            strengths: [
              'Strong social media presence',
              'Innovative features',
              'Active community'
            ],
            weaknesses: [
              'Limited SEO focus',
              'Weak backlink profile',
              'Inconsistent content'
            ],
            opportunities: [
              'SEO optimization',
              'Content strategy',
              'Backlink building'
            ],
            threats: [
              'Algorithm changes',
              'Competition intensification',
              'Resource constraints'
            ],
            recentContent: [
              {
                title: `${keyword} Trends for 2024`,
                url: 'https://competitorb.com/trends',
                publishedAt: '2024-01-12',
                engagement: 68
              }
            ],
            aiQueries: [
              {
                query: `${keyword} examples`,
                volume: 600,
                opportunity: 7
              }
            ]
          }
        ],
        marketOverview: {
          totalMarketSize: 1000000,
          marketGrowth: 15,
          topPlayers: ['Competitor A', 'Competitor B', 'Your Brand'],
          emergingTrends: [
            'AI-powered content generation',
            'Voice search optimization',
            'Video-first content strategy'
          ]
        },
        aiOpportunities: {
          untappedQueries: 45,
          lowCompetitionKeywords: 23,
          contentGaps: 12,
          mentionOpportunities: 18
        },
        recommendations: {
          immediate: [
            'Create content for high-opportunity AI queries',
            'Optimize existing content for voice search',
            'Build backlinks from industry publications'
          ],
          shortTerm: [
            'Develop video content strategy',
            'Implement AI-powered features',
            'Expand social media presence'
          ],
          longTerm: [
            'Establish thought leadership position',
            'Build comprehensive content ecosystem',
            'Develop strategic partnerships'
          ]
        }
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Competitive Intelligence
          </h2>
          <p className="text-muted-foreground">
            Analyze competitors and identify market opportunities
          </p>
        </div>
        <Button 
          onClick={analyzeCompetitors}
          disabled={isAnalyzing || !keyword.trim()}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Analyze Competitors
            </>
          )}
        </Button>
      </div>

      {/* Competitive Analysis Results */}
      {analysis && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="opportunities">AI Opportunities</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.marketOverview.totalMarketSize.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Market Size</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        {analysis.marketOverview.marketGrowth}%
                      </div>
                      <div className="text-sm text-muted-foreground">Market Growth</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Top Players</h4>
                    <div className="space-y-2">
                      {analysis.marketOverview.topPlayers.map((player, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{player}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Emerging Trends</h4>
                    <div className="space-y-2">
                      {analysis.marketOverview.emergingTrends.map((trend, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.aiOpportunities.untappedQueries}
                      </div>
                      <div className="text-sm text-muted-foreground">Untapped Queries</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.aiOpportunities.lowCompetitionKeywords}
                      </div>
                      <div className="text-sm text-muted-foreground">Low Competition</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.aiOpportunities.contentGaps}
                      </div>
                      <div className="text-sm text-muted-foreground">Content Gaps</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-card">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysis.aiOpportunities.mentionOpportunities}
                      </div>
                      <div className="text-sm text-muted-foreground">Mention Opportunities</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysis.competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <CardDescription>{competitor.domain}</CardDescription>
                      </div>
                      <Badge variant="outline">{competitor.marketShare}% Market Share</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Traffic Share</span>
                          <span className="font-medium">{competitor.trafficShare}%</span>
                        </div>
                        <Progress value={competitor.trafficShare} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Keyword Overlap</span>
                          <span className="font-medium">{competitor.keywordOverlap}%</span>
                        </div>
                        <Progress value={competitor.keywordOverlap} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Backlink Strength</span>
                          <span className="font-medium">{competitor.backlinkStrength}/100</span>
                        </div>
                        <Progress value={competitor.backlinkStrength} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>AI Mentions</span>
                          <span className="font-medium">{competitor.aiMentions}</span>
                        </div>
                        <Progress value={competitor.aiMentions * 2} className="h-2" />
                      </div>
                    </div>

                    <Tabs defaultValue="strengths" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="strengths">Strengths</TabsTrigger>
                        <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                        <TabsTrigger value="threats">Threats</TabsTrigger>
                      </TabsList>

                      <TabsContent value="strengths" className="space-y-2">
                        {competitor.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {strength}
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="weaknesses" className="space-y-2">
                        {competitor.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            {weakness}
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="opportunities" className="space-y-2">
                        {competitor.opportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                            {opportunity}
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="threats" className="space-y-2">
                        {competitor.threats.map((threat, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-orange-600" />
                            {threat}
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Recent Content</h4>
                      <div className="space-y-2">
                        {competitor.recentContent.map((content, index) => (
                          <div key={index} className="p-2 rounded border text-xs">
                            <div className="font-medium">{content.title}</div>
                            <div className="text-muted-foreground">
                              {new Date(content.publishedAt).toLocaleDateString()} • {content.engagement} engagement
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">AI Queries</h4>
                      <div className="space-y-2">
                        {competitor.aiQueries.map((query, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border text-xs">
                            <span>{query.query}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{query.volume}</span>
                              <Badge variant="secondary" className="text-xs">
                                {query.opportunity}/10
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  AI Query Opportunities
                </CardTitle>
                <CardDescription>
                  Untapped AI queries and content gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">High-Opportunity Queries</h4>
                    <div className="space-y-3">
                      {analysis.competitors.flatMap(comp => comp.aiQueries)
                        .filter(query => query.opportunity >= 7)
                        .slice(0, 5)
                        .map((query, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div>
                              <div className="font-medium">{query.query}</div>
                              <div className="text-sm text-muted-foreground">
                                Volume: {query.volume.toLocaleString()}
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {query.opportunity}/10
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Content Gap Analysis</h4>
                    <div className="space-y-3">
                      {analysis.competitors.map(comp => (
                        <div key={comp.id} className="p-3 rounded-lg border bg-card">
                          <div className="font-medium mb-2">{comp.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Content Gap: {comp.contentGap}%
                          </div>
                          <Progress value={comp.contentGap} className="h-2 mt-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-600" />
                    Immediate Actions
                  </CardTitle>
                  <CardDescription>
                    Actions to take within 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.immediate.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Short Term
                  </CardTitle>
                  <CardDescription>
                    Actions for next 3 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.shortTerm.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Long Term
                  </CardTitle>
                  <CardDescription>
                    Strategic goals for 6+ months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.longTerm.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!analysis && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analyze Competitors</h3>
          <p className="text-muted-foreground mb-6">
            Get comprehensive competitive intelligence and market analysis for your keyword.
          </p>
          <Button 
            onClick={analyzeCompetitors}
            disabled={isAnalyzing || !keyword.trim()}
            className="flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            Start Analysis
          </Button>
        </Card>
      )}
    </div>
  )
}

