'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Calendar, 
  Lightbulb, 
  BarChart3, 
  Clock, 
  Users,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
  ExternalLink
} from "lucide-react"
import { toast } from 'sonner'

interface ContentBrief {
  id: string
  title: string
  description: string
  targetAudience: string
  keyPoints: string[]
  contentType: string
  estimatedWordCount: number
  seoScore: number
  aiOpportunityScore: number
  suggestedKeywords: string[]
  contentOutline: string[]
  callToAction: string
  status: 'draft' | 'in_progress' | 'completed'
  createdAt: string
  n8nWorkflowId?: string
}

interface ContentStrategy {
  keyword: string
  briefs: ContentBrief[]
  contentCalendar: any[]
  roiProjections: any[]
  n8nIntegration: {
    webhookUrl: string
    apiKey: string
    workflowStatus: 'active' | 'inactive'
    lastSync: string
  }
}

export function ContentStrategy({ keyword }: { keyword: string }) {
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedBrief, setCopiedBrief] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [n8nConfig, setN8nConfig] = useState({
    webhookUrl: '',
    apiKey: '',
    isConfigured: false
  })

  useEffect(() => {
    setIsClient(true)
    // Load n8n configuration from localStorage or environment
    const savedConfig = localStorage.getItem('n8n-config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setN8nConfig(config)
    }
  }, [])

  const saveN8nConfig = (config: any) => {
    localStorage.setItem('n8n-config', JSON.stringify(config))
    setN8nConfig(config)
  }

  const generateContentStrategy = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword first')
      return
    }

    if (!n8nConfig.isConfigured) {
      toast.error('Please configure your n8n webhook first')
      return
    }

    setIsGenerating(true)
    try {
      // Call your n8n webhook
      const response = await fetch(n8nConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${n8nConfig.apiKey}`,
        },
        body: JSON.stringify({ 
          keyword: keyword.trim(),
          action: 'generate_content_strategy',
          timestamp: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook error: ${response.status}`)
      }

      const data = await response.json()
      
      // Process the response from n8n
      setStrategy({
        keyword,
        briefs: data.briefs || [],
        contentCalendar: data.calendar || [],
        roiProjections: data.roi || [],
        n8nIntegration: {
          webhookUrl: n8nConfig.webhookUrl,
          apiKey: n8nConfig.apiKey,
          workflowStatus: 'active',
          lastSync: new Date().toISOString()
        }
      })
      
      toast.success('Content strategy generated via n8n!')
    } catch (error) {
      console.error('n8n webhook error:', error)
      toast.error('Failed to connect to n8n webhook. Please check your configuration.')
      
      // Fallback to demo data
      setStrategy({
        keyword,
        briefs: [
          {
            id: 'demo-1',
            title: `The Ultimate Guide to ${keyword}`,
            description: `Comprehensive guide covering everything about ${keyword} for beginners and experts alike.`,
            targetAudience: 'Professionals and enthusiasts interested in this topic',
            keyPoints: [
              'What is ' + keyword + ' and why it matters',
              'Key benefits and applications',
              'Best practices and implementation strategies',
              'Common challenges and solutions',
              'Future trends and predictions'
            ],
            contentType: 'Comprehensive Guide',
            estimatedWordCount: 2500,
            seoScore: 85,
            aiOpportunityScore: 9,
            suggestedKeywords: [
              keyword + ' guide',
              keyword + ' tutorial',
              keyword + ' best practices',
              keyword + ' examples',
              keyword + ' tips'
            ],
            contentOutline: [
              'Introduction and overview',
              'Core concepts and definitions',
              'Step-by-step implementation',
              'Real-world examples and case studies',
              'Advanced techniques and optimization',
              'Conclusion and next steps'
            ],
            callToAction: 'Start implementing these strategies today to improve your results.',
            status: 'draft',
            createdAt: new Date().toISOString(),
            n8nWorkflowId: 'demo-workflow-1'
          }
        ],
        contentCalendar: [],
        roiProjections: [],
        n8nIntegration: {
          webhookUrl: n8nConfig.webhookUrl,
          apiKey: n8nConfig.apiKey,
          workflowStatus: 'inactive',
          lastSync: new Date().toISOString()
        }
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const syncWithN8n = async () => {
    if (!n8nConfig.isConfigured) {
      toast.error('Please configure your n8n webhook first')
      return
    }

    try {
      const response = await fetch(`${n8nConfig.webhookUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${n8nConfig.apiKey}`,
        },
        body: JSON.stringify({ 
          action: 'sync_content_strategy',
          keyword: keyword,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        toast.success('Successfully synced with n8n!')
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      toast.error('Failed to sync with n8n')
    }
  }

  const copyBrief = async (brief: ContentBrief) => {
    const briefText = `
Content Brief: ${brief.title}

Description: ${brief.description}
Target Audience: ${brief.targetAudience}

Key Points:
${brief.keyPoints.map(point => `• ${point}`).join('\n')}

Content Type: ${brief.contentType}
Estimated Word Count: ${brief.estimatedWordCount}
SEO Score: ${brief.seoScore}/100
AI Opportunity Score: ${brief.aiOpportunityScore}/10

Suggested Keywords:
${brief.suggestedKeywords.join(', ')}

Content Outline:
${brief.contentOutline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Call to Action: ${brief.callToAction}
    `.trim()

    try {
      await navigator.clipboard.writeText(briefText)
      setCopiedBrief(brief.title)
      toast.success('Content brief copied to clipboard!')
      setTimeout(() => setCopiedBrief(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
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
            <FileText className="w-6 h-6 text-primary" />
            Content Strategy
          </h2>
          <p className="text-muted-foreground">
            Powered by n8n automation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {n8nConfig.isConfigured && (
            <Button 
              variant="outline"
              onClick={syncWithN8n}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Sync with n8n
            </Button>
          )}
          <Button 
            onClick={generateContentStrategy}
            disabled={isGenerating || !keyword.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Generate Strategy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* n8n Configuration */}
      {!n8nConfig.isConfigured && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Configure n8n Integration
            </CardTitle>
            <CardDescription>
              Connect your n8n webhook to enable automated content strategy generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">n8n Webhook URL</label>
              <Input
                placeholder="https://your-n8n-instance.com/webhook/content-strategy"
                value={n8nConfig.webhookUrl}
                onChange={(e) => setN8nConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key (Optional)</label>
              <Input
                type="password"
                placeholder="Your n8n API key"
                value={n8nConfig.apiKey}
                onChange={(e) => setN8nConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <Button 
              onClick={() => saveN8nConfig({ ...n8nConfig, isConfigured: true })}
              disabled={!n8nConfig.webhookUrl}
              className="w-full"
            >
              Save Configuration
            </Button>
            <div className="text-xs text-muted-foreground">
              <p>💡 <strong>Tip:</strong> Create a webhook trigger in n8n that accepts POST requests with keyword data and returns content strategy JSON.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* n8n Status */}
      {n8nConfig.isConfigured && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  n8n Integration Active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setN8nConfig({ webhookUrl: '', apiKey: '', isConfigured: false })}
                className="text-green-800 hover:text-green-900"
              >
                Reconfigure
              </Button>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Webhook: {n8nConfig.webhookUrl.substring(0, 50)}...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Strategy Results */}
      {strategy && (
        <Tabs defaultValue="briefs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="briefs">Content Briefs</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            <TabsTrigger value="roi">ROI Projections</TabsTrigger>
            <TabsTrigger value="n8n">n8n Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="briefs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {strategy.briefs.map((brief, index) => (
                <Card key={brief.id || index} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{brief.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {brief.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={brief.status === 'completed' ? 'default' : 'secondary'}>
                          {brief.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyBrief(brief)}
                          className="flex items-center gap-1"
                        >
                          {copiedBrief === brief.title ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{brief.contentType}</Badge>
                      <span className="text-muted-foreground">
                        {brief.estimatedWordCount} words
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>SEO Score</span>
                          <span className="font-medium">{brief.seoScore}/100</span>
                        </div>
                        <Progress value={brief.seoScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>AI Opportunity</span>
                          <span className="font-medium">{brief.aiOpportunityScore}/10</span>
                        </div>
                        <Progress value={brief.aiOpportunityScore * 10} className="h-2" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {brief.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Suggested Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {brief.suggestedKeywords.slice(0, 4).map((kw, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {brief.n8nWorkflowId && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>n8n Workflow ID: {brief.n8nWorkflowId}</span>
                          <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Content Calendar
                </CardTitle>
                <CardDescription>
                  Generated by n8n automation workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strategy.contentCalendar.length > 0 ? (
                  <div className="space-y-4">
                    {strategy.contentCalendar.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{item.week}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{item.content}</h4>
                            <p className="text-sm text-muted-foreground">{item.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={item.priority === 'High' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No content calendar data available</p>
                    <p className="text-sm">Configure your n8n workflow to generate calendar data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  ROI Projections
                </CardTitle>
                <CardDescription>
                  Generated by n8n analytics workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strategy.roiProjections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {strategy.roiProjections.map((projection, index) => (
                      <div key={index} className="text-center p-4 rounded-lg border bg-card">
                        <h4 className="font-medium mb-2">{projection.metric}</h4>
                        <div className="text-2xl font-bold text-primary mb-1">
                          {projection.projected.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          from {projection.current.toLocaleString()}
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {projection.growth}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No ROI projections available</p>
                    <p className="text-sm">Configure your n8n workflow to generate ROI data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="n8n" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  n8n Integration Status
                </CardTitle>
                <CardDescription>
                  Monitor your n8n workflow performance and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Connection Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={strategy.n8nIntegration.workflowStatus === 'active' ? 'default' : 'secondary'}>
                          {strategy.n8nIntegration.workflowStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span>{new Date(strategy.n8nIntegration.lastSync).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Webhook URL:</span>
                        <span className="text-xs truncate max-w-32">{strategy.n8nIntegration.webhookUrl}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={syncWithN8n}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Sync with n8n
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => window.open('https://n8n.io', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open n8n Dashboard
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">n8n Workflow Setup Guide</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>1. Create a webhook trigger in n8n</p>
                    <p>2. Add nodes for content strategy generation</p>
                    <p>3. Configure the response format to match the expected JSON structure</p>
                    <p>4. Deploy the workflow and copy the webhook URL</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!strategy && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generate Content Strategy</h3>
          <p className="text-muted-foreground mb-6">
            Connect your n8n webhook to generate AI-powered content recommendations and strategic planning.
          </p>
          <Button 
            onClick={generateContentStrategy}
            disabled={isGenerating || !keyword.trim() || !n8nConfig.isConfigured}
            className="flex items-center gap-2 mx-auto"
          >
            <Lightbulb className="w-4 h-4" />
            Generate via n8n
          </Button>
        </Card>
      )}
    </div>
  )
}
