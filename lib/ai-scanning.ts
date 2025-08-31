/**
 * AI Scanning Service
 * Handles scanning across ChatGPT, Perplexity, and Gemini for brand mentions
 */

import { perplexityClient } from './perplexity'
import { prisma } from './prisma'

export interface ScanRequest {
  userId: string
  brandTrackingId: string
  keywordTrackingId: string
  brandName: string
  keyword: string
  topic: string
}

export interface BrandMention {
  brandName: string
  position: number | null
  confidence: number
  context: string
}

export interface ScanResult {
  platform: 'chatgpt' | 'perplexity' | 'gemini'
  query: string
  brandMentioned: boolean
  position: number | null
  responseText: string
  brandContext: string | null
  sourceUrls: Array<{
    url: string
    domain: string
    title: string
    date?: string
  }>
  confidence: number
  scanDuration: number
}

export class AIScanningService {
  /**
   * Scan a single keyword/topic across all AI platforms
   */
  async scanKeyword(request: ScanRequest): Promise<ScanResult[]> {
    const results: ScanResult[] = []
    
    console.log(`🔍 Starting AI scan for: ${request.brandName} - ${request.keyword} - ${request.topic}`)
    
    try {
      // Scan Perplexity (we have the API ready)
      console.log('📡 Scanning Perplexity...')
      const perplexityResult = await this.scanPerplexity(request)
      results.push(perplexityResult)
      console.log(`✅ Perplexity scan complete: ${perplexityResult.brandMentioned ? 'Brand mentioned' : 'No mention'} at position ${perplexityResult.position}`)
      
      // Scan ChatGPT (mock for now, will implement with real API)
      console.log('📡 Scanning ChatGPT...')
      const chatgptResult = await this.scanChatGPT(request)
      results.push(chatgptResult)
      console.log(`✅ ChatGPT scan complete: ${chatgptResult.brandMentioned ? 'Brand mentioned' : 'No mention'} at position ${chatgptResult.position}`)
      
      // Scan Gemini (mock for now, will implement with real API)
      console.log('📡 Scanning Gemini...')
      const geminiResult = await this.scanGemini(request)
      results.push(geminiResult)
      console.log(`✅ Gemini scan complete: ${geminiResult.brandMentioned ? 'Brand mentioned' : 'No mention'} at position ${geminiResult.position}`)
      
      // Store results in database
      console.log('💾 Storing results in database...')
      try {
        await this.storeResults(request, results)
        console.log('✅ Results stored successfully')
      } catch (error) {
        console.warn('⚠️ Could not store scan results:', error.message)
      }
      
      // Update keyword tracking metrics
      console.log('📊 Updating keyword metrics...')
      try {
        await this.updateKeywordMetrics(request.keywordTrackingId, results)
        console.log('✅ Metrics updated successfully')
      } catch (error) {
        console.warn('⚠️ Could not update keyword metrics:', error.message)
      }
      
      console.log(`🎯 Scan complete! Found mentions in ${results.filter(r => r.brandMentioned).length} out of ${results.length} platforms`)
      return results
    } catch (error) {
      console.error('❌ AI scanning error:', error)
      throw error
    }
  }

  /**
   * Scan Perplexity AI for brand mentions
   */
  private async scanPerplexity(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    const query = this.buildQuery(request.topic, request.brandName)
    
    try {
      // Step 1: Get initial response from Perplexity
      const initialResponse = await perplexityClient.getRealTimeInsights(query)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        const sourceQuery = `For the previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await perplexityClient.getRealTimeInsights(sourceQuery)
          sourceUrls = this.extractSourceUrls(sourceResponse)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from Perplexity:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
        }
      }
      
      return {
        platform: 'perplexity',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: initialResponse,
        brandContext: analysis.context,
        sourceUrls,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Perplexity scanning error:', error)
      throw error
    }
  }

  /**
   * Scan ChatGPT for brand mentions using OpenAI API
   */
  private async scanChatGPT(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    const query = this.buildQuery(request.topic, request.brandName)
    
    try {
      // Step 1: Get initial response from ChatGPT
      const initialResponse = await this.queryChatGPT(query)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        const sourceQuery = `For your previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await this.queryChatGPT(sourceQuery)
          sourceUrls = this.extractSourceUrls(sourceResponse)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from ChatGPT:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
        }
      }
      
