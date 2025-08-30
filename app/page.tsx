'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { KeywordLineChart, MentionBarChart, SentimentPieChart } from "@/components/charts"
import { Search, TrendingUp, Brain, Zap, Target, Globe, BarChart3, PieChartIcon } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

const keywordData = [
  { keyword: "AI marketing", volume: 12500, mentions: 847, trend: "+15%" },
  { keyword: "machine learning", volume: 8900, mentions: 623, trend: "+8%" },
  { keyword: "chatgpt", volume: 45600, mentions: 1250, trend: "+32%" },
  { keyword: "automation", volume: 6700, mentions: 445, trend: "+12%" },
  { keyword: "data analytics", volume: 9800, mentions: 567, trend: "+18%" },
]

const chartData = [
  { name: "Jan", mentions: 400, volume: 2400 },
  { name: "Feb", mentions: 300, volume: 1398 },
  { name: "Mar", mentions: 200, volume: 9800 },
  { name: "Apr", mentions: 278, volume: 3908 },
  { name: "May", mentions: 189, volume: 4800 },
  { name: "Jun", mentions: 239, volume: 3800 },
]

const pieData = [
  { name: "Positive", value: 65, color: "hsl(var(--chart-3))" },
  { name: "Neutral", value: 25, color: "hsl(var(--chart-4))" },
  { name: "Negative", value: 10, color: "hsl(var(--chart-5))" },
]

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

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
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aimentions.app
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                First AI Keyword SEO Tool
              </Badge>
              <Button variant="outline" asChild>
                <a href="/pricing">Pricing</a>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/20 hover:border-blue-500/40"
              >
                Sign In
              </Button>
              <Button asChild>
                <a href="/dashboard">Get Started</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/test">🧪 Test</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Powered by ChatGPT & Advanced AI
          </div>
          <h2 className="text-5xl font-bold mb-6 text-balance">
            The First AI-Powered{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Keyword Mention Tool
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Analyze keyword volume and brand mentions using ChatGPT and other LLMs. Get real-time insights, sentiment
            analysis, and competitive intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Enter your keyword or brand..."
                className="pl-10 h-12 text-lg bg-card border-border"
              />
            </div>
            <Button size="lg" className="h-12 px-8" asChild>
              <a href="/dashboard">
                <Target className="w-4 h-4 mr-2" />
                Analyze Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Real-Time AI Analytics Dashboard</h3>
            <p className="text-muted-foreground text-lg">
              Get comprehensive insights powered by advanced language models
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Sentiment
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">1,247</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Brand Mentions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">3,892</div>
                    <p className="text-xs text-muted-foreground">+24% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15.2K</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3">78%</div>
                    <p className="text-xs text-muted-foreground">+5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Volume Trends</CardTitle>
                    <CardDescription>Monthly keyword search volume analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <KeywordLineChart data={chartData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mention Distribution</CardTitle>
                    <CardDescription>Brand mentions across different platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MentionBarChart data={chartData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Keywords</CardTitle>
                  <CardDescription>AI-analyzed keyword performance and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keywordData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.keyword}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.volume.toLocaleString()} searches • {item.mentions} mentions
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={item.trend.startsWith("+") ? "default" : "secondary"}
                            className="bg-primary/10 text-primary"
                          >
                            {item.trend}
                          </Badge>
                          <Progress value={Math.min((item.mentions / 1500) * 100, 100)} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                    <CardDescription>AI-powered sentiment breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SentimentPieChart data={pieData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Insights</CardTitle>
                    <CardDescription>Key findings from AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/20">
                      <div className="font-medium text-chart-3 mb-2">Positive Sentiment (65%)</div>
                      <p className="text-sm text-muted-foreground">
                        Strong positive reception for AI-related keywords, particularly in productivity and automation
                        contexts.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                      <div className="font-medium text-chart-4 mb-2">Neutral Sentiment (25%)</div>
                      <p className="text-sm text-muted-foreground">
                        Informational content and technical discussions maintain neutral tone.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-5/10 border border-chart-5/20">
                      <div className="font-medium text-chart-5 mb-2">Negative Sentiment (10%)</div>
                      <p className="text-sm text-muted-foreground">
                        Concerns mainly around job displacement and privacy issues.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Keywords</CardTitle>
                  <CardDescription>Emerging keywords detected by AI analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "AI automation",
                      "GPT-4",
                      "machine learning ops",
                      "neural networks",
                      "deep learning",
                      "AI ethics",
                    ].map((keyword, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border bg-gradient-to-br from-primary/5 to-accent/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{keyword}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          +{Math.floor(Math.random() * 50 + 10)}% growth
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30 relative backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powered by Advanced AI</h3>
            <p className="text-muted-foreground text-lg">
              Leverage the latest in artificial intelligence for keyword research
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>ChatGPT Integration</CardTitle>
                <CardDescription>
                  Direct integration with OpenAI's ChatGPT for intelligent keyword analysis
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Multi-LLM Support</CardTitle>
                <CardDescription>Support for multiple language models for comprehensive analysis</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle>Real-Time Insights</CardTitle>
                <CardDescription>Get instant keyword volume and mention data as it happens</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aimentions.app
              </span>
            </div>
            <div className="text-sm text-muted-foreground">© 2024 Aimentions.app. The first AI keyword SEO tool.</div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}
