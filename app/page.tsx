'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { KeywordLineChart, MentionBarChart, SentimentPieChart } from "@/components/charts"
import { Search, TrendingUp, Brain, Zap, Target, Globe, BarChart3, PieChartIcon, CheckCircle } from "lucide-react"
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
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gradient-to-r from-teal-600 to-violet-600 border-0 shadow-lg">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-white hover:text-white hover:bg-white/10">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-white hover:text-white hover:bg-white/10">
                <Search className="w-4 h-4" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-white hover:text-white hover:bg-white/10">
                <PieChartIcon className="w-4 h-4" />
                Sentiment
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-white hover:text-white hover:bg-white/10">
                <TrendingUp className="w-4 h-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-teal-700">Total Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-800">1,247</div>
                    <p className="text-xs text-teal-600">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Brand Mentions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-800">3,892</div>
                    <p className="text-xs text-amber-600">+24% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-violet-700">Avg. Search Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-violet-800">15.2K</div>
                    <p className="text-xs text-violet-600">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-rose-700">AI Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-rose-800">5</div>
                    <p className="text-xs text-rose-600">ChatGPT, Gemini, Perplexity</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-100/50 border-indigo-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-800">AI Platform Performance</CardTitle>
                    <CardDescription className="text-indigo-600">Real-time performance metrics across AI platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-indigo-700">ChatGPT</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-800">89%</div>
                          <div className="text-xs text-indigo-600">Accuracy</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="font-medium text-indigo-700">Gemini</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-800">92%</div>
                          <div className="text-xs text-indigo-600">Accuracy</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-indigo-700">Perplexity</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-800">87%</div>
                          <div className="text-xs text-indigo-600">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-50 to-pink-100/50 border-rose-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-xl text-rose-800">Brand Visibility Score</CardTitle>
                    <CardDescription className="text-rose-600">Comprehensive brand mention tracking metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-rose-800 mb-2">8.7</div>
                        <div className="text-sm text-rose-600">Overall Score</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-lg font-bold text-rose-700">1,247</div>
                          <div className="text-xs text-rose-600">Keywords</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-lg font-bold text-rose-700">3,892</div>
                          <div className="text-xs text-rose-600">Mentions</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-teal-800">Top Performing Keywords</CardTitle>
                  <CardDescription className="text-teal-600">AI-analyzed keyword performance with search volume and mention data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { keyword: "artificial intelligence", volume: 125000, mentions: 2847, trend: "+45%", position: 1 },
                      { keyword: "machine learning", volume: 89000, mentions: 1623, trend: "+28%", position: 2 },
                      { keyword: "chatgpt alternatives", volume: 45600, mentions: 1250, trend: "+32%", position: 1 },
                      { keyword: "AI automation tools", volume: 67000, mentions: 1445, trend: "+22%", position: 3 },
                      { keyword: "data analytics", volume: 98000, mentions: 2567, trend: "+18%", position: 2 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl border border-teal-200/50 bg-gradient-to-r from-white/80 to-teal-50/50 hover:from-teal-100/30 hover:to-teal-200/30 transition-all cursor-pointer group hover:shadow-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-teal-800 group-hover:text-teal-600 transition-colors">{item.keyword}</div>
                          <div className="text-sm text-teal-600">
                            {item.volume.toLocaleString()} searches • {item.mentions} mentions
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-teal-100/50 text-teal-700 border-teal-300/50 font-medium px-3 py-1">
                            #{item.position}
                          </Badge>
                          <Badge
                            variant="default"
                            className={`font-medium px-3 py-1 ${
                              item.trend.startsWith("+") 
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300/50" 
                                : "bg-red-100 text-red-700 border-red-300/50"
                            }`}
                          >
                            {item.trend}
                          </Badge>
                          <div className="w-20">
                            <div className="w-full bg-teal-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  item.trend.startsWith("+") ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min((item.mentions / 3000) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-xl text-violet-800">Sentiment Analysis</CardTitle>
                    <CardDescription className="text-violet-600">AI-powered sentiment breakdown across all mentions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                          <span className="font-medium text-violet-700">Positive</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-800">65%</div>
                          <div className="text-sm text-violet-600">2,530 mentions</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-violet-700">Neutral</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-800">25%</div>
                          <div className="text-sm text-violet-600">973 mentions</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-violet-700">Negative</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-800">10%</div>
                          <div className="text-sm text-violet-600">389 mentions</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-xl text-amber-800">Sentiment Insights</CardTitle>
                    <CardDescription className="text-amber-600">Key findings from AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-100/50 to-green-100/50 border border-emerald-300/50 hover:bg-emerald-100/60 transition-colors">
                      <div className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Positive Sentiment (65%)
                      </div>
                      <p className="text-sm text-emerald-600">
                        Strong positive reception for AI-related keywords, particularly in productivity and innovation contexts.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border border-blue-300/50 hover:bg-blue-100/60 transition-colors">
                      <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Neutral Sentiment (25%)
                      </div>
                      <p className="text-sm text-blue-600">
                        Informational content and technical discussions maintain neutral tone.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-100/50 to-pink-100/50 border border-red-300/50 hover:bg-red-100/60 transition-colors">
                      <div className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        Negative Sentiment (10%)
                      </div>
                      <p className="text-sm text-red-600">
                        Concerns mainly around job displacement and privacy issues.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100/50 border-rose-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-800">Emerging Trends</CardTitle>
                  <CardDescription className="text-rose-600">AI-detected trending topics and opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "AI automation tools",
                      "GPT-4 alternatives",
                      "machine learning ops",
                      "neural networks",
                      "deep learning platforms",
                      "AI ethics frameworks",
                    ].map((keyword, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-rose-200/50 bg-gradient-to-br from-white/80 to-rose-50/50 hover:from-rose-100/30 hover:to-rose-200/30 transition-all cursor-pointer group hover:shadow-lg hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-rose-800 group-hover:text-rose-600 transition-colors">{keyword}</span>
                          <Badge variant="secondary" className="bg-rose-100/50 text-rose-700 border-rose-300/50">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                        <div className="text-sm text-rose-600">
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
