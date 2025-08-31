/**
 * AI Scanning Service
 * Handles scanning across ChatGPT, Perplexity, and Gemini for brand mentions
 */

import { prisma } from './prisma'

interface ScanRequest {
  userId: string
  brandTrackingId: string
  keywordTrackingId: string
  brandName: string
  keyword: string
  topic: string
}

interface ScanResult {
  platform: string
  brandMentioned: boolean
  position: number | null
  responseText: string
  sourceUrls: Array<{
    url: string
    domain: string
    title: string
    date?: string
  }>
  scanDuration: number
  confidence: number
  brandContext?: string | null
}

export class AIScanningService {
  /**
   * Scan a single keyword/topic across all AI platforms
   */
  async scanKeyword(request: ScanRequest): Promise<ScanResult[]> {
    const results: ScanResult[] = []
    
    // Scan each platform
    const platforms = [
      { name: 'perplexity', method: this.scanPerplexity.bind(this) },
      { name: 'chatgpt', method: this.scanChatGPT.bind(this) },
      { name: 'gemini', method: this.scanGemini.bind(this) }
    ]
    
    console.log(`🚀 Starting PARALLEL scan for topic: "${request.topic}" across ${platforms.length} platforms`)
    const overallStartTime = Date.now()
    
    // Run all platform scans in parallel for faster execution
    const scanPromises = platforms.map(async (platform) => {
      try {
        console.log(`🚀 Starting ${platform.name.toUpperCase()} scan for topic: "${request.topic}"`)
        const startTime = Date.now()
        
        const result = await platform.method(request)
        result.scanDuration = Date.now() - startTime
        
        console.log(`✅ ${platform.name.toUpperCase()} scan completed in ${result.scanDuration}ms`)
        return result
        
      } catch (error) {
        console.error(`❌ ${platform.name.toUpperCase()} scan failed:`, error)
        // Return error result
        return {
          platform: platform.name,
          brandMentioned: false,
          position: null,
          responseText: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sourceUrls: [],
          scanDuration: 0,
          confidence: 0,
          brandContext: null
        }
      }
    })
    
    // Wait for all scans to complete
    results = await Promise.all(scanPromises)
    const overallEndTime = Date.now()
    
    console.log(`✅ PARALLEL scan completed in ${overallEndTime - overallStartTime}ms (estimated ${Math.round((overallEndTime - overallStartTime) / 1000)}s vs ~${Math.round(results.reduce((sum, r) => sum + r.scanDuration, 0) / 1000)}s sequential)`)
      
      return results
  }