      return {
        platform: 'chatgpt',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: initialResponse,
        brandContext: analysis.context,
        sourceUrls,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('ChatGPT scanning error:', error)
      throw error
    }
  }

  /**
   * Scan Gemini for brand mentions using Google Gemini API
   */
  private async scanGemini(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    const query = this.buildQuery(request.topic, request.brandName)
    
    try {
      // Step 1: Get initial response from Gemini
      const initialResponse = await this.queryGemini(query)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        const sourceQuery = `For your previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await this.queryGemini(sourceQuery)
          sourceUrls = this.extractSourceUrls(sourceResponse)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from Gemini:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
        }
      }
      
      return {
        platform: 'gemini',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: initialResponse,
        brandContext: analysis.context,
        sourceUrls,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Gemini scanning error:', error)
      throw error
    }
  }

  /**
   * Query ChatGPT using OpenAI API
   */
  private async queryChatGPT(query: string): Promise<string> {
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          model: 'gpt-4',
          maxTokens: 1000
        })
      })
      
      if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.response || 'No response from ChatGPT'
    } catch (error) {
      console.error('ChatGPT query error:', error)
      throw error
    }
  }

  /**
   * Query Gemini using Google Gemini API
   */
  private async queryGemini(query: string): Promise<string> {
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          model: 'gemini-pro',
          maxTokens: 1000
        })
      })
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.response || 'No response from Gemini'
    } catch (error) {
      console.error('Gemini query error:', error)
      throw error
    }
  }

  /**
   * Build an effective query for AI platforms
   */
  private buildQuery(topic: string, brandName: string): string {
    // Create a natural query that would trigger brand mentions
    const queries = [
      `What are the best ${topic}?`,
      `Compare different ${topic} options`,
      `Which ${topic} would you recommend?`,
      `Reviews of ${topic} tools`,
      `Top ${topic} platforms for businesses`
    ]
    
    // Select a random query or use the first one
    return queries[0]
  }

  /**
   * Analyze response text for brand mentions and extract position
   */
  private async analyzeBrandMention(responseText: string, brandName: string): Promise<{
    brandMentioned: boolean
    position: number | null
    context: string | null
    confidence: number
  }> {
    // Simple brand mention detection
    const lowerResponse = responseText.toLowerCase()
    const lowerBrand = brandName.toLowerCase()
    
    // Check if brand is mentioned
    const brandMentioned = lowerResponse.includes(lowerBrand)
    
    if (!brandMentioned) {
      return {
        brandMentioned: false,
        position: null,
        context: null,
        confidence: 0
      }
    }
    
    // Extract context around the brand mention
    const brandIndex = lowerResponse.indexOf(lowerBrand)
    const contextStart = Math.max(0, brandIndex - 100)
    const contextEnd = Math.min(responseText.length, brandIndex + lowerBrand.length + 100)
    const context = responseText.substring(contextStart, contextEnd)
    
    // Determine position by analyzing the text structure
    const position = this.determineBrandPosition(responseText, brandName)
    
    // Calculate confidence based on context
    const confidence = this.calculateConfidence(context, brandName)
    
    return {
      brandMentioned: true,
      position,
      context,
      confidence
    }
  }

  /**
   * Determine the position of the brand in the response
   */
  private determineBrandPosition(responseText: string, brandName: string): number | null {
    const lines = responseText.split('\n')
    const lowerBrand = brandName.toLowerCase()
    
    // Look for numbered lists or bullet points
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes(lowerBrand)) {
        // Check if it's in a numbered list
        const numberMatch = line.match(/^\s*(\d+)/)
        if (numberMatch) {
          return parseInt(numberMatch[1])
        }
        
        // Check if it's early in the response (top 3 positions)
        if (i < 3) {
          return i + 1
        }
      }
    }
    
    return null
  }

  /**
   * Calculate confidence score for brand mention
   */
  private calculateConfidence(context: string, brandName: string): number {
    let confidence = 0.5 // Base confidence
    
    // Higher confidence if brand is mentioned with positive words
    const positiveWords = ['best', 'top', 'excellent', 'recommended', 'great', 'popular', 'leading']
    const negativeWords = ['poor', 'bad', 'avoid', 'worst', 'terrible']
    
    const lowerContext = context.toLowerCase()
    
    positiveWords.forEach(word => {
      if (lowerContext.includes(word)) confidence += 0.1
    })
    
    negativeWords.forEach(word => {
      if (lowerContext.includes(word)) confidence -= 0.2
    })
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Extract source URLs from response text
   */
  private extractSourceUrls(responseText: string): Array<{
    url: string
    domain: string
    title: string
    date?: string
  }> {
    const sources: Array<{url: string, domain: string, title: string, date?: string}> = []
    
    // Enhanced URL extraction with title parsing
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = responseText.match(urlRegex) || []
    
    // Try to extract titles from the text around URLs
    urls.forEach(url => {
      try {
        const domain = new URL(url).hostname
        
        // Look for title patterns around the URL
        const urlIndex = responseText.indexOf(url)
        const beforeText = responseText.substring(Math.max(0, urlIndex - 100), urlIndex)
        const afterText = responseText.substring(urlIndex + url.length, Math.min(responseText.length, urlIndex + url.length + 100))
        
        // Try to find a title (look for quotes, dashes, or common patterns)
        let title = domain
        const titlePatterns = [
          /[""]([^""]+)[""]/g,  // Quoted text
          /[-–—]\s*([^.\n]+)/g,  // Text after dash
          /:\s*([^.\n]+)/g,      // Text after colon
          /([A-Z][^.\n]{5,50})/g // Capitalized phrases
        ]
        
        for (const pattern of titlePatterns) {
          const matches = [...beforeText.matchAll(pattern), ...afterText.matchAll(pattern)]
          if (matches.length > 0) {
            const match = matches[0][1]?.trim()
            if (match && match.length > 5 && match.length < 100) {
              title = match
              break
            }
          }
        }
        
        sources.push({
          url,
          domain,
          title: title.length > 100 ? title.substring(0, 100) + '...' : title,
          date: new Date().toISOString()
        })
      } catch (error) {
        console.warn('Failed to parse URL:', url, error)
      }
    })
    
    // Remove duplicates and limit to 10 sources
    const uniqueSources = sources.filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    )
    
    return uniqueSources.slice(0, 10)
  }

  /**
   * Store scan results in database
   */
  private async storeResults(request: ScanRequest, results: ScanResult[]): Promise<void> {
    try {
      for (const result of results) {
        await prisma.scanResult.create({
          data: {
            userId: request.userId,
            brandTrackingId: request.brandTrackingId,
            keywordTrackingId: request.keywordTrackingId,
            platform: result.platform,
            query: result.query,
            brandMentioned: result.brandMentioned,
            position: result.position,
            responseText: result.responseText,
            brandContext: result.brandContext,
            sourceUrls: result.sourceUrls,
            confidence: result.confidence,
            scanDuration: result.scanDuration
          }
        })
      }
    } catch (error) {
      console.error('Error storing scan results:', error)
      // Don't throw error to avoid breaking the scan process
    }
  }

  /**
   * Update keyword tracking metrics based on scan results
   */
  private async updateKeywordMetrics(keywordTrackingId: string, results: ScanResult[]): Promise<void> {
    try {
      // Calculate average position across platforms
      const positions = results
        .filter(r => r.position !== null)
        .map(r => r.position as number)
      
      const avgPosition = positions.length > 0 
        ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length 
        : null

      // Get current metrics for comparison
      const currentKeyword = await prisma.keywordTracking.findUnique({
        where: { id: keywordTrackingId }
      })

      const previousAvgPosition = currentKeyword?.avgPosition
      const positionChange = avgPosition && previousAvgPosition 
        ? avgPosition - previousAvgPosition 
        : null

      // Update keyword tracking
      await prisma.keywordTracking.update({
        where: { id: keywordTrackingId },
        data: {
          avgPosition,
          chatgptPosition: results.find(r => r.platform === 'chatgpt')?.position,
          perplexityPosition: results.find(r => r.platform === 'perplexity')?.position,
          geminiPosition: results.find(r => r.platform === 'gemini')?.position,
          previousAvgPosition,
          positionChange,
          lastScanAt: new Date(),
          scanCount: { increment: 1 }
        }
      })
    } catch (error) {
      console.error('Error updating keyword metrics:', error)
    }
  }

  /**
   * Create error result for failed scans
   */
  private createErrorResult(platform: 'chatgpt' | 'perplexity' | 'gemini', query: string, duration: number): ScanResult {
    return {
      platform,
      query,
      brandMentioned: false,
      position: null,
      responseText: 'Scan failed due to API error',
      brandContext: null,
      sourceUrls: [],
      confidence: 0,
      scanDuration: duration
    }
  }



  /**
   * Mock ChatGPT response for development
   */
  private async getMockChatGPTResponse(request: ScanRequest): Promise<{
    text: string
    sources: Array<{ url: string; domain: string; title: string; date?: string }>
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const shouldMention = Math.random() > 0.5
    const position = shouldMention ? Math.floor(Math.random() * 5) + 1 : null
    
    let text = `Here are some top ${request.topic} options:\n\n`
    
    if (shouldMention && position) {
      const competitors = ['Tool A', 'Platform B', 'Service C', 'App D', 'Solution E']
      const options = [...competitors]
      options.splice(position - 1, 0, request.brandName)
      
      options.slice(0, 5).forEach((option, index) => {
        text += `${index + 1}. ${option} - Great option for businesses\n`
      })
    } else {
      text += `1. Alternative Tool - Popular choice\n2. Another Platform - Good features\n3. Different Service - Solid option\n`
    }
    
    return {
      text,
      sources: [
        {
          url: 'https://techcrunch.com/tools-review',
          domain: 'techcrunch.com',
          title: 'Best Tools Review 2025',
          date: new Date().toISOString()
        },
        {
          url: 'https://forbes.com/business-software',
          domain: 'forbes.com', 
          title: 'Top Business Software',
          date: new Date().toISOString()
        }
      ]
    }
  }

  /**
   * Mock Gemini response for development
   */
  private async getMockGeminiResponse(request: ScanRequest): Promise<{
    text: string
    sources: Array<{ url: string; domain: string; title: string; date?: string }>
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const shouldMention = Math.random() > 0.4
    const position = shouldMention ? Math.floor(Math.random() * 3) + 1 : null
    
    let text = `Based on current market analysis, here are leading ${request.topic}:\n\n`
    
    if (shouldMention && position) {
      const competitors = ['Leading Tool', 'Market Leader', 'Top Platform']
      const options = [...competitors]
      options.splice(position - 1, 0, request.brandName)
      
      options.slice(0, 3).forEach((option, index) => {
        text += `• ${option}: Excellent choice with strong market presence\n`
      })
    } else {
      text += `• Industry Standard: Widely used solution\n• Popular Choice: Great user feedback\n• Emerging Leader: Growing market share\n`
    }
    
    return {
      text,
      sources: [
        {
          url: 'https://gartner.com/research/tools',
          domain: 'gartner.com',
          title: 'Market Research Report',
          date: new Date().toISOString()
        },
        {
          url: 'https://capterra.com/software-reviews',
          domain: 'capterra.com',
          title: 'Software Reviews & Ratings',
          date: new Date().toISOString()
        }
      ]
    }
  }
}

// Export singleton instance
export const aiScanningService = new AIScanningService()
