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
    
    try {
      // Scan Perplexity (we have the API ready)
      const perplexityResult = await this.scanPerplexity(request)
      results.push(perplexityResult)
      
      // Scan ChatGPT (mock for now, will implement with real API)
      const chatgptResult = await this.scanChatGPT(request)
      results.push(chatgptResult)
      
      // Scan Gemini (mock for now, will implement with real API)
      const geminiResult = await this.scanGemini(request)
      results.push(geminiResult)
      
      // Store results in database
      await this.storeResults(request, results)
      
      // Update keyword tracking metrics
      await this.updateKeywordMetrics(request.keywordTrackingId, results)
      
      return results
    } catch (error) {
      console.error('AI scanning error:', error)
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
      // Use our existing Perplexity client to get real-time search results
      const response = await perplexityClient.getRealTimeInsights(query)
      
      // Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(response, request.brandName)
      
      // Extract source URLs (Perplexity doesn't provide them directly, so we'll need to enhance this)
      const sourceUrls = this.extractSourceUrls(response)
      
      return {
        platform: 'perplexity',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: response,
        brandContext: analysis.context,
        sourceUrls,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Perplexity scanning error:', error)
      return this.createErrorResult('perplexity', query, Date.now() - startTime)
    }
  }

  /**
   * Scan ChatGPT for brand mentions (mock implementation for now)
   */
  private async scanChatGPT(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    const query = this.buildQuery(request.topic, request.brandName)
    
    try {
      // TODO: Implement real ChatGPT API integration
      // For now, return mock data
      const mockResponse = await this.getMockChatGPTResponse(request)
      const analysis = await this.analyzeBrandMention(mockResponse.text, request.brandName)
      
      return {
        platform: 'chatgpt',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: mockResponse.text,
        brandContext: analysis.context,
        sourceUrls: mockResponse.sources,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('ChatGPT scanning error:', error)
      return this.createErrorResult('chatgpt', query, Date.now() - startTime)
    }
  }

  /**
   * Scan Gemini for brand mentions (mock implementation for now)
   */
  private async scanGemini(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    const query = this.buildQuery(request.topic, request.brandName)
    
    try {
      // TODO: Implement real Gemini API integration
      // For now, return mock data
      const mockResponse = await this.getMockGeminiResponse(request)
      const analysis = await this.analyzeBrandMention(mockResponse.text, request.brandName)
      
      return {
        platform: 'gemini',
        query,
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText: mockResponse.text,
        brandContext: analysis.context,
        sourceUrls: mockResponse.sources,
        confidence: analysis.confidence,
        scanDuration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Gemini scanning error:', error)
      return this.createErrorResult('gemini', query, Date.now() - startTime)
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
    // Simple URL extraction - can be enhanced with better parsing
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = responseText.match(urlRegex) || []
    
    return urls.map(url => {
      const domain = new URL(url).hostname
      return {
        url,
        domain,
        title: domain, // For now, use domain as title
        date: new Date().toISOString()
      }
    }).slice(0, 5) // Limit to 5 URLs
  }

  /**
   * Store scan results in database
   */
  private async storeResults(request: ScanRequest, results: ScanResult[]): Promise<void> {
    try {
      // Check if the new models exist in the database
      if (!(prisma as any).scanResult) {
        console.warn('ScanResult model not available - database schema needs to be updated')
        return
      }

      for (const result of results) {
        await (prisma as any).scanResult.create({
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
      // Check if the new models exist in the database
      if (!(prisma as any).keywordTracking) {
        console.warn('KeywordTracking model not available - database schema needs to be updated')
        return
      }

      // Calculate average position across platforms
      const positions = results
        .filter(r => r.position !== null)
        .map(r => r.position as number)
      
      const avgPosition = positions.length > 0 
        ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length 
        : null

      // Get current metrics for comparison
      const currentKeyword = await (prisma as any).keywordTracking.findUnique({
        where: { id: keywordTrackingId }
      })

      const previousAvgPosition = currentKeyword?.avgPosition
      const positionChange = avgPosition && previousAvgPosition 
        ? avgPosition - previousAvgPosition 
        : null

      // Update keyword tracking
      await (prisma as any).keywordTracking.update({
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
