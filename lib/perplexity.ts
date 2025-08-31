interface PerplexityResponse {
  id: string
  model: string
  object: string
  created: number
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface AIQueryTopic {
  question: string
  volume: string
  opportunityScore: number
  reasoning: string
  searchIntent: string
  targetAudience: string
}

export class PerplexityClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || ''
    this.baseUrl = 'https://api.perplexity.ai/chat/completions'
  }

  async analyzeKeyword(keyword: string): Promise<{
    aiTopics: AIQueryTopic[]
    strategicRecommendation: string
    marketInsights: string
  }> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set')
    }
    const prompt = `You are an expert AI marketing analyst specializing in AI query analysis and content strategy. 

Analyze the keyword "${keyword}" and provide:

1. **AI Query Topics Analysis**: Generate 5 specific questions that people actually ask AI models (like ChatGPT, Claude, Perplexity) about this topic. Each question should be realistic and represent real user behavior.

2. **For each AI query topic, provide**:
   - The exact question people ask AI
   - AI Query Volume: "High", "Medium", or "Low" based on how frequently this question is asked
   - Mention Opportunity Score: 1-10 rating (10 = highest opportunity for brand mentions)
   - Reasoning: Why this question presents an opportunity for brand mentions
   - Search Intent: "Informational", "Commercial", "Navigational", or "Transactional"
   - Target Audience: Who typically asks this question

3. **Strategic Recommendation**: Provide a detailed, actionable content strategy recommendation based on the analysis.

4. **Market Insights**: Brief insights about the keyword's market potential.

Format your response as JSON:
{
  "aiTopics": [
    {
      "question": "exact question people ask AI",
      "volume": "High/Medium/Low",
      "opportunityScore": 8,
      "reasoning": "detailed explanation",
      "searchIntent": "Informational/Commercial/Navigational/Transactional",
      "targetAudience": "specific audience description"
    }
  ],
  "strategicRecommendation": "detailed strategy",
  "marketInsights": "market analysis"
}

Focus on REAL questions that people actually ask AI models, not generic SEO keywords. Think about what someone would type into ChatGPT or Claude when seeking help with this topic.`

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI marketing analyst. Always respond with valid JSON format only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error details:', errorText)
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: PerplexityResponse = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from Perplexity API')
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Perplexity response')
      }

      const result = JSON.parse(jsonMatch[0])
      
      return {
        aiTopics: result.aiTopics || [],
        strategicRecommendation: result.strategicRecommendation || '',
        marketInsights: result.marketInsights || ''
      }
    } catch (error) {
      console.error('Perplexity API error:', error)
      throw error
    }
  }

  async getRelatedKeywords(keyword: string): Promise<string[]> {
    const prompt = `You are an expert keyword researcher. Generate 10 semantically related keywords for "${keyword}" that are:

1. **Directly related** - not long-tail variations, but core concepts in the same domain
2. **High-value** - keywords that businesses would actually target
3. **Semantically similar** - related in meaning, not just word combinations

For example:
- If keyword is "saas" → return: business, marketing, sales, software, technology, startup, enterprise, cloud, platform, solution
- If keyword is "project management" → return: productivity, collaboration, workflow, planning, organization, efficiency, teamwork, leadership, strategy, operations
- If keyword is "AI tools" → return: artificial intelligence, machine learning, automation, technology, software, innovation, digital, smart, intelligent, data

Return ONLY a JSON array of keywords, no explanations:
["keyword1", "keyword2", "keyword3", ...]`

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are an expert keyword researcher. Always respond with valid JSON arrays only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error details:', errorText)
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: PerplexityResponse = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from Perplexity API')
      }

      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in Perplexity response')
      }

      const result = JSON.parse(jsonMatch[0])
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Perplexity related keywords error:', error)
      // Fallback to basic related keywords
      return this.generateFallbackKeywords(keyword)
    }
  }

  private generateFallbackKeywords(keyword: string): string[] {
    const fallbackMap: { [key: string]: string[] } = {
      'saas': ['business', 'marketing', 'sales', 'software', 'technology', 'startup', 'enterprise', 'cloud', 'platform'],
      'project management': ['productivity', 'collaboration', 'workflow', 'planning', 'organization', 'efficiency', 'teamwork'],
      'AI tools': ['artificial intelligence', 'machine learning', 'automation', 'technology', 'software', 'innovation', 'digital'],
      'marketing': ['advertising', 'promotion', 'branding', 'strategy', 'campaign', 'digital', 'social media', 'content'],
      'seo': ['search engine optimization', 'digital marketing', 'web traffic', 'ranking', 'keywords', 'content', 'analytics']
    }

    const lowerKeyword = keyword.toLowerCase()
    for (const [key, keywords] of Object.entries(fallbackMap)) {
      if (lowerKeyword.includes(key)) {
        return keywords
      }
    }

    // Generic fallback
    return ['business', 'technology', 'software', 'solution', 'platform', 'service', 'tool', 'system', 'application']
  }

  async getRealTimeInsights(keyword: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set')
    }

    const prompt = `Provide real-time insights about the keyword "${keyword}" including:
    - Current market trends
    - Recent developments
    - Popular AI queries related to this topic
    - Emerging opportunities
    
    Keep it concise and actionable.`

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data: PerplexityResponse = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Perplexity real-time insights error:', error)
      return 'Unable to fetch real-time insights at this time.'
    }
  }


}

export const perplexityClient = new PerplexityClient()
