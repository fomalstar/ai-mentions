'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"

interface TrendData {
  current: number
  monthly: Array<{
    year: number
    month: number
    volume: number
  }>
  threeMonthAverage: number
  sixMonthAverage: number
}

interface TrendAnalysisProps {
  trendData: TrendData
  keyword: string
}

export function TrendAnalysis({ trendData, keyword }: TrendAnalysisProps) {
  const currentVolume = trendData.current
  const threeMonthAvg = trendData.threeMonthAverage
  const sixMonthAvg = trendData.sixMonthAverage
  
  // Calculate trend percentages
  const threeMonthChange = ((currentVolume - threeMonthAvg) / threeMonthAvg) * 100
  const sixMonthChange = ((currentVolume - sixMonthAvg) / sixMonthAvg) * 100
  
  // Determine trend direction
  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }
  
  const getTrendColor = (change: number) => {
    if (change > 5) return "text-green-600"
    if (change < -5) return "text-red-600"
    return "text-gray-600"
  }
  
  const getTrendBadge = (change: number) => {
    if (change > 5) return "bg-green-100 text-green-800 border-green-200"
    if (change < -5) return "bg-red-100 text-red-800 border-red-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  // Format monthly data for display
  const recentMonths = trendData.monthly.slice(0, 6).reverse()
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            AI Search Volume Trends
          </CardTitle>
          <CardDescription>
            Monthly AI search volume analysis for "{keyword}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current vs Averages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                {currentVolume.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Current Volume</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="text-2xl font-bold text-accent">
                {threeMonthAvg.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">3-Month Average</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(threeMonthChange)}
                <span className={`text-sm font-medium ${getTrendColor(threeMonthChange)}`}>
                  {threeMonthChange > 0 ? '+' : ''}{threeMonthChange.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold">
                {sixMonthAvg.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">6-Month Average</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(sixMonthChange)}
                <span className={`text-sm font-medium ${getTrendColor(sixMonthChange)}`}>
                  {sixMonthChange > 0 ? '+' : ''}{sixMonthChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="space-y-4">
            <h4 className="font-semibold">Trend Analysis</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">3-Month Trend</span>
                  <Badge className={getTrendBadge(threeMonthChange)}>
                    {threeMonthChange > 5 ? 'Growing' : threeMonthChange < -5 ? 'Declining' : 'Stable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {threeMonthChange > 5 
                    ? `This keyword is showing strong growth, up ${threeMonthChange.toFixed(1)}% from the 3-month average.`
                    : threeMonthChange < -5
                    ? `This keyword is declining, down ${Math.abs(threeMonthChange).toFixed(1)}% from the 3-month average.`
                    : 'This keyword is showing stable performance with minimal change from the 3-month average.'
                  }
                </p>
              </div>
              
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">6-Month Trend</span>
                  <Badge className={getTrendBadge(sixMonthChange)}>
                    {sixMonthChange > 5 ? 'Growing' : sixMonthChange < -5 ? 'Declining' : 'Stable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sixMonthChange > 5 
                    ? `Long-term growth trend with ${sixMonthChange.toFixed(1)}% increase from 6-month average.`
                    : sixMonthChange < -5
                    ? `Long-term decline trend with ${Math.abs(sixMonthChange).toFixed(1)}% decrease from 6-month average.`
                    : 'Consistent performance over the past 6 months with minimal fluctuations.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold">Monthly Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentMonths.map((month, index) => {
                const monthName = monthNames[month.month - 1]
                const isCurrent = index === 0
                const prevVolume = index < recentMonths.length - 1 ? recentMonths[index + 1].volume : month.volume
                const monthChange = prevVolume > 0 ? ((month.volume - prevVolume) / prevVolume) * 100 : 0
                
                return (
                  <div key={`${month.year}-${month.month}`} className={`p-3 rounded-lg border text-center ${
                    isCurrent ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'
                  }`}>
                    <div className="text-xs text-muted-foreground mb-1">
                      {monthName} {month.year}
                    </div>
                    <div className="text-lg font-bold">
                      {month.volume.toLocaleString()}
                    </div>
                    {!isCurrent && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {getTrendIcon(monthChange)}
                        <span className={`text-xs ${getTrendColor(monthChange)}`}>
                          {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Current
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