  /**
   * Scan using Perplexity AI with latest sonar-pro model
   */
  private async scanPerplexity(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Querying Perplexity with topic: "${request.topic}" and brand: "${request.brandName}"`)
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: `Analyze the topic "${request.topic}" and provide a comprehensive response. Focus on current information and include specific details about "${request.brandName}" if mentioned.`
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Perplexity API error: ${response.status} - ${errorText}`)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Perplexity response received in ${Date.now() - startTime}ms`)
      
      const responseText = data.choices?.[0]?.message?.content || ''
      const searchResults = data.search_results || []
      
      console.log(`📊 Perplexity search results: ${searchResults.length} found`)
      
      // Analyze brand mention
      const analysis = this.analyzeBrandMention(responseText, request.brandName)
      
      // Extract source URLs from search results
      let sourceUrls = searchResults.map((result: any) => ({
        url: result.url,
        domain: new URL(result.url).hostname,
        title: result.title,
        date: result.date || result.last_updated
      }))
      
      // If no search results, ask for source URLs as follow-up
      if (sourceUrls.length === 0) {
        console.log(`🔍 No search results from Perplexity, asking for source URLs...`)
        try {
          const sourceResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'sonar-pro',
              messages: [
                {
                  role: 'user',
                  content: `Can you provide source URLs for information about "${request.topic}"? Please list actual website URLs where this information can be found.`
                }
              ]
            })
          })
          
          if (sourceResponse.ok) {
            const sourceData = await sourceResponse.json()
            const sourceText = sourceData.choices?.[0]?.message?.content || ''
            sourceUrls = this.extractUrlsFromText(sourceText)
            console.log(`📌 Extracted ${sourceUrls.length} source URLs from follow-up query`)
          }
        } catch (error) {
          console.warn('Failed to get source URLs from follow-up:', error)
          sourceUrls = this.extractUrlsFromText(responseText)
        }
      }
      
      return {
        platform: 'perplexity',
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText,
        sourceUrls,
        scanDuration: Date.now() - startTime,
        confidence: analysis.confidence,
        brandContext: analysis.context
      }
      
    } catch (error) {
      console.error(`❌ Perplexity scan failed:`, error)
      throw error
    }
  }

  /**
   * Scan using ChatGPT with latest gpt-5 model
   */
  private async scanChatGPT(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Querying ChatGPT with topic: "${request.topic}" and brand: "${request.brandName}"`)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',  // Use available model instead of gpt-5
          messages: [
            {
              role: 'user',
              content: `Analyze the topic "${request.topic}" and provide a comprehensive response. Focus on current information and include specific details about "${request.brandName}" if mentioned.`
            }
          ],
          max_completion_tokens: 2000,  // Use max_completion_tokens instead of max_tokens
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ ChatGPT API error: ${response.status} - ${errorText}`)
        throw new Error(`ChatGPT API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ ChatGPT response received in ${Date.now() - startTime}ms`)
      
      const responseText = data.choices?.[0]?.message?.content || ''
      
      // Analyze brand mention
      const analysis = this.analyzeBrandMention(responseText, request.brandName)
      
      // Ask for source URLs as follow-up (ChatGPT doesn't provide them automatically)
      let sourceUrls: any[] = []
      console.log(`🔍 Asking ChatGPT for source URLs...`)
      try {
        const sourceResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: `Can you provide source URLs for information about "${request.topic}"? Please list actual website URLs where this information can be found.`
              }
            ],
            max_completion_tokens: 500,
            temperature: 0.7
          })
        })
        
        if (sourceResponse.ok) {
          const sourceData = await sourceResponse.json()
          const sourceText = sourceData.choices?.[0]?.message?.content || ''
          sourceUrls = this.extractUrlsFromText(sourceText)
          console.log(`📌 Extracted ${sourceUrls.length} source URLs from ChatGPT follow-up`)
        }
      } catch (error) {
        console.warn('Failed to get source URLs from ChatGPT follow-up:', error)
        sourceUrls = this.extractUrlsFromText(responseText)
      }
      
      return {
        platform: 'chatgpt',
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText,
        sourceUrls,
        scanDuration: Date.now() - startTime,
        confidence: analysis.confidence,
        brandContext: analysis.context
      }
      
    } catch (error) {
      console.error(`❌ ChatGPT scan failed:`, error)
      throw error
    }
  }

  /**
   * Scan using Gemini with latest gemini-2.5-flash model
   */
  private async scanGemini(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Querying Gemini with topic: "${request.topic}" and brand: "${request.brandName}"`)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          contents: [
            {
              parts: [
                {
                  text: `Analyze the topic "${request.topic}" and provide a comprehensive response. Focus on current information and include specific details about "${request.brandName}" if mentioned.`
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Gemini API error: ${response.status} - ${errorText}`)
        throw new Error(`Gemini API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`✅ Gemini response received in ${Date.now() - startTime}ms`)
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      // Analyze brand mention
      const analysis = this.analyzeBrandMention(responseText, request.brandName)
      
      // Extract URLs from response text
      const sourceUrls = this.extractUrlsFromText(responseText)
      
      return {
        platform: 'gemini',
        brandMentioned: analysis.brandMentioned,
        position: analysis.position,
        responseText,
        sourceUrls,
        scanDuration: Date.now() - startTime,
        confidence: analysis.confidence,
        brandContext: analysis.context
      }
      
    } catch (error) {
      console.error(`❌ Gemini scan failed:`, error)
      throw error
    }
  }

  /**
   * Analyze brand mention in AI response
   */
  private analyzeBrandMention(responseText: string, brandName: string): {
    brandMentioned: boolean
    position: number | null
    confidence: number
    context: string | null
  } {
    if (!responseText || !brandName) {
      return { brandMentioned: false, position: null, confidence: 0, context: null }
    }

    const normalizedResponse = responseText.toLowerCase()
    const normalizedBrand = brandName.toLowerCase()
    
    // Check if brand is mentioned
    if (!normalizedResponse.includes(normalizedBrand)) {
      return { brandMentioned: false, position: null, confidence: 0, context: null }
    }

    // Find position of brand mention
    const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    let position: number | null = null
    let context: string | null = null
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      if (sentence.toLowerCase().includes(normalizedBrand)) {
        position = i + 1
        context = sentence.trim()
        break
      }
    }
    
    // Calculate confidence based on context
    const confidence = this.calculateConfidence(responseText, brandName)
    
    return {
      brandMentioned: true,
      position,
      confidence,
      context
    }
  }

  /**
   * Calculate confidence score for brand mention
   */
  private calculateConfidence(responseText: string, brandName: string): number {
    let score = 0.5 // Base score
    
    const positiveKeywords = ['best', 'excellent', 'amazing', 'great', 'top', 'premium', 'quality', 'recommended', 'outstanding', 'superior', 'leading', 'innovative']
    const negativeKeywords = ['worst', 'bad', 'poor', 'terrible', 'avoid', 'disappointing', 'inferior', 'subpar', 'unreliable']
    
    const text = responseText.toLowerCase()
    
    // Check for positive indicators
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 0.1
    })
    
    // Check for negative indicators
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) score -= 0.1
    })
    
    // Check for specific mention patterns
    if (text.includes(`"${brandName}"`)) score += 0.2
    if (text.includes(`'${brandName}'`)) score += 0.2
    
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Extract URLs from text
   */
  private extractUrlsFromText(text: string): Array<{ url: string, domain: string, title: string, date?: string }> {
    const urlRegex = /https?:\/\/([^\s]+)/g
    const urls: Array<{ url: string, domain: string, title: string, date?: string }> = []
    
    let match
    while ((match = urlRegex.exec(text)) !== null) {
      try {
        const url = match[0]
        const domain = new URL(url).hostname
        const title = this.extractTitleFromUrl(url, text)
        
        urls.push({
          url,
          domain,
          title: title || `Content from ${domain}`,
          date: new Date().toISOString().split('T')[0]
        })
      } catch (error) {
        console.warn(`⚠️ Failed to parse URL: ${match[0]}`, error)
      }
    }
    
    return urls
  }

  /**
   * Extract title from URL context
   */
  private extractTitleFromUrl(url: string, contextText: string): string | null {
    const beforeText = contextText.substring(Math.max(0, contextText.indexOf(url) - 100))
    const afterText = contextText.substring(contextText.indexOf(url) + url.length, contextText.indexOf(url) + url.length + 100)
    
    const titlePatterns = [
      /"([^"]+)"/,           // Quoted text
      /'([^']+)'/,           // Single quoted text
      /\[([^\]]+)\]/,        // Bracket text
      /([A-Z][^.!?]*[.!?])/  // Sentence starting with capital
    ]
    
    for (const pattern of titlePatterns) {
      const match = beforeText.match(pattern) || afterText.match(pattern)
      if (match && match[1] && match[1].length > 10 && match[1].length < 100) {
        return match[1].trim()
      }
    }
    
    return null
  }

  /**
   * Store scan results in database
   */
  async storeScanResults(request: ScanRequest, results: ScanResult[]): Promise<void> {
    try {
      for (const result of results) {
        await prisma.scanResult.create({
          data: {
            userId: request.userId,
            brandTrackingId: request.brandTrackingId,
            keywordTrackingId: request.keywordTrackingId,
            platform: result.platform,
            query: `${request.topic} - ${request.brandName}`,
            brandMentioned: result.brandMentioned,
            position: result.position,
            responseText: result.responseText,
            brandContext: result.brandContext,
            sourceUrls: result.sourceUrls,
            scanDuration: result.scanDuration,
            confidence: result.confidence
          }
        })
      }
      
      // Update keyword tracking metrics
      await this.updateKeywordMetrics(request.keywordTrackingId, results)
      
    } catch (error) {
      console.error('Failed to store scan results:', error)
      throw error
    }
  }

  /**
   * Update keyword tracking metrics
   */
  private async updateKeywordMetrics(keywordTrackingId: string, results: ScanResult[]): Promise<void> {
    try {
      const keywordTracking = await prisma.keywordTracking.findUnique({
        where: { id: keywordTrackingId }
      })

      if (!keywordTracking) return
      
      const mentions = results.filter(r => r.brandMentioned)
      const avgPosition = mentions.length > 0 
        ? mentions.reduce((sum, r) => sum + (r.position || 0), 0) / mentions.length 
        : null

      await prisma.keywordTracking.update({
        where: { id: keywordTrackingId },
        data: {
          avgPosition,
          chatgptPosition: results.find(r => r.platform === 'chatgpt')?.position || null,
          perplexityPosition: results.find(r => r.platform === 'perplexity')?.position || null,
          geminiPosition: results.find(r => r.platform === 'gemini')?.position || null,
          lastScanAt: new Date(),
          scanCount: { increment: 1 }
        }
      })
      
    } catch (error) {
      console.error('Failed to update keyword metrics:', error)
    }
  }
}

export const aiScanningService = new AIScanningService()
