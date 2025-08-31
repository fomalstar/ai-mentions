// OpenAI client using environment variables
import OpenAI from 'openai'

export interface AIQuery {
  question: string
  queryVolume: 'High' | 'Medium' | 'Low'
  mentionOpportunityScore: number // 1-10
  reasoning: string
}

export interface KeywordAnalysis {
  keyword: string
  searchVolume: number
  trendData: {
    current: number
    monthly: Array<{
      year: number
      month: number
      volume: number
    }>
    threeMonthAverage: number
    sixMonthAverage: number
  }
  aiQueries: AIQuery[]
  strategicRecommendation: string
}

export class OpenAIClient {
  private static openai: OpenAI | null = null

  private static getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set')
      }
      this.openai = new OpenAI({ apiKey })
    }
    return this.openai
  }

  /**
   * Generate AI queries and questions around a keyword
   */
  static async generateAIQueries(keyword: string): Promise<AIQuery[]> {
    try {
      const client = this.getClient()
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI marketing analyst specializing in AI query analysis and content strategy.'
          },
          {
            role: 'user',
            content: `Generate 5 specific AI queries that people ask about "${keyword}". Each query should have a query volume (High/Medium/Low), mention opportunity score (1-10), and reasoning. Return as JSON.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            return result.queries || this.generateMockAIQueries(keyword)
          }
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError)
        }
      }
      
      return this.generateMockAIQueries(keyword)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.generateMockAIQueries(keyword)
    }
  }

  /**
   * Generate strategic recommendation based on AI queries
   */
  static async generateStrategicRecommendation(keyword: string, aiQueries: AIQuery[]): Promise<string> {
    try {
      const client = this.getClient()
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert marketing strategist.'
          },
          {
            role: 'user',
            content: `Based on these AI queries about "${keyword}", provide a strategic recommendation: ${JSON.stringify(aiQueries)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      return response.choices[0]?.message?.content || 'Focus on questions with high mention opportunity scores (7-10) for maximum brand visibility impact.'
    } catch (error) {
      console.error('OpenAI API error:', error)
      const highOpportunityQueries = aiQueries.filter(q => q.mentionOpportunityScore >= 7)
      
      if (highOpportunityQueries.length > 0) {
        return `Focus on questions with high mention opportunity scores (7-10) like "${highOpportunityQueries[0].question}" for maximum brand visibility impact. These questions provide the best opportunities to insert product recommendations and brand mentions.`
      }
      
      return 'Focus on questions with high mention opportunity scores (7-10) for maximum brand visibility impact.'
    }
  }

  /**
   * Generate mock AI queries for development
   */
  private static generateMockAIQueries(keyword: string): AIQuery[] {
    const mockQueries = [
      {
        question: `What is the best ${keyword} for beginners?`,
        queryVolume: 'High' as const,
        mentionOpportunityScore: 9,
        reasoning: 'High opportunity for product recommendations and brand mentions'
      },
      {
        question: `How to choose the right ${keyword}?`,
        queryVolume: 'High' as const,
        mentionOpportunityScore: 8,
        reasoning: 'Good opportunity to insert brand comparisons and recommendations'
      },
      {
        question: `Compare different ${keyword} options`,
        queryVolume: 'Medium' as const,
        mentionOpportunityScore: 7,
        reasoning: 'Moderate opportunity for competitive analysis and brand positioning'
      },
      {
        question: `What features should I look for in ${keyword}?`,
        queryVolume: 'Medium' as const,
        mentionOpportunityScore: 6,
        reasoning: 'Some opportunity to highlight specific brand features'
      },
      {
        question: `Is ${keyword} worth the investment?`,
        queryVolume: 'Low' as const,
        mentionOpportunityScore: 4,
        reasoning: 'Lower opportunity as this is more about general value assessment'
      }
    ]

    return mockQueries
  }

  /**
   * Generate mock trend data
   */
  static generateMockTrendData(): any {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12
      const year = currentYear - (i > currentMonth ? 1 : 0)
      monthly.push({
        year,
        month: month + 1,
        volume: Math.floor(Math.random() * 5000) + 1000
      })
    }

    const currentVolume = monthly[monthly.length - 1].volume
    const threeMonthAverage = monthly.slice(-3).reduce((sum, m) => sum + m.volume, 0) / 3
    const sixMonthAverage = monthly.reduce((sum, m) => sum + m.volume, 0) / 6

    return {
      current: currentVolume,
      monthly,
      threeMonthAverage: Math.round(threeMonthAverage),
      sixMonthAverage: Math.round(sixMonthAverage)
    }
  }
}

export default OpenAIClient
