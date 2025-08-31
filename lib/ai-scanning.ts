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
      
      // Scan ChatGPT using OpenAI API
      console.log('📡 Scanning ChatGPT...')
      const chatgptResult = await this.scanChatGPT(request)
      results.push(chatgptResult)
      console.log(`✅ ChatGPT scan complete: ${chatgptResult.brandMentioned ? 'Brand mentioned' : 'No mention'} at position ${chatgptResult.position}`)
      
      // Scan Gemini using Google Gemini API
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
      console.log(`🔍 Perplexity Query: ${query}`)
      const initialResponse = await perplexityClient.getRealTimeInsights(query)
      console.log(`📝 Perplexity Response: ${initialResponse.substring(0, 200)}...`)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      console.log(`🔍 Brand Analysis: ${analysis.brandMentioned ? 'MENTIONED' : 'NOT MENTIONED'} at position ${analysis.position}`)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        console.log('🔗 Requesting source URLs from Perplexity...')
        const sourceQuery = `For your previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await perplexityClient.getRealTimeInsights(sourceQuery)
          console.log(`📝 Source Response: ${sourceResponse.substring(0, 200)}...`)
          sourceUrls = this.extractSourceUrls(sourceResponse)
          console.log(`🔗 Extracted ${sourceUrls.length} source URLs`)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from Perplexity:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
          console.log(`🔗 Fallback: Extracted ${sourceUrls.length} source URLs from initial response`)
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
      console.log(`🔍 ChatGPT Query: ${query}`)
      const initialResponse = await this.queryChatGPT(query)
      console.log(`📝 ChatGPT Response: ${initialResponse.substring(0, 200)}...`)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      console.log(`🔍 Brand Analysis: ${analysis.brandMentioned ? 'MENTIONED' : 'NOT MENTIONED'} at position ${analysis.position}`)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        console.log('🔗 Requesting source URLs from ChatGPT...')
        const sourceQuery = `For your previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await this.queryChatGPT(sourceQuery)
          console.log(`📝 Source Response: ${sourceResponse.substring(0, 200)}...`)
          sourceUrls = this.extractSourceUrls(sourceResponse)
          console.log(`🔗 Extracted ${sourceUrls.length} source URLs`)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from ChatGPT:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
          console.log(`🔗 Fallback: Extracted ${sourceUrls.length} source URLs from initial response`)
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
      console.log(`🔍 Gemini Query: ${query}`)
      const initialResponse = await this.queryGemini(query)
      console.log(`📝 Gemini Response: ${initialResponse.substring(0, 200)}...`)
      
      // Step 2: Analyze the response for brand mentions
      const analysis = await this.analyzeBrandMention(initialResponse, request.brandName)
      console.log(`🔍 Brand Analysis: ${analysis.brandMentioned ? 'MENTIONED' : 'NOT MENTIONED'} at position ${analysis.position}`)
      
      // Step 3: If brand is mentioned, ask for source URLs
      let sourceUrls: Array<{url: string, domain: string, title: string, date?: string}> = []
      if (analysis.brandMentioned) {
        console.log('🔗 Requesting source URLs from Gemini...')
        const sourceQuery = `For your previous response about ${request.topic}, please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title.`
        try {
          const sourceResponse = await this.queryGemini(sourceQuery)
          console.log(`📝 Source Response: ${sourceResponse.substring(0, 200)}...`)
          sourceUrls = this.extractSourceUrls(sourceResponse)
          console.log(`🔗 Extracted ${sourceUrls.length} source URLs`)
        } catch (sourceError) {
          console.warn('Failed to get source URLs from Gemini:', sourceError)
          // Fallback to basic URL extraction from initial response
          sourceUrls = this.extractSourceUrls(initialResponse)
          console.log(`🔗 Fallback: Extracted ${sourceUrls.length} source URLs from initial response`)
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
        const errorText = await response.text()
        throw new Error(`ChatGPT API error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      if (!data.response) {
        throw new Error('No response from ChatGPT API')
      }
      return data.response
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
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      if (!data.response) {
        throw new Error('No response from Gemini API')
      }
      return data.response
    } catch (error) {
      console.error('Gemini query error:', error)
      throw error
    }
  }

  /**
   * Build an effective query for AI platforms
   */
  private buildQuery(topic: string, brandName: string): string {
    // Create specific queries for search engines and other topics
    if (topic.toLowerCase().includes('search engine') || topic.toLowerCase().includes('search engines')) {
      return `What are the best search engines available today? Please provide a comprehensive list with brief descriptions of each search engine's features and strengths.`
    }
    
    if (topic.toLowerCase().includes('yandex')) {
      return `Tell me about Yandex search engine. What are its features, how does it compare to other search engines, and what makes it unique?`
    }
    
    // Generic queries for other topics
    const queries = [
      `What are the best ${topic}? Please provide a comprehensive list with brief descriptions.`,
      `Compare different ${topic} options and tell me which ones are most popular or recommended.`,
      `Which ${topic} would you recommend for businesses? Please explain your reasoning.`,
      `Give me reviews and comparisons of ${topic} tools and platforms.`,
      `What are the top ${topic} platforms available today? Please rank them by popularity or effectiveness.`
    ]
    
    // Select the most appropriate query based on the topic
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
        
        // Check for bullet points or other list indicators
        if (line.includes('•') || line.includes('-') || line.includes('*')) {
          // Count previous list items to determine position
          let listPosition = 1
          for (let j = 0; j < i; j++) {
            const prevLine = lines[j].toLowerCase()
            if (prevLine.includes('•') || prevLine.includes('-') || prevLine.includes('*') || /^\s*\d+/.test(prevLine)) {
              listPosition++
            }
          }
          return listPosition
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
    const positiveWords = ['best', 'top', 'excellent', 'recommended', 'great', 'popular', 'leading', 'powerful', 'innovative']
    const negativeWords = ['poor', 'bad', 'avoid', 'worst', 'terrible', 'outdated', 'limited']
    
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
    
    console.log(`🔍 Found ${urls.length} URLs in response text`)
    
    // Try to extract titles from the text around URLs
    urls.forEach((url, index) => {
      try {
        const domain = new URL(url).hostname
        
        // Look for title patterns around the URL
        const urlIndex = responseText.indexOf(url)
        const beforeText = responseText.substring(Math.max(0, urlIndex - 150), urlIndex)
        const afterText = responseText.substring(urlIndex + url.length, Math.min(responseText.length, urlIndex + url.length + 150))
        
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
        
        // If no title found, try to extract from surrounding text
        if (title === domain) {
          const surroundingText = beforeText + ' ' + afterText
          const words = surroundingText.split(/\s+/).filter(word => word.length > 3)
          if (words.length > 0) {
            title = words.slice(0, 3).join(' ') + '...'
          }
        }
        
        sources.push({
          url,
          domain,
          title: title.length > 100 ? title.substring(0, 100) + '...' : title,
          date: new Date().toISOString()
        })
        
        console.log(`🔗 URL ${index + 1}: ${domain} - ${title}`)
      } catch (error) {
        console.warn('Failed to parse URL:', url, error)
      }
    })
    
    // Remove duplicates and limit to 10 sources
    const uniqueSources = sources.filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    )
    
    console.log(`✅ Extracted ${uniqueSources.length} unique source URLs`)
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
      
      const avgPosition = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : null
      
      // Get current keyword tracking record
      const currentKeyword = await prisma.keywordTracking.findUnique({
        where: { id: keywordTrackingId }
      })
      
      if (currentKeyword) {
        // Calculate position change
        const positionChange = currentKeyword.avgPosition && avgPosition 
          ? currentKeyword.avgPosition - avgPosition 
          : null
        
        // Update the record
        await prisma.keywordTracking.update({
          where: { id: keywordTrackingId },
          data: {
            avgPosition,
            positionChange,
            chatgptPosition: results.find(r => r.platform === 'chatgpt')?.position || null,
            perplexityPosition: results.find(r => r.platform === 'perplexity')?.position || null,
            geminiPosition: results.find(r => r.platform === 'gemini')?.position || null,
            lastScanAt: new Date(),
            scanCount: { increment: 1 }
          }
        })
      }
    } catch (error) {
      console.error('Error updating keyword metrics:', error)
      // Don't throw error to avoid breaking the scan process
    }
  }
}

export const aiScanningService = new AIScanningService()
