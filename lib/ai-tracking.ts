interface TrackingItem {
  id: string
  projectId: string
  projectName: string
  brandName: string
  keyword: string
  topic: string
  addedAt: string
  status: 'active' | 'paused'
}

interface MentionResult {
  id: string
  projectId: string
  brandName: string
  keyword: string
  topic: string
  aiResponse: string
  hasMention: boolean
  mentionType: 'positive' | 'negative' | 'neutral'
  detectedAt: string
  source: 'perplexity' | 'gemini' | 'chatgpt'
}

export class AITrackingService {
  private perplexityApiKey: string
  private openaiApiKey: string
  private geminiApiKey: string

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || ''
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
  }

  async checkForBrandMentions(trackingItem: TrackingItem): Promise<MentionResult[]> {
    const results: MentionResult[] = []
    
    console.log(`Checking brand mentions for: ${trackingItem.brandName} - Topic: ${trackingItem.topic}`)
    
    // Check with Perplexity
    if (this.perplexityApiKey && this.perplexityApiKey.trim() !== '') {
      try {
        console.log('Checking with Perplexity...')
        const perplexityResult = await this.checkWithPerplexity(trackingItem)
        results.push(perplexityResult)
        console.log('Perplexity result:', perplexityResult.hasMention ? 'MENTION FOUND' : 'No mention')
      } catch (error) {
        console.error('Perplexity tracking error:', error)
        throw error
      }
    } else {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set')
    }

    // Check with OpenAI/ChatGPT
    if (this.openaiApiKey && this.openaiApiKey.trim() !== '') {
      try {
        console.log('Checking with OpenAI...')
        const openaiResult = await this.checkWithOpenAI(trackingItem)
        results.push(openaiResult)
        console.log('OpenAI result:', openaiResult.hasMention ? 'MENTION FOUND' : 'No mention')
      } catch (error) {
        console.error('OpenAI tracking error:', error)
        throw error
      }
    } else {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    // Check with Gemini
    if (this.geminiApiKey && this.geminiApiKey.trim() !== '') {
      try {
        console.log('Checking with Gemini...')
        const geminiResult = await this.checkWithGemini(trackingItem)
        results.push(geminiResult)
        console.log('Gemini result:', geminiResult.hasMention ? 'MENTION FOUND' : 'No mention')
      } catch (error) {
        console.error('Gemini tracking error:', error)
        throw error
      }
    } else {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    console.log(`Completed checking. Found ${results.filter(r => r.hasMention).length} mentions out of ${results.length} total checks`)
    return results
  }

  private async checkWithPerplexity(trackingItem: TrackingItem): Promise<MentionResult> {
    const prompt = `Please provide information about: ${trackingItem.topic}

Focus on practical insights and real-world applications. Be helpful and informative.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
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
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || ''
    
    return this.analyzeResponse(trackingItem, aiResponse, 'perplexity')
  }

  private async checkWithOpenAI(trackingItem: TrackingItem): Promise<MentionResult> {
    const prompt = `Please provide information about: ${trackingItem.topic}

Focus on practical insights and real-world applications. Be helpful and informative.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || ''
    
    return this.analyzeResponse(trackingItem, aiResponse, 'chatgpt')
  }

  private async checkWithGemini(trackingItem: TrackingItem): Promise<MentionResult> {
    const prompt = `Please provide information about: ${trackingItem.topic}

Focus on practical insights and real-world applications. Be helpful and informative.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error details:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return this.analyzeResponse(trackingItem, aiResponse, 'gemini')
  }

  private analyzeResponse(trackingItem: TrackingItem, aiResponse: string, source: 'perplexity' | 'gemini' | 'chatgpt'): MentionResult {
    const lowerResponse = aiResponse.toLowerCase()
    const lowerBrandName = trackingItem.brandName.toLowerCase()
    
    // Check if brand name exists in the response
    const hasMention = lowerResponse.includes(lowerBrandName)
    
    // Simple sentiment analysis
    let mentionType: 'positive' | 'negative' | 'neutral' = 'neutral'
    
    if (hasMention) {
      const positiveWords = ['great', 'excellent', 'amazing', 'best', 'top', 'recommended', 'love', 'fantastic', 'outstanding']
      const negativeWords = ['bad', 'terrible', 'worst', 'avoid', 'hate', 'awful', 'poor', 'disappointing']
      
      const positiveCount = positiveWords.filter(word => lowerResponse.includes(word)).length
      const negativeCount = negativeWords.filter(word => lowerResponse.includes(word)).length
      
      if (positiveCount > negativeCount) {
        mentionType = 'positive'
      } else if (negativeCount > positiveCount) {
        mentionType = 'negative'
      }
    }

    return {
      id: Date.now().toString(),
      projectId: trackingItem.projectId,
      brandName: trackingItem.brandName,
      keyword: trackingItem.keyword,
      topic: trackingItem.topic,
      aiResponse,
      hasMention,
      mentionType,
      detectedAt: new Date().toISOString(),
      source
    }
  }

  // Batch check multiple tracking items
  async batchCheckMentions(trackingItems: TrackingItem[]): Promise<MentionResult[]> {
    const allResults: MentionResult[] = []
    
    for (const item of trackingItems) {
      try {
        const results = await this.checkForBrandMentions(item)
        allResults.push(...results)
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error checking mentions for item ${item.id}:`, error)
      }
    }
    
    return allResults
  }


}

export const aiTrackingService = new AITrackingService()
