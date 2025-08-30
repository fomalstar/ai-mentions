'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MentionChartProps {
  data: Array<{
    date: string
    count: number
    positive: number
    negative: number
    neutral: number
  }>
}

export function MentionChart({ data }: MentionChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Mention Trends (Last 7 Days)
        </CardTitle>
        <CardDescription>
          Daily mention activity across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((day, index) => (
            <div key={day.date} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{day.positive}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>{day.neutral}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{day.negative}</span>
                  </div>
                  <span className="font-medium">Total: {day.count}</span>
                </div>
              </div>
              
              {/* Bar Chart */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                {day.count > 0 && (
                  <>
                    {/* Positive mentions */}
                    {day.positive > 0 && (
                      <div 
                        className="absolute left-0 top-0 h-full bg-green-500"
                        style={{ 
                          width: `${(day.positive / maxCount) * 100}%`,
                          left: '0%'
                        }}
                      />
                    )}
                    
                    {/* Neutral mentions */}
                    {day.neutral > 0 && (
                      <div 
                        className="absolute top-0 h-full bg-gray-500"
                        style={{ 
                          width: `${(day.neutral / maxCount) * 100}%`,
                          left: `${(day.positive / maxCount) * 100}%`
                        }}
                      />
                    )}
                    
                    {/* Negative mentions */}
                    {day.negative > 0 && (
                      <div 
                        className="absolute top-0 h-full bg-red-500"
                        style={{ 
                          width: `${(day.negative / maxCount) * 100}%`,
                          left: `${((day.positive + day.neutral) / maxCount) * 100}%`
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {data.reduce((sum, day) => sum + day.positive, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Positive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {data.reduce((sum, day) => sum + day.neutral, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Neutral</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {data.reduce((sum, day) => sum + day.negative, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Negative</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
