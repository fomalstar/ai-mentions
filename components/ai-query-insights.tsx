'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Lightbulb,
  BarChart3
} from "lucide-react"

interface AIQuery {
  question: string
  queryVolume: 'High' | 'Medium' | 'Low'
  mentionOpportunityScore: number // 1-10
  reasoning: string
}

interface AIQueryInsightsProps {
  aiQueries: AIQuery[]
  strategicRecommendation: string
  keyword: string
}

export function AIQueryInsights({ aiQueries, strategicRecommendation, keyword }: AIQueryInsightsProps) {
  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOpportunityColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (score >= 6) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getOpportunityLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Query Insights</h2>
        <p className="text-muted-foreground">
          Discover how real users interact with AI about "{keyword}" and identify brand mention opportunities
        </p>
      </div>

      {/* Strategic Recommendation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="w-5 h-5" />
            Strategic Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 leading-relaxed">{strategicRecommendation}</p>
        </CardContent>
      </Card>

      {/* AI-Generated Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Top AI-Generated Questions & Prompts
          </CardTitle>
          <CardDescription>
            These are the most common questions people ask AI about "{keyword}" with opportunity scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiQueries.map((query, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-2">{query.question}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{query.reasoning}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge className={getVolumeColor(query.queryVolume)}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {query.queryVolume} Volume
                    </Badge>
                    <Badge className={getOpportunityColor(query.mentionOpportunityScore)}>
                      <Target className="w-3 h-3 mr-1" />
                      {query.mentionOpportunityScore}/10
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getOpportunityLabel(query.mentionOpportunityScore)} Opportunity
                    </Badge>
                  </div>
                </div>
                
                {/* Opportunity Score Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                    <span>Mention Opportunity</span>
                    <span>{query.mentionOpportunityScore}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        query.mentionOpportunityScore >= 8 ? 'bg-emerald-500' :
                        query.mentionOpportunityScore >= 6 ? 'bg-blue-500' :
                        query.mentionOpportunityScore >= 4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(query.mentionOpportunityScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                {aiQueries.filter(q => q.queryVolume === 'High').length}
              </div>
              <p className="text-sm text-muted-foreground">High Volume Questions</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="text-2xl font-bold text-accent">
                {aiQueries.filter(q => q.mentionOpportunityScore >= 7).length}
              </div>
              <p className="text-sm text-muted-foreground">High Opportunity (7-10)</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold">
                {Math.round(aiQueries.reduce((sum, q) => sum + q.mentionOpportunityScore, 0) / aiQueries.length * 10) / 10}
              </div>
              <p className="text-sm text-muted-foreground">Average Opportunity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>Next Steps:</strong> Focus on creating content that answers questions with high mention opportunity scores (7-10). 
          These questions provide the best opportunities to insert your brand and product recommendations naturally.
        </AlertDescription>
      </Alert>
    </div>
  )
}
