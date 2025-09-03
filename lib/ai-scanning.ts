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
    let results: ScanResult[] = []
    
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
      console.log(`🔍 Querying Perplexity with topic: "${request.topic}"`)
      
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
              content: `Research and analyze the topic "${request.topic}". Provide a comprehensive, factual response with current information, trends, and insights. Focus on the topic itself, not any specific company or brand.`
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
                    content: `For the topic "${request.topic}", please provide specific website URLs where I can find detailed information. List actual working URLs (not just domain names) that contain relevant content about this topic. Format: 1. [URL] - [Brief description] 2. [URL] - [Brief description]`
                  }
                ],
                max_tokens: 800,
                temperature: 0.3
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
      console.log(`🔍 Querying ChatGPT with topic: "${request.topic}"`)
      
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
              content: `Research and analyze the topic "${request.topic}". Provide a comprehensive, factual response with current information, trends, and insights. Focus on the topic itself, not any specific company or brand.`
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
                  content: `For the topic "${request.topic}", please provide specific website URLs where I can find detailed information. List actual working URLs (not just domain names) that contain relevant content about this topic. Format: 1. [URL] - [Brief description] 2. [URL] - [Brief description]`
                }
              ],
              max_completion_tokens: 800,
              temperature: 0.3
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
      console.log(`🔍 Querying Gemini with topic: "${request.topic}"`)
      
      // Try gemini-2.0-flash-exp first, fallback to gemini-1.5-flash if needed
      let modelName = 'gemini-2.0-flash-exp'
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          contents: [
            {
              parts: [
                {
                  text: `Research and analyze the topic "${request.topic}". Provide a comprehensive, factual response with current information, trends, and insights. Focus on the topic itself, not any specific company or brand.`
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        })
      });
      
      // If first model fails, try fallback
      if (!response.ok && response.status === 400) {
        console.log(`⚠️ Model ${modelName} failed, trying fallback model...`)
        modelName = 'gemini-1.5-flash'
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            contents: [
              {
                parts: [
                  {
                    text: `Research and analyze the topic "${request.topic}". Provide a comprehensive, factual response with current information, trends, and insights. Focus on the topic itself, not any specific company or brand.`
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
        console.log(`🔄 Using fallback model: ${modelName}`)
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Gemini API error: ${response.status} - ${errorText}`)
        throw new Error(`Gemini API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`✅ Gemini response received in ${Date.now() - startTime}ms`)
      
      // Enhanced logging to debug response structure
      console.log(`🔍 Gemini response structure:`, {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        hasContent: !!data.candidates?.[0]?.content,
        hasParts: !!data.candidates?.[0]?.content?.parts,
        partsLength: data.candidates?.[0]?.content?.parts?.length || 0,
        hasText: !!data.candidates?.[0]?.content?.parts?.[0]?.text,
        textLength: data.candidates?.[0]?.content?.parts?.[0]?.text?.length || 0
      })
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      if (!responseText) {
        console.error(`❌ Gemini response text is empty. Full response:`, JSON.stringify(data, null, 2))
        throw new Error('Gemini returned empty response text')
      }
      
      console.log(`📝 Gemini response text (first 200 chars): ${responseText.substring(0, 200)}...`)
      
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
   * Analyze brand mention in AI response for RANKING POSITION
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

    // NEW: Check if brand mention is contextually relevant
    // If brand appears in a generic list (like search engines) but topic is unrelated, it's not relevant
    const isGenericListMention = this.isGenericListMention(responseText, brandName)
    if (isGenericListMention) {
      console.log(`⚠️ Brand "${brandName}" found in generic list but not relevant to topic - marking as not mentioned`)
      return { brandMentioned: false, position: null, confidence: 0, context: null }
    }

    // ENHANCED: Look for RANKING PATTERNS with better accuracy
    let position: number | null = null
    let context: string | null = null
    
    // Pattern 1: Numbered lists "1. Google, 2. Bing, 3. Yandex" (most accurate)
    const numberedPattern = new RegExp(`(\\d+)\\s*[.):]\\s*[^\\d]*?\\b${normalizedBrand}\\b`, 'i')
    const numberedMatch = responseText.match(numberedPattern)
    if (numberedMatch) {
      position = parseInt(numberedMatch[1])
      context = numberedMatch[0]
      console.log(`🎯 Found numbered position ${position} for brand "${brandName}"`)
    }
    
    // Pattern 2: Ordinal lists "first Google, second Bing, third Yandex"  
    if (!position) {
      const ordinalPattern = new RegExp(`(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)[^.]*?\\b${normalizedBrand}\\b`, 'i')
      const ordinalMatch = responseText.match(ordinalPattern)
      if (ordinalMatch) {
        const ordinals = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 }
        position = ordinals[ordinalMatch[1].toLowerCase() as keyof typeof ordinals] || null
        context = ordinalMatch[0]
        console.log(`🎯 Found ordinal position ${position} for brand "${brandName}"`)
      }
    }
    
    // Pattern 3: Position in comma-separated lists "Google, Bing, Yandex, DuckDuckGo" (enhanced accuracy)
    if (!position) {
      const lines = responseText.split(/[.!?\n]+/)
      for (const line of lines) {
        if (line.toLowerCase().includes(normalizedBrand)) {
          // Split by commas and find position
          const items = line.split(',').map(item => item.trim())
          for (let i = 0; i < items.length; i++) {
            if (items[i].toLowerCase().includes(normalizedBrand)) {
              position = i + 1
              context = line.trim()
              console.log(`🎯 Found comma-separated position ${position} for brand "${brandName}"`)
              break
            }
          }
          if (position) break
        }
      }
    }
    
    // Pattern 4: Bullet point lists "• Google • Bing • Yandex" (new pattern)
    if (!position) {
      // Simple bullet point detection
      const bulletLines = responseText.split(/[•\-*]/).filter(line => line.trim().length > 0)
      for (let i = 0; i < bulletLines.length; i++) {
        if (bulletLines[i].toLowerCase().includes(normalizedBrand)) {
          position = i + 1
          context = bulletLines[i].trim()
          console.log(`🎯 Found bullet point position ${position} for brand "${brandName}"`)
          break
        }
      }
    }
    
    // If still no position, brand mentioned but not in ranking context
    if (!position) {
      // Find the sentence with brand mention for context
      const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(normalizedBrand)) {
          context = sentence.trim()
          break
        }
      }
      console.log(`ℹ️ Brand "${brandName}" mentioned but not in ranking context`)
    }
    
    // Cap position at 10 (only track top 10 positions)
    if (position && position > 10) {
      console.log(`⚠️ Brand "${brandName}" position ${position} beyond trackable range (top 10)`)
      position = null  // Beyond trackable range
    }
    
    // Calculate confidence based on context and position accuracy
    const confidence = this.calculateConfidence(responseText, brandName, position)
    
    return {
      brandMentioned: true,
      position,
      confidence,
      context
    }
  }

  /**
   * Check if brand mention is in a generic list (not contextually relevant)
   */
  private isGenericListMention(responseText: string, brandName: string): boolean {
    const text = responseText.toLowerCase()
    const brand = brandName.toLowerCase()
    
    // Check if the topic is actually about the category the brand belongs to
    // If the topic is about search engines, then Yandex in a search engine list IS relevant
    const topicKeywords = {
      'search engines': ['search engine', 'search engines', 'search tool', 'search tools', 'browser search', 'web search'],
      'social media': ['social media', 'social platform', 'social platforms', 'social network', 'social networks'],
      'tech companies': ['tech company', 'tech companies', 'technology company', 'technology companies', 'software company'],
      'browsers': ['browser', 'browsers', 'web browser', 'web browsers', 'internet browser']
    }
    
    // Check if the topic is about the brand's category
    for (const [category, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        // Topic is about this category, so brand mentions in this category ARE relevant
        console.log(`✅ Topic is about ${category}, brand mentions in this category are relevant`)
        return false
      }
    }
    
    // Common generic lists where brands appear but aren't relevant to the topic
    const genericListPatterns = [
      // Search engines list
      new RegExp(`(google|bing|yandex|duckduckgo|yahoo|baidu|qwant|startpage|searx|ecosia)`, 'gi'),
      // Social media list  
      new RegExp(`(facebook|twitter|instagram|linkedin|youtube|tiktok|snapchat|pinterest|reddit|discord)`, 'gi'),
      // Tech companies list
      new RegExp(`(apple|microsoft|google|amazon|meta|netflix|tesla|uber|airbnb|spotify)`, 'gi'),
      // Browser list
      new RegExp(`(chrome|firefox|safari|edge|opera|brave|vivaldi|tor)`, 'gi')
    ]
    
    // Check if the text contains a generic list pattern
    for (const pattern of genericListPatterns) {
      const matches = text.match(pattern)
      if (matches && matches.length >= 3) { // At least 3 items in the list
        // Check if our brand is one of the items in this generic list
        if (matches.some(match => match.toLowerCase().includes(brand))) {
          console.log(`🔍 Brand "${brandName}" found in generic list: ${matches.join(', ')}`)
          return true
        }
      }
    }
    
    return false
  }

  /**
   * Calculate confidence score for brand mention
   */
  private calculateConfidence(responseText: string, brandName: string, position: number | null): number {
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
    
    // Bonus for accurate position
    if (position !== null) {
      score += 0.1 * (10 - position) / 10 // Higher score for lower positions
    }
    
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Extract URLs from text
   */
  private extractUrlsFromText(text: string): Array<{ url: string, domain: string, title: string, date?: string }> {
    console.log(`🔍 Extracting URLs from text (${text.length} chars):`, text.substring(0, 200) + '...')
    
    // Enhanced URL regex patterns
    const urlPatterns = [
      /https?:\/\/[^\s<>"{}|\\^`[\]]+/g,  // Standard URLs
      /www\.[^\s<>"{}|\\^`[\]]+/g,       // www.domain.com
      /[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})/g  // domain.com
    ]
    
    const urls: Array<{ url: string, domain: string, title: string, date?: string }> = []
    const foundUrls = new Set<string>() // Avoid duplicates
    
    for (const pattern of urlPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        try {
          let url = match[0]
          
          // Clean up URL
          url = url.replace(/[.,;!?]+$/, '') // Remove trailing punctuation
          
          // Add protocol if missing
          if (!url.startsWith('http') && !url.startsWith('www')) {
            if (url.includes('.')) {
              url = 'https://' + url
            } else {
              continue // Skip invalid domains
            }
          } else if (url.startsWith('www')) {
            url = 'https://' + url
          }
          
          // Skip if already found
          if (foundUrls.has(url)) continue
          foundUrls.add(url)
          
          const domain = new URL(url).hostname
          
          // Skip common unwanted domains
          if (domain.includes('example.com') || domain.includes('localhost')) {
            continue
          }
          
          const title = this.extractTitleFromUrl(url, text)
          
          urls.push({
            url,
            domain,
            title: title || `Content from ${domain}`,
            date: new Date().toISOString().split('T')[0]
          })
          
          console.log(`📌 Found URL: ${url} (${domain})`)
          
        } catch (error) {
          console.warn(`⚠️ Failed to parse URL: ${match[0]}`, error)
        }
      }
    }
    
    console.log(`✅ Extracted ${urls.length} valid URLs`)
    
    // Limit to top 2 most relevant URLs per AI
    const limitedUrls = urls.slice(0, 2)
    if (urls.length > 2) {
      console.log(`📝 Limiting URLs from ${urls.length} to top 2 most relevant`)
    }
    
    return limitedUrls
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
