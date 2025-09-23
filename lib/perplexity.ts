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
    const prompt = `You are an expert keyword researcher and SEO specialist. Generate 10 semantically related keywords for "${keyword}" that are:

**Requirements:**
1. **Directly Related** - Core concepts in the same domain, not long-tail variations
2. **High-Value** - Keywords that businesses would actually target for SEO/marketing
3. **Semantically Similar** - Related in meaning and intent, not just word combinations
4. **Market-Relevant** - Focus on terms that have commercial value and search volume
5. **Current Trends** - Include emerging concepts and modern terminology

**Examples:**
- If keyword is "saas" → return: business software, cloud platform, enterprise solution, subscription service, software-as-a-service, business automation, digital transformation, cloud computing, business tools, software platform
- If keyword is "project management" → return: team collaboration, workflow automation, productivity tools, business planning, task management, team leadership, project planning, business operations, efficiency tools, strategic planning
- If keyword is "AI tools" → return: artificial intelligence, machine learning, automation software, intelligent systems, AI platform, smart technology, digital intelligence, automated tools, cognitive computing, intelligent automation

**Format:** Return ONLY a JSON array of keywords, no explanations:
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

    const prompt = `You are an expert market analyst and business intelligence specialist. Provide real-time, actionable insights about the keyword "${keyword}" including:

**Required Analysis:**
1. **Current Market Trends** - What's happening right now in this space?
2. **Recent Developments** - Major news, product launches, or industry changes
3. **Popular AI Queries** - What are people asking about this topic?
4. **Emerging Opportunities** - New markets, use cases, or business models
5. **Competitive Landscape** - Key players and market positioning
6. **Search Behavior** - How people are searching for this information

**Focus Areas:**
- Business and marketing applications
- Technology trends and innovations
- Market demand and growth potential
- Practical use cases and implementation

Keep the response concise, factual, and immediately actionable for business professionals. Include specific examples and data points when available.`

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
          max_tokens: 800,
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
