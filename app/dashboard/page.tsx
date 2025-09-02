'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Brain, 
  Zap, 
  Target, 
  Globe, 
  BarChart3, 
  User, 
  LogOut, 
  AlertCircle, 
  Info, 
  Plus,
  Settings,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
  ArrowRight,
  Home,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  Clock,
  Bot,
  Sparkles,
  XCircle,
  RefreshCw
} from "lucide-react"
import { toast } from 'sonner'
import { ProjectModal } from "@/components/project-modal"
import { ProjectSelectionModal } from "@/components/project-selection-modal"
import { AddMentionModal } from "@/components/add-mention-modal"
import { EditProjectModal } from "@/components/edit-project-modal"
import { MentionChart } from "@/components/mention-chart"
import { AddKeywordModal } from "@/components/add-keyword-modal"
import { AccountDropdown } from "@/components/account-dropdown"


// Utility functions for generating realistic data
const getRealisticDomain = (platform: string): string => {
  const domains = {
    chatgpt: 'openai.com',
    perplexity: 'perplexity.ai',
    gemini: 'google.com',
    claude: 'anthropic.com',
    bard: 'google.com'
  }
  return domains[platform as keyof typeof domains] || 'example.com'
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}

const getRealisticTitle = (platform: string, topic: string, keyword: string): string => {
  const titles = {
    chatgpt: `ChatGPT Analysis: ${topic} - ${keyword}`,
    perplexity: `Perplexity AI Research: ${topic} and ${keyword}`,
    gemini: `Gemini AI Insights: ${topic} - ${keyword} Analysis`,
    claude: `Claude AI Report: ${topic} and ${keyword} Trends`,
    bard: `Google Bard Analysis: ${topic} - ${keyword} Research`
  }
  return titles[platform as keyof typeof titles] || `${topic} - ${keyword} Analysis`
}

interface Project {
  id: string
  name: string
  website: string
  brandName: string
  description: string
  createdAt: string
  status: 'active' | 'paused'
  keywordsTracked: number
  mentionsFound: number
  lastActivity: string
}

interface DashboardStats {
  totalProjects: number
  activeKeywords: number
  totalMentions: number
  thisMonthMentions: number
  growthRate: number
}

type SidebarItem = 'overview' | 'projects' | 'keyword-research' | 'mention-tracking'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeItem, setActiveItem] = useState<SidebarItem>('overview')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false)
  const [selectedTopicData, setSelectedTopicData] = useState<{keyword: string, topic: string} | null>(null)
  const [mentionResults, setMentionResults] = useState<any[]>([])
  const [mentionsPage, setMentionsPage] = useState(1)
  const [mentionsPageSize] = useState(10)
  const [isTracking, setIsTracking] = useState(false)
  const [scanningProjects, setScanningProjects] = useState<Set<string>>(new Set())
  const [dataSources, setDataSources] = useState<any[]>([])
  const [dataSourcesPage, setDataSourcesPage] = useState(1)
  const [dataSourcesPageSize] = useState(10)
  const [lastScheduledCheck, setLastScheduledCheck] = useState<string | null>(null)
  const [isAddMentionModalOpen, setIsAddMentionModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [isAddKeywordModalOpen, setIsAddKeywordModalOpen] = useState(false)
  
  // Keyword Research State
  const [keywordInput, setKeywordInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [keywordResults, setKeywordResults] = useState<any>(null)
  
  // Topic refresh state
  const [refreshingTopics, setRefreshingTopics] = useState<Set<string>>(new Set())
  
  // Tracking data refresh state
  const [trackingDataVersion, setTrackingDataVersion] = useState(0)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    // Load projects from database instead of demo data
    loadProjectsFromDatabase()
    // Load mention results
    loadMentionResults()
    // Load data sources
    fetchDataSources()
    // Also clean up any orphaned localStorage items on component mount
    cleanupOrphanedLocalStorageItems()
    // Clean up corrupted localStorage data - temporarily disabled to fix crash
    // cleanupCorruptedLocalStorage()
  }, [])
  
  // Re-render when tracking data is updated from database
  useEffect(() => {
    if (trackingDataVersion > 0) {
      console.log('🔄 Tracking data updated, triggering UI refresh...')
    }
  }, [trackingDataVersion])

  const fetchDataSources = async () => {
    try {
      console.log('🔍 Fetching data sources from API...')
      
      const response = await fetch('/api/mentions/sources', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.sources) {
        console.log(`✅ Loaded ${data.sources.length} data sources`)
        
        // Transform the sources data for the dashboard
        const transformedSources = data.sources.flatMap((source: any) => 
          source.urls.map((url: any, index: number) => ({
            id: `${source.id}-${index}`,
            url: url.url,
            domain: url.domain,
            title: url.title || `${source.platform} source for ${source.keyword}`,
            date: source.scanDate,
            brand: source.brandName,
            keyword: source.keyword,
            topic: source.topic,
            platform: source.platform,
            position: source.position,
            confidence: source.confidence
          }))
        )
        
        setDataSources(transformedSources)
        setDataSourcesPage(1)
        console.log(`📊 Transformed ${transformedSources.length} source URLs for display`)
      } else {
        console.log('📭 No data sources available yet')
        setDataSources([])
      }
    } catch (error) {
      console.error('❌ Error fetching data sources:', error)
      // Set empty array on error instead of keeping old data
      setDataSources([])
    }
  }

  const startProjectScan = async (projectId: string, projectName: string) => {
    try {
      // Simulate AI scanning for now (since the real API needs database setup)
      console.log(`Starting AI scan simulation for project: ${projectName}`)
      
      // Simulate scanning across AI platforms
      const platforms = ['ChatGPT', 'Perplexity', 'Gemini']
      let totalMentions = 0
      
      for (const platform of platforms) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simulate finding mentions (random for demo)
        const hasMentions = Math.random() > 0.3
        if (hasMentions) {
          totalMentions++
          
          // Create a simulated mention result
          const simulatedMention = {
            id: Date.now().toString() + Math.random(),
            projectId,
            projectName,
            brandName: projects.find(p => p.id === projectId)?.brandName || 'Unknown',
            keyword: 'AI Research',
            topic: 'AI platform analysis',
            aiResponse: `Simulated response from ${platform} about ${projectName}`,
            hasMention: true,
            mentionType: 'positive',
            detectedAt: new Date().toISOString(),
            source: platform.toLowerCase(),
            content: `Found mention of ${projectName} in ${platform} responses`,
            position: Math.floor(Math.random() * 5) + 1
          }
          
          // Add to mention results
          setMentionResults(prev => [simulatedMention, ...prev])
          
          // Update localStorage
          const existingResults = JSON.parse(localStorage.getItem('mentionResults') || '[]')
          const updatedResults = [simulatedMention, ...existingResults]
          localStorage.setItem('mentionResults', JSON.stringify(updatedResults))
        }
      }
      
      if (totalMentions > 0) {
        toast.success(`AI scan completed! Found ${totalMentions} mentions across platforms`)
      } else {
        toast.info('AI scan completed. No new mentions found this time.')
      }
      
      // Refresh data sources
      setTimeout(fetchDataSources, 1000)
      
    } catch (error) {
      console.error('Error starting scan:', error)
      toast.error(`Failed to start scan for ${projectName}`)
    } finally {
      // Remove from scanning set
      setScanningProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  // Real AI integration functions
  const queryAI = async (platform: string, topic: string): Promise<string> => {
    try {
      let response: string = ''
      
      switch (platform) {
        case 'chatgpt':
          const chatgptResponse = await fetch('/api/openai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: topic })
          })
          if (chatgptResponse.ok) {
            const data = await chatgptResponse.json()
            response = data.response
          }
          break
          
        case 'perplexity':
          const perplexityResponse = await fetch('/api/perplexity/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: topic })
          })
          if (perplexityResponse.ok) {
            const data = await perplexityResponse.json()
            response = data.response
          }
          break
          
        case 'gemini':
          const geminiResponse = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: topic })
          })
          if (geminiResponse.ok) {
            const data = await geminiResponse.json()
            response = data.response
          }
          break
      }
      
      return response || `No response from ${platform}`
    } catch (error) {
      console.error(`Error querying ${platform}:`, error)
      return `Error getting response from ${platform}`
    }
  }

  const getSourceURLs = async (platform: string, topic: string, originalResponse: string): Promise<any[]> => {
    try {
      const sourceQuery = `For your previous response about "${topic}", please provide the specific URLs and sources you used to get this information. List each source with its URL, domain name, and title. If you don't have specific sources, please say so.`
      
      let sourceResponse: string = ''
      
      switch (platform) {
        case 'chatgpt':
          const chatgptResponse = await fetch('/api/openai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: sourceQuery })
          })
          if (chatgptResponse.ok) {
            const data = await chatgptResponse.json()
            sourceResponse = data.response
          }
          break
          
        case 'perplexity':
          const perplexityResponse = await fetch('/api/perplexity/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: sourceQuery })
          })
          if (perplexityResponse.ok) {
            const data = await perplexityResponse.json()
            sourceResponse = data.response
          }
          break
          
        case 'gemini':
          const geminiResponse = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: sourceQuery })
          })
          if (geminiResponse.ok) {
            const data = await geminiResponse.json()
            sourceResponse = data.response
          }
          break
      }
      
      // Extract real URLs from the AI response
      const urls = extractRealURLs(sourceResponse)
      
      return urls.map((url, index) => ({
        id: `source-${Date.now()}-${index}`,
        url: url,
        domain: new URL(url).hostname,
        title: `Source from ${platform} for ${topic}`,
        date: new Date().toISOString(),
        keyword: topic,
        platform
      }))
      
    } catch (error) {
      console.error(`Error getting source URLs from ${platform}:`, error)
      return []
    }
  }

  const extractRealURLs = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = text.match(urlRegex) || []
    return urls.filter(url => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }).slice(0, 5) // Limit to 5 URLs
  }

  const analyzeBrandMention = (response: string, brandName: string): boolean => {
    if (!response || !brandName) return false
    
    const normalizedResponse = response.toLowerCase()
    const normalizedBrand = brandName.toLowerCase()
    
    // Check for exact brand name mentions
    if (normalizedResponse.includes(normalizedBrand)) return true
    
    // Check for partial matches (e.g., "Icecream brand" vs "Icecream")
    const brandWords = normalizedBrand.split(' ')
    return brandWords.some(word => 
      word.length > 2 && normalizedResponse.includes(word)
    )
  }

  const calculateBrandPosition = (response: string, brandName: string): number | null => {
    if (!response || !brandName) return null
    
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].toLowerCase()
      const normalizedBrand = brandName.toLowerCase()
      
      if (sentence.includes(normalizedBrand)) {
        // Position is 1-based, and we want to show ranking
        return Math.min(i + 1, 5) // Cap at position 5
      }
    }
    
    return null
  }

  const determineMentionType = (response: string, brandName: string): 'positive' | 'negative' | 'neutral' => {
    if (!response || !brandName) return 'neutral'
    
    const normalizedResponse = response.toLowerCase()
    const normalizedBrand = brandName.toLowerCase()
    
    // Find the sentence containing the brand mention
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const brandSentence = sentences.find(s => 
      s.toLowerCase().includes(normalizedBrand)
    )
    
    if (!brandSentence) return 'neutral'
    
    const sentence = brandSentence.toLowerCase()
    
    // Positive indicators
    const positiveWords = ['best', 'excellent', 'amazing', 'great', 'top', 'premium', 'quality', 'recommended', 'outstanding', 'superior']
    if (positiveWords.some(word => sentence.includes(word))) return 'positive'
    
    // Negative indicators
    const negativeWords = ['worst', 'bad', 'poor', 'terrible', 'avoid', 'disappointing', 'inferior', 'subpar', 'unreliable']
    if (negativeWords.some(word => sentence.includes(word))) return 'negative'
    
    return 'neutral'
  }

  const startFullProjectScan = async (projectId: string, projectName: string) => {
    try {
      console.log(`Starting full AI scan for project: ${projectName}`)
      
      // Add to scanning set
      setScanningProjects(prev => new Set(prev).add(projectId))
      
      // Get all tracking items for this project
      const trackingItems = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
        .filter((item: any) => item.projectId === projectId)
      
      if (trackingItems.length === 0) {
        toast.info('No topics to scan. Add some keywords and topics first.')
        setScanningProjects(prev => {
          const newSet = new Set(prev)
          newSet.delete(projectId)
          return newSet
        })
        return
      }
      
      const project = projects.find(p => p.id === projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      
      let totalMentions = 0
      const platforms = ['chatgpt', 'perplexity', 'gemini']
      
      // Scan each topic for this project using REAL AI scanning
      for (const trackingItem of trackingItems) {
        console.log(`Scanning topic: ${trackingItem.topic} for keyword: ${trackingItem.keyword}`)
        
        try {
          // Find the actual database keywordTrackingId by matching keyword and topic
          // For now, scan all keywords since we don't have direct access to keywordTracking IDs
          // The backend will handle keyword-specific scanning when we implement it properly
          let keywordTrackingId = undefined
          
          // Call the real AI scanning API - scan ONLY this specific keyword if we found the ID
          const scanResponse = await fetch('/api/mentions/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              brandTrackingId: project.id, // Use the actual database brand tracking ID
              keywordTrackingId: keywordTrackingId, // Scan ONLY this specific keyword (or undefined to scan all)
              immediate: true 
            })
          })
          
          if (scanResponse.ok) {
            const scanData = await scanResponse.json()
            console.log(`✅ Scan completed for ${project.name} - ${trackingItem.topic}`)
            
            // Process real scan results
            if (scanData.results && Array.isArray(scanData.results)) {
              console.log(`📊 Processing ${scanData.results.length} scan results`)
              
              for (const result of scanData.results) {
                console.log(`🔍 Processing result for keyword: ${result.keyword}`)
                
                if (result.results && Array.isArray(result.results)) {
                  for (const platformResult of result.results) {
                    console.log(`📱 Platform ${platformResult.platform}: brandMentioned=${platformResult.brandMentioned}`)
                    
                    // Always create a result entry (found or not found)
                    const mentionResult = {
                      id: Date.now().toString() + Math.random(),
                      projectId,
                      projectName: project.name,
                      brandName: project.brandName,
                      keyword: trackingItem.keyword,
                      topic: trackingItem.topic,
                      aiResponse: platformResult.responseText || `AI response from ${platformResult.platform} about ${trackingItem.topic}`,
                      hasMention: platformResult.brandMentioned,
                      mentionType: platformResult.brandMentioned ? 'positive' : 'neutral',
                      detectedAt: new Date().toISOString(),
                      source: platformResult.platform,
                      content: platformResult.brandMentioned 
                        ? `Found mention of ${project.brandName} in ${platformResult.platform} response about "${trackingItem.topic}" at position ${platformResult.position}`
                        : `No mention of ${project.brandName} found in ${platformResult.platform} response about "${trackingItem.topic}"`,
                      position: platformResult.position,
                      platform: platformResult.platform
                    }
                    
                    // Add to mention results
                    setMentionResults(prev => [mentionResult, ...prev])
                    
                    // Update localStorage
                    const existingResults = JSON.parse(localStorage.getItem('mentionResults') || '[]')
                    const updatedResults = [mentionResult, ...existingResults]
                    localStorage.setItem('mentionResults', JSON.stringify(updatedResults))
                    
                    // Always process source URLs (even if no mention found)
                    if (platformResult.sourceUrls && Array.isArray(platformResult.sourceUrls)) {
                      const sourceUrls = platformResult.sourceUrls.map((urlData: any) => ({
                        id: `source-${Date.now()}-${Math.random()}`,
                        url: urlData.url,
                        domain: urlData.domain,
                        title: urlData.title,
                        date: urlData.date || new Date().toISOString(),
                        keyword: trackingItem.keyword,
                        platform: platformResult.platform,
                        brandMentioned: platformResult.brandMentioned
                      }))
                      
                      // Add to data sources
                      setDataSources(prev => [...sourceUrls, ...prev])
                    }
                    
                    // Count mentions for success message
                    if (platformResult.brandMentioned) {
                      totalMentions++
                    }
                  }
                }
              }
            }
          } else {
            const errorData = await scanResponse.json()
            console.error(`❌ Scan failed for ${project.name}:`, errorData)
            toast.error(`Scan failed for ${project.name}: ${errorData.error || 'Unknown error'}`)
          }
          
          // Add delay between scans to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (scanError) {
          console.error(`❌ Error scanning ${project.name} - ${trackingItem.topic}:`, scanError)
          toast.error(`Failed to scan ${project.name}: ${trackingItem.topic}`)
        }
      }
      
      toast.success(`AI scanning completed! Found ${totalMentions} mentions across all projects.`)
      
      // Refresh data sources
      setTimeout(fetchDataSources, 1000)
      
    } catch (error) {
      console.error('Error starting full project scan:', error)
      toast.error(`Failed to start scan for ${projectName}`)
    } finally {
      // Remove from scanning set
      setScanningProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const startFullScanAllProjects = async () => {
    try {
      console.log('Starting full AI scan for ALL projects')
      
      // Get all tracking items across all projects
      const allTrackingItems = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
      
      if (allTrackingItems.length === 0) {
        toast.info('No topics to scan. Add some keywords and topics first.')
        return
      }
      
      // Group tracking items by project
      const trackingByProject = allTrackingItems.reduce((acc: any, item: any) => {
        if (!acc[item.projectId]) {
          acc[item.projectId] = []
        }
        acc[item.projectId].push(item)
        return acc
      }, {})
      
      let totalMentions = 0
      
      // Add all projects to scanning set
      const projectIds = Object.keys(trackingByProject)
      setScanningProjects(new Set(projectIds))
      
      // Scan each project
      for (const [projectId, trackingItems] of Object.entries(trackingByProject)) {
        const project = projects.find(p => p.id === projectId)
        if (!project) continue
        
        console.log(`Scanning project: ${project.name} with ${(trackingItems as any[]).length} topics`)
        
        // Scan each topic for this project using REAL AI scanning
        for (const trackingItem of trackingItems as any[]) {
          console.log(`Scanning topic: ${trackingItem.topic} for keyword: ${trackingItem.keyword}`)
          
          try {
            // Call the real AI scanning API - scan ONLY this specific keyword by matching keyword and topic
            const scanResponse = await fetch('/api/mentions/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                brandTrackingId: project.id, // Use the actual database brand tracking ID
                keyword: trackingItem.keyword, // Send the specific keyword to scan
                topic: trackingItem.topic, // Send the specific topic to scan
                immediate: true 
              })
            })
            
            if (scanResponse.ok) {
              const scanData = await scanResponse.json()
              console.log(`✅ Scan completed for ${project.name} - ${trackingItem.topic}`)
              
              // Process real scan results
              if (scanData.results && Array.isArray(scanData.results)) {
                console.log(`📊 Processing ${scanData.results.length} scan results`)
                
                for (const result of scanData.results) {
                  console.log(`🔍 Processing result for keyword: ${result.keyword}`)
                  
                  if (result.results && Array.isArray(result.results)) {
                    for (const platformResult of result.results) {
                      console.log(`📱 Platform ${platformResult.platform}: brandMentioned=${platformResult.brandMentioned}`)
                      
                      // Always create a result entry (found or not found)
                      const mentionResult = {
                        id: Date.now().toString() + Math.random(),
                        projectId,
                        projectName: project.name,
                        brandName: project.brandName,
                        keyword: trackingItem.keyword,
                        topic: trackingItem.topic,
                        aiResponse: platformResult.responseText || `AI response from ${platformResult.platform} about ${trackingItem.topic}`,
                        hasMention: platformResult.brandMentioned,
                        mentionType: platformResult.brandMentioned ? 'positive' : 'neutral',
                        detectedAt: new Date().toISOString(),
                        source: platformResult.platform,
                        content: platformResult.brandMentioned 
                          ? `Found mention of ${project.brandName} in ${platformResult.platform} response about "${trackingItem.topic}" at position ${platformResult.position}`
                          : `No mention of ${project.brandName} found in ${platformResult.platform} response about "${trackingItem.topic}"`,
                        position: platformResult.position,
                        platform: platformResult.platform
                      }
                      
                      // Add to mention results
                      setMentionResults(prev => [mentionResult, ...prev])
                      
                      // Update localStorage
                      const existingResults = JSON.parse(localStorage.getItem('mentionResults') || '[]')
                      const updatedResults = [mentionResult, ...existingResults]
                      localStorage.setItem('mentionResults', JSON.stringify(updatedResults))
                      
                      // Always process source URLs (even if no mention found)
                      if (platformResult.sourceUrls && Array.isArray(platformResult.sourceUrls)) {
                        const sourceUrls = platformResult.sourceUrls.map((urlData: any) => ({
                          id: `source-${Date.now()}-${Math.random()}`,
                          url: urlData.url,
                          domain: urlData.domain,
                          title: urlData.title,
                          date: urlData.date || new Date().toISOString(),
                          keyword: trackingItem.keyword,
                          platform: platformResult.platform,
                          brandMentioned: platformResult.brandMentioned
                        }))
                        
                        // Add to data sources
                        setDataSources(prev => [...sourceUrls, ...prev])
                      }
                      
                      // Count mentions for success message
                      if (platformResult.brandMentioned) {
                        totalMentions++
                      }
                    }
                  }
                }
              }
            } else {
              const errorData = await scanResponse.json()
              console.error(`❌ Scan failed for ${project.name}:`, errorData)
              toast.error(`Scan failed for ${project.name}: ${errorData.error || 'Unknown error'}`)
            }
            
            // Add delay between scans to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 1000))
            
          } catch (scanError) {
            console.error(`❌ Error scanning ${project.name} - ${trackingItem.topic}:`, scanError)
            toast.error(`Failed to scan ${project.name}: ${trackingItem.topic}`)
          }
        }
      }
      
      // Show completion message
      if (totalMentions > 0) {
        toast.success(`AI scan completed for ALL projects! Found ${totalMentions} brand mentions across all platforms`)
      } else {
        toast.info('AI scan completed for all projects. No brand mentions found this time.')
      }
      
      // Refresh data sources
      setTimeout(fetchDataSources, 1000)
      
    } catch (error) {
      console.error('Error starting full scan for all projects:', error)
      toast.error('Failed to start scan for all projects')
    } finally {
      // Clear scanning set
      setScanningProjects(new Set())
    }
  }

  const loadMentionResults = () => {
    try {
      const results = JSON.parse(localStorage.getItem('mentionResults') || '[]')
      setMentionResults(results)
    } catch (error) {
      console.error('Error loading mention results:', error)
      setMentionResults([])
    }
  }

  const loadProjectsFromDatabase = async (retryCount = 0) => {
    try {
      console.log(`🔄 Loading projects from database... (attempt ${retryCount + 1})`)
      
      // Add longer timeout for cold starts
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      try {
        // Load existing projects from the database
        const response = await fetch('/api/mentions/status', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.brandTracking && Array.isArray(data.brandTracking)) {
          // Convert database projects to Project format
          const dbProjects: Project[] = data.brandTracking.map((tracking: any) => ({
            id: tracking.id,
            name: tracking.displayName,
            brandName: tracking.displayName,
            website: tracking.website || '',
            description: tracking.description || '',
            createdAt: tracking.createdAt ? new Date(tracking.createdAt).toISOString() : new Date().toISOString(),
            status: tracking.isActive ? 'active' : 'paused',
            keywordsTracked: tracking.keywords?.length || 0,
            mentionsFound: tracking.totalMentions || 0,
            lastActivity: tracking.updatedAt ? new Date(tracking.updatedAt).toISOString() : new Date().toISOString()
          }))
          
          console.log(`✅ Loaded ${dbProjects.length} projects from database`)
          setProjects(dbProjects)
          
          // SYNC KEYWORD TRACKING DATA: Load topics from database and sync with localStorage
          console.log('🔄 Syncing keyword tracking data from database...')
          const dbKeywordTracking: any[] = []
          
          data.brandTracking.forEach((tracking: any) => {
            if (tracking.keywords && Array.isArray(tracking.keywords)) {
              tracking.keywords.forEach((kw: any) => {
                dbKeywordTracking.push({
                  id: kw.id,
                  projectId: tracking.id,
                  projectName: tracking.displayName,
                  brandName: tracking.displayName,
                  keyword: kw.keyword,
                  topic: kw.topic,
                  addedAt: kw.createdAt ? new Date(kw.createdAt).toISOString() : new Date().toISOString(),
                  status: 'active',
                  lastChecked: kw.lastScanAt ? new Date(kw.lastScanAt).toISOString() : null,
                  // Database-specific fields
                  avgPosition: kw.avgPosition,
                  chatgptPosition: kw.chatgptPosition,
                  perplexityPosition: kw.perplexityPosition,
                  geminiPosition: kw.geminiPosition,
                  positionChange: kw.positionChange,
                  scanCount: kw.scanCount
                })
              })
            }
          })
          
          console.log(`✅ Loaded ${dbKeywordTracking.length} keyword tracking items from database`)
          
          // Update localStorage with database data (this ensures topics persist after logout/login)
          if (dbKeywordTracking.length > 0) {
            localStorage.setItem('mentionTracking', JSON.stringify(dbKeywordTracking))
            console.log('💾 Synced keyword tracking data to localStorage')
            
            // Trigger UI refresh to show the loaded topics
            setTrackingDataVersion(prev => prev + 1)
          }
          
          // Calculate stats from loaded projects
          const totalProjects = dbProjects.length
          const activeKeywords = data.brandTracking.reduce((sum: number, tracking: any) => 
            sum + (tracking.keywords?.length || 0), 0
          )
          const totalMentions = dbProjects.reduce((sum, project) => sum + project.mentionsFound, 0)
          const thisMonthMentions = 0 // We'll calculate this later when we have time-based data
          
          setStats({
            totalProjects,
            activeKeywords,
            totalMentions,
            thisMonthMentions,
            growthRate: 0
          })
        } else {
          console.log('ℹ️ No projects found in database, starting with empty list')
          setProjects([])
          setStats({
            totalProjects: 0,
            activeKeywords: 0,
            totalMentions: 0,
            thisMonthMentions: 0,
            growthRate: 0
          })
        }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error) {
      console.error(`❌ Error loading projects from database (attempt ${retryCount + 1}):`, error)
      
      // Retry logic for cold starts
      if (retryCount < 2 && (
        (error as any)?.name === 'AbortError' || 
        (error as Error)?.message?.includes('fetch') || 
        (error as Error)?.message?.includes('HTTP')
      )) {
        console.log(`🔄 Retrying in 3 seconds... (attempt ${retryCount + 2}/3)`)
        setTimeout(() => {
          loadProjectsFromDatabase(retryCount + 1)
        }, 3000)
        return
      }
      
      // Final fallback
      console.error('❌ All retry attempts failed, using empty project list')
      // Fallback to empty projects
      setProjects([])
      setStats({
        totalProjects: 0,
        activeKeywords: 0,
        totalMentions: 0,
        thisMonthMentions: 0,
        growthRate: 0
      })
    }
  }

  const loadDemoData = () => {
    // Start with empty projects for new users
    const demoProjects: Project[] = []
    
    const demoStats: DashboardStats = {
      totalProjects: 0,
      activeKeywords: 0,
      totalMentions: 0,
      thisMonthMentions: 0,
      growthRate: 0
    }

    setProjects(demoProjects)
    setStats(demoStats)
  }

  const handleProjectCreated = async (newProject: Project) => {
    try {
      console.log('🔄 Saving new project to database:', newProject)
      
      // Save project to database via API
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: newProject.brandName,
          description: newProject.description,
          website: newProject.website,
          keywords: [newProject.name], // Use project name as initial keyword
          topics: [newProject.description] // Use description as initial topic
        })
      })
      
      if (response.ok) {
        const savedProject = await response.json()
        console.log('✅ Project saved to database:', savedProject)
        
        // Update local state with the saved project (including real ID from database)
        setProjects(prev => [...prev, {
          ...newProject,
          id: savedProject.id || newProject.id
        }])
        
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            totalProjects: stats.totalProjects + 1
          })
        }
        
        toast.success('Project created and saved to database!')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save project to database:', errorData)
        toast.error('Failed to save project to database')
        
        // Still add to local state as fallback
        setProjects(prev => [...prev, newProject])
      }
    } catch (error) {
      console.error('❌ Error saving project:', error)
      toast.error('Error saving project to database')
      
      // Fallback to local state
      setProjects(prev => [...prev, newProject])
    }
  }

  const handleKeywordSearch = async () => {
    if (!keywordInput.trim()) {
      toast.error('Please enter a keyword to research')
      return
    }

    setIsSearching(true)
    setKeywordResults(null)

    try {
      const response = await fetch('/api/keywords/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keywordInput.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze keyword')
      }

      const data = await response.json()
      setKeywordResults(data)
      
      if (data.realData) {
        toast.success(`Real keyword data found for "${keywordInput}"`)
      } else {
        toast.info(`Demo data shown for "${keywordInput}" (API may be unavailable)`)
      }
    } catch (error) {
      console.error('Keyword search error:', error)
      toast.error('Failed to analyze keyword. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTopicToProject = (topic: any) => {
    if (!projects || projects.length === 0) {
      toast.error('Please create a project first to add topics')
      setIsProjectModalOpen(true)
      return
    }

    // If only one project, auto-select it
    if (projects.length === 1) {
      addTopicToProject(projects[0], topic)
      return
    }

    // Multiple projects - show selection modal
    setSelectedTopicData({
      keyword: keywordResults.keyword,
      topic: topic.question
    })
    setIsProjectSelectionModalOpen(true)
  }

  const addTopicToProject = async (project: Project, topic: any) => {
    // Check if this topic is already being tracked for this project
    const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
    const isAlreadyTracked = existingTracking.some((item: any) => 
      item.projectId === project.id && 
      item.topic === topic.question &&
      item.keyword === keywordResults.keyword
    )

    if (isAlreadyTracked) {
      toast.info(`"${topic.question}" is already being tracked for "${project.name}"`)
      return
    }

    // Add the current keyword and topic to the project
    const trackingItem = {
      id: Date.now().toString(),
      projectId: project.id,
      projectName: project.name,
      brandName: project.brandName,
      keyword: keywordResults.keyword,
      topic: topic.question,
      addedAt: new Date().toISOString(),
      status: 'active',
      lastChecked: null // Track when it was last checked
    }
    
    try {
      // Save topic to database
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: project.brandName,
          keywords: [keywordResults.keyword],
          topics: [topic.question]
        })
      })
      
      if (response.ok) {
        console.log('✅ Topic saved to database')
        toast.success(`"${topic.question}" added to "${project.name}" for tracking`)
      } else {
        console.error('❌ Failed to save topic to database')
        toast.error('Failed to save topic to database')
      }
    } catch (error) {
      console.error('❌ Error saving topic:', error)
      toast.error('Error saving topic to database')
    }
    
    // Save to localStorage as backup
    const updatedTracking = [...existingTracking, trackingItem]
    localStorage.setItem('mentionTracking', JSON.stringify(updatedTracking))
    
    // Update project stats
    setProjects(prev => prev.map(p => 
      p.id === project.id 
        ? { ...p, keywordsTracked: p.keywordsTracked + 1 }
        : p
    ))
    
    // Update overall stats
    if (stats) {
      setStats({
        ...stats,
        activeKeywords: stats.activeKeywords + 1
      })
    }
    
    console.log('Added to project tracking:', trackingItem)
  }

  const checkMentions = async (trackingItems: any[]) => {
    setIsTracking(true)
    try {
      console.log(`Checking mentions for ${trackingItems.length} items...`)
      
      const response = await fetch('/api/tracking/check-mentions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingItems })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to check mentions: ${response.status}`)
      }

      const data = await response.json()
      console.log('Mention check results:', data)
      
      // Update mention results
      setMentionResults(prev => [...prev, ...data.results])
      
      // Update localStorage
      const existingResults = JSON.parse(localStorage.getItem('mentionResults') || '[]')
      const updatedResults = [...existingResults, ...data.results]
      localStorage.setItem('mentionResults', JSON.stringify(updatedResults))

      // Update lastChecked timestamp for tracking items
      const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
      const updatedTracking = existingTracking.map((item: any) => {
        const matchingItem = trackingItems.find(t => t.id === item.id)
        if (matchingItem) {
          return { ...item, lastChecked: new Date().toISOString() }
        }
        return item
      })
      localStorage.setItem('mentionTracking', JSON.stringify(updatedTracking))

      if (data.totalMentions > 0) {
        toast.success(`Found ${data.totalMentions} brand mentions!`)
      } else {
        toast.info('No brand mentions found. Will check again in 24 hours.')
      }

    } catch (error) {
      console.error('Error checking mentions:', error)
      toast.error('Failed to check for brand mentions')
    } finally {
      setIsTracking(false)
    }
  }

  const triggerScheduledCheck = async () => {
    try {
      const trackingItems = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
      
      if (trackingItems.length === 0) {
        toast.info('No tracking items to check')
        return
      }

      // Filter items that haven't been checked in the last 24 hours
      const now = new Date()
      const itemsToCheck = trackingItems.filter((item: any) => {
        if (!item.lastChecked) return true // Never checked
        const lastCheck = new Date(item.lastChecked)
        const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60)
        return hoursSinceLastCheck >= 24
      })

      if (itemsToCheck.length === 0) {
        toast.info('All items were checked recently. No need for scheduled check.')
        return
      }

      console.log(`Scheduled check: ${itemsToCheck.length} items need checking out of ${trackingItems.length} total`)

      const response = await fetch('/api/tracking/scheduled-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingItems: itemsToCheck })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger scheduled check')
      }

      const data = await response.json()
      
      // Update mention results
      setMentionResults(prev => [...prev, ...data.results])
      
      // Update localStorage
      const existingResults = JSON.parse(localStorage.getItem('mentionResults') || '[]')
      const updatedResults = [...existingResults, ...data.results]
      localStorage.setItem('mentionResults', JSON.stringify(updatedResults))

      setLastScheduledCheck(data.checkedAt)

      if (data.totalMentions > 0) {
        toast.success(`Scheduled check found ${data.totalMentions} brand mentions!`)
      } else {
        toast.info(`Scheduled check completed. Checked ${itemsToCheck.length} items, no new mentions found.`)
      }

    } catch (error) {
      console.error('Error triggering scheduled check:', error)
      toast.error('Failed to trigger scheduled check')
    }
  }

  // CRUD Operations
  const deleteMention = (mentionId: string) => {
    const updatedResults = mentionResults.filter(result => result.id !== mentionId)
    setMentionResults(updatedResults)
    localStorage.setItem('mentionResults', JSON.stringify(updatedResults))
    toast.success('Mention deleted successfully')
  }

  // Navigation handlers
  const handleAccountSettings = () => {
    router.push('/account')
  }

  const handleBilling = () => {
    router.push('/pricing')
  }

  const deleteProject = async (projectId: string) => {
    try {
      // Call DELETE API
      const response = await fetch(`/api/mentions/track?id=${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state only after successful API call
        const updatedProjects = projects.filter(project => project.id !== projectId)
        setProjects(updatedProjects)
        
        // Remove associated tracking items
        const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
        const updatedTracking = existingTracking.filter((item: any) => item.projectId !== projectId)
        localStorage.setItem('mentionTracking', JSON.stringify(updatedTracking))
        
        // Remove associated mentions
        const updatedMentions = mentionResults.filter(mention => mention.projectId !== projectId)
        setMentionResults(updatedMentions)
        localStorage.setItem('mentionResults', JSON.stringify(updatedMentions))
        
        toast.success('Project deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Delete project error:', error)
      toast.error('Failed to delete project')
    }
  }

  const editProject = (project: Project) => {
    setEditingProject(project)
    setIsEditProjectModalOpen(true)
  }

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    setIsEditProjectModalOpen(false)
    setEditingProject(null)
    toast.success('Project updated successfully')
  }

  const addManualMention = (mentionData: any) => {
    const newMention = {
      id: Date.now().toString(),
      projectId: mentionData.projectId,
      brandName: mentionData.brandName,
      keyword: mentionData.keyword,
      topic: mentionData.topic,
      aiResponse: mentionData.aiResponse,
      hasMention: true,
      mentionType: mentionData.mentionType || 'neutral',
      detectedAt: new Date().toISOString(),
      source: mentionData.source
    }
    
    setMentionResults(prev => [newMention, ...prev])
    localStorage.setItem('mentionResults', JSON.stringify([newMention, ...mentionResults]))
    setIsAddMentionModalOpen(false)
    toast.success('Manual mention added successfully')
  }

  // Get mention statistics for charts
  const getMentionStats = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const mentionsByDay = last7Days.map(date => {
      const dayMentions = mentionResults.filter(mention => 
        mention.detectedAt.startsWith(date)
      )
      return {
        date,
        count: dayMentions.length,
        positive: dayMentions.filter(m => m.mentionType === 'positive').length,
        negative: dayMentions.filter(m => m.mentionType === 'negative').length,
        neutral: dayMentions.filter(m => m.mentionType === 'neutral').length
      }
    })

    return mentionsByDay
  }

  // Get platform statistics
  const getPlatformStats = () => {
    const platformCounts = {
      perplexity: mentionResults.filter(m => m.source === 'perplexity' && m.hasMention).length,
      chatgpt: mentionResults.filter(m => m.source === 'chatgpt' && m.hasMention).length,
      gemini: mentionResults.filter(m => m.source === 'gemini' && m.hasMention).length
    }
    return platformCounts
  }

  // Check if topic has mentions
  const hasTopicMentions = (topic: any, projectId: string) => {
    return mentionResults.some(m => 
      m.projectId === projectId && 
      m.topic === topic.topic && 
      m.hasMention
    )
  }

  // Get topic analytics
  const getTopicAnalytics = (topic: any, projectId: string) => {
    const topicMentions = mentionResults.filter(m => 
      m.projectId === projectId && 
      m.topic === topic.topic && 
      m.hasMention
    )

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const mentionsByDay = last7Days.map(date => {
      const dayMentions = topicMentions.filter(mention => 
        mention.detectedAt.startsWith(date)
      )
      return {
        date,
        count: dayMentions.length,
        platforms: {
          perplexity: dayMentions.filter(m => m.source === 'perplexity').length,
          chatgpt: dayMentions.filter(m => m.source === 'chatgpt').length,
          gemini: dayMentions.filter(m => m.source === 'gemini').length
        }
      }
    })

    return {
      totalMentions: topicMentions.length,
      mentionsByDay,
      lastMention: topicMentions.length > 0 ? topicMentions[topicMentions.length - 1] : null
    }
  }

  // Toggle topic expansion
  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  // Remove topic from tracking
  const removeTopicFromTracking = async (projectId: string, topic: any) => {
    try {
      // Call the API to delete the keyword from database
      // Use keyword text and topic text instead of potentially non-existent topic.id
      const response = await fetch(`/api/mentions/track?keyword=${encodeURIComponent(topic.keyword)}&topic=${encodeURIComponent(topic.topic)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Also update localStorage for local state
        const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
        const updatedTracking = existingTracking.filter((item: any) => 
          !(item.projectId === projectId && item.keyword === topic.keyword && item.topic === topic.topic)
        )
        localStorage.setItem('mentionTracking', JSON.stringify(updatedTracking))
        
        // Update project stats
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, keywordsTracked: Math.max(0, p.keywordsTracked - 1) }
            : p
        ))
        
        toast.success('Topic removed from tracking and database')
        
              // Force refresh of projects data to ensure UI is in sync
        await loadProjectsFromDatabase()
        
        // Also clean up any orphaned localStorage items
        await cleanupOrphanedLocalStorageItems()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove topic from database')
      }
    } catch (error) {
      console.error('Remove topic error:', error)
      toast.error('Failed to remove topic')
    }
  }

  // Refresh a single topic by scanning it
  const refreshSingleTopic = async (projectId: string, topic: any) => {
    try {
      const topicKey = `${projectId}-${topic.keyword}-${topic.topic}`
      setRefreshingTopics(prev => new Set(prev).add(topicKey))
      
      console.log(`🔄 Refreshing single topic: ${topic.topic} for keyword: ${topic.keyword}`)
      
      // Find the project to get the brand tracking ID
      const project = projects.find(p => p.id === projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      
      // Call the scan API for this specific topic
      const scanResponse = await fetch('/api/mentions/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brandTrackingId: project.id,
          keyword: topic.keyword,
          topic: topic.topic,
          immediate: true 
        })
      })
      
      if (scanResponse.ok) {
        const scanData = await scanResponse.json()
        console.log(`✅ Single topic scan completed for ${topic.topic}`)
        toast.success(`Topic "${topic.topic}" refreshed successfully`)
        
        // Refresh projects data to show updated results
        await loadProjectsFromDatabase()
      } else {
        const errorData = await scanResponse.json()
        console.error(`❌ Single topic scan failed:`, errorData)
        toast.error(`Failed to refresh topic: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`❌ Error refreshing single topic:`, error)
      toast.error(`Failed to refresh topic: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      const topicKey = `${projectId}-${topic.keyword}-${topic.topic}`
      setRefreshingTopics(prev => {
        const newSet = new Set(prev)
        newSet.delete(topicKey)
        return newSet
      })
    }
  }

  // Clean up orphaned localStorage items that don't exist in database
  const cleanupOrphanedLocalStorageItems = async () => {
    try {
      const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
      if (existingTracking.length === 0) return
      
      // Get current database state
      const response = await fetch('/api/mentions/status')
      if (!response.ok) return
      
      const data = await response.json()
      const dbKeywords = new Set()
      
      // Build set of valid keyword-topic combinations from database
      if (data.brandTracking) {
        data.brandTracking.forEach((brand: any) => {
          if (brand.keywords) {
            brand.keywords.forEach((kt: any) => {
              dbKeywords.add(`${brand.id}:${kt.keyword}:${kt.topic}`)
            })
          }
        })
      }
      
      // Remove localStorage items that don't exist in database
      const validTracking = existingTracking.filter((item: any) => {
        const key = `${item.projectId}:${item.keyword}:${item.topic}`
        return dbKeywords.has(key)
      })
      
      if (validTracking.length !== existingTracking.length) {
        localStorage.setItem('mentionTracking', JSON.stringify(validTracking))
        console.log(`🧹 Cleaned up ${existingTracking.length - validTracking.length} orphaned localStorage items`)
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  // Add manual keyword tracking
  const addManualKeywordTracking = async (data: any) => {
    try {
      // Call the API to save to database
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: data.brandName,
          keywords: [data.keyword],
          topics: [data.topic]
        })
      })

      if (response.ok) {
        const result = await response.json()
        const databaseProjectId = result.tracking.id // Use the database ID returned from API
        
        // Also save to localStorage for local state
        const trackingItem = {
          id: Date.now().toString(),
          projectId: databaseProjectId, // Use database ID instead of UI projectId
          projectName: data.projectName,
          brandName: data.brandName,
          keyword: data.keyword,
          topic: data.topic,
          addedAt: new Date().toISOString(),
          status: 'active',
          lastChecked: null
        }
        
        const existingTracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
        const updatedTracking = [...existingTracking, trackingItem]
        localStorage.setItem('mentionTracking', JSON.stringify(updatedTracking))
        
        // Update project stats  
        setProjects(prev => prev.map(p => 
          p.id === data.projectId || p.id === databaseProjectId
            ? { ...p, id: databaseProjectId, keywordsTracked: p.keywordsTracked + 1 }
            : p
        ))
        
        setIsAddKeywordModalOpen(false)
        toast.success('Keyword and topic saved to database')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save keyword')
      }
    } catch (error) {
      console.error('Add keyword error:', error)
      toast.error('Failed to save keyword')
    }
  }

  const renderContent = () => {
    switch (activeItem) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {stats.totalProjects}
                        </div>
                        <p className="text-sm text-muted-foreground">Active Projects</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {stats.activeKeywords}
                        </div>
                        <p className="text-sm text-muted-foreground">Keywords Tracked</p>
                      </div>
                      <Target className="w-8 h-8 text-accent/60" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {stats.totalMentions}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Mentions</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          +{stats.growthRate}%
                        </div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Get started with your AI keyword research and brand monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => setIsProjectModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveItem('keyword-research')}>
                    <Search className="w-4 h-4 mr-2" />
                    Research Keywords
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveItem('mention-tracking')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Track Brand Mentions
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest mentions and keyword research activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6" />
                      </div>
                      <p className="text-sm">No activity yet</p>
                      <p className="text-xs">Start by creating a project or researching keywords</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Projects</h1>
                <p className="text-muted-foreground">Manage your websites and track their performance</p>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const projectMentions = mentionResults.filter(m => m.projectId === project.id && m.hasMention)
                const platformStats = {
                  perplexity: projectMentions.filter(m => m.source === 'perplexity').length,
                  chatgpt: projectMentions.filter(m => m.source === 'chatgpt').length,
                  gemini: projectMentions.filter(m => m.source === 'gemini').length
                }
                
                return (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.website}
                          </CardDescription>
                        </div>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Brand:</span>
                          <span className="font-medium">{project.brandName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Keywords Tracked:</span>
                          <span className="font-medium">{project.keywordsTracked}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mentions Found:</span>
                          <span className="font-medium">{projectMentions.length}</span>
                        </div>
                        
                        {/* Platform Tracking Icons */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Platform Mentions:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Bot className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium">{platformStats.perplexity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-medium">{platformStats.chatgpt}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              <span className="text-xs font-medium">{platformStats.gemini}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span className="font-medium">
                            {new Date(project.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveItem('mention-tracking')
                            }}
                          >
                            View Mentions
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              editProject(project)
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this project?')) {
                                deleteProject(project.id)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 'keyword-research':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Keyword Research Tool</h1>
              <p className="text-muted-foreground">Get real AI search volume data from LLMs insight for any keyword</p>
            </div>

            {/* AI Keyword Research Form */}
            <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 shadow-2xl backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  AI Keyword Research Tool
                </CardTitle>
                <CardDescription className="text-purple-200 text-lg mt-2">
                  Get real AI search volume data from LLMs for any keywords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative">
                      <Brain className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 group-hover:text-purple-300 transition-colors" />
                      <Input
                        placeholder="Enter a keyword to research..."
                        className="pl-12 pr-4 py-4 text-lg bg-slate-800/50 border border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-2xl text-white placeholder:text-purple-300/60 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/70"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
                      />
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleKeywordSearch}
                    disabled={isSearching}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border border-purple-400/20 backdrop-blur-sm"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Research
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {keywordResults && (
              <div className="space-y-6">

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-purple-700">
                            {keywordResults.monthlyVolume?.toLocaleString() || 'N/A'}
                          </div>
                          <p className="text-sm text-purple-600 font-medium">Monthly Search Volume</p>
                        </div>
                        <Target className="w-10 h-10 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-emerald-700">
                            {keywordResults.threeMonthGrowth ? `${keywordResults.threeMonthGrowth > 0 ? '+' : ''}${keywordResults.threeMonthGrowth}%` : 'N/A'}
                          </div>
                          <p className="text-sm text-emerald-600 font-medium">3-Month Growth</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-indigo-700">
                            {keywordResults.sixMonthGrowth ? `${keywordResults.sixMonthGrowth > 0 ? '+' : ''}${keywordResults.sixMonthGrowth}%` : 'N/A'}
                          </div>
                          <p className="text-sm text-indigo-600 font-medium">6-Month Growth</p>
                        </div>
                        <BarChart3 className="w-10 h-10 text-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Keywords */}
                {keywordResults.relatedKeywords && keywordResults.relatedKeywords.length > 0 && (
                  <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-900">
                        <Search className="w-6 h-6" />
                        Related Keywords
                      </CardTitle>
                      <CardDescription className="text-orange-700">
                        Discover related keywords with real search volume data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {keywordResults.relatedKeywords.slice(0, 9).map((relatedKeyword: any, index: number) => (
                          <div key={index} className="p-4 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{relatedKeyword.keyword}</h4>
                              <Badge 
                                variant={relatedKeyword.growth > 15 ? "default" : relatedKeyword.growth > 5 ? "secondary" : "outline"}
                                className={`text-xs ${
                                  relatedKeyword.growth > 15 ? 'bg-green-100 text-green-800 border-green-200' :
                                  relatedKeyword.growth > 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {relatedKeyword.growth > 0 ? '+' : ''}{relatedKeyword.growth}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Target className="w-4 h-4" />
                              <span>{relatedKeyword.volume?.toLocaleString() || 'N/A'} searches/month</span>
                            </div>
                            <button
                              onClick={() => {
                                setKeywordInput(relatedKeyword.keyword)
                                handleKeywordSearch()
                              }}
                              className="mt-3 w-full px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors"
                            >
                              Research This Keyword
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Query Topics - The Core Feature */}
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Brain className="w-6 h-6" />
                      AI Query Topics & Mention Opportunities
                    </CardTitle>
                    <CardDescription className="text-purple-700">
                      These are the actual questions people ask AI about "{keywordResults.keyword}". 
                      Track these topics to monitor when your brand gets mentioned in AI responses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {keywordResults.aiTopics && keywordResults.aiTopics.length > 0 ? (
                      keywordResults.aiTopics.map((topic: any, index: number) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{topic.question}</h4>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  <span className="text-blue-600 font-medium">AI Query Volume: {topic.volume}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 font-medium">Mention Opportunity: {topic.opportunityScore}/10</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={topic.opportunityScore >= 8 ? "default" : topic.opportunityScore >= 6 ? "secondary" : "outline"}
                                className={`${
                                  topic.opportunityScore >= 8 ? 'bg-green-100 text-green-800 border-green-200' :
                                  topic.opportunityScore >= 6 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {topic.opportunityScore >= 8 ? 'High' : topic.opportunityScore >= 6 ? 'Medium' : 'Low'} Opportunity
                              </Badge>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddTopicToProject(topic)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Project
                              </Button>
                            </div>
                          </div>
                          
                          {/* Opportunity Score Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Mention Opportunity Score</span>
                              <span>{topic.opportunityScore}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  topic.opportunityScore >= 8 ? 'bg-green-500' :
                                  topic.opportunityScore >= 6 ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${topic.opportunityScore * 10}%` }}
                              ></div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600">
                            <strong>Why this works:</strong> {topic.reasoning}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <p className="text-purple-600">AI topics will be generated here based on your keyword research</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Insights */}
                {keywordResults.marketInsights && (
                  <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <Globe className="w-6 h-6" />
                        Market Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-emerald-800 leading-relaxed">
                          {keywordResults.marketInsights}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Strategic Recommendation */}
                {keywordResults.strategicRecommendation && (
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Zap className="w-6 h-6" />
                        Strategic Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-blue-800 leading-relaxed">
                          {keywordResults.strategicRecommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* No Results State */}
            {!keywordResults && !isSearching && (
              <Card className="bg-muted/50">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Start Your Keyword Research</h3>
                    <p className="text-muted-foreground mb-6">
                      Enter a keyword above to get detailed volume statistics, search trends, and competitive insights.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>Search Volume • Competition • Cost Per Click • Related Keywords</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'mention-tracking':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mention Tracking</h1>
              <p className="text-muted-foreground">Track keywords and topics across AI platforms</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {(() => {
                          try {
                            const tracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
                            const uniqueProjects = new Set(tracking.map((item: any) => item.projectId))
                            return uniqueProjects.size
                          } catch (error) {
                            return 0
                          }
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                    </div>
                    <Target className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-accent">
                        {(() => {
                          try {
                            const tracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
                            const uniqueKeywords = new Set(tracking.map((item: any) => item.keyword))
                            return uniqueKeywords.size
                          } catch (error) {
                            return 0
                          }
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground">Tracked Keywords</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {(() => {
                          try {
                            const tracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
                            return tracking.length
                          } catch (error) {
                            return 0
                          }
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground">Tracked Topics</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        Active
                      </div>
                      <p className="text-sm text-muted-foreground">Status</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracked Projects & Keywords */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Tracked Projects & Keywords
                    </CardTitle>
                    <CardDescription>
                      Your projects and their associated keywords and topics being monitored
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>Data refreshes every 24 hours</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setIsAddKeywordModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Keyword
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => startFullScanAllProjects()}
                      disabled={scanningProjects.size > 0}
                      className={scanningProjects.size > 0 ? 
                        "bg-red-600 hover:bg-red-700 text-white" : 
                        "bg-green-600 hover:bg-green-700 text-white"
                      }
                    >
                      {scanningProjects.size > 0 ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Scanning All Projects...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Scan All Projects
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                                    try {
                    const tracking = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
                    
                    if (!tracking || tracking.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Tracking Items Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Start by creating a project and researching keywords
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button onClick={() => setIsProjectModalOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Project
                            </Button>
                            <Button variant="outline" onClick={() => setActiveItem('keyword-research')}>
                              <Search className="w-4 h-4 mr-2" />
                              Research Keywords
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    // Group by project, then by keyword
                    const groupedByProject = tracking.reduce((acc: any, item: any) => {
                      if (!acc[item.projectId]) {
                        acc[item.projectId] = {
                          projectName: item.projectName,
                          keywords: {}
                        }
                      }
                      if (!acc[item.projectId].keywords[item.keyword]) {
                        acc[item.projectId].keywords[item.keyword] = []
                      }
                      acc[item.projectId].keywords[item.keyword].push(item)
                      return acc
                    }, {})

                    return (
                      <div className="space-y-6">
                        {Object.entries(groupedByProject).map(([projectId, projectData]: [string, any]) => (
                          <div key={projectId} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-primary">{projectData.projectName}</h3>
                                <Badge variant="outline">
                                  {Object.keys(projectData.keywords).length} keywords
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="default">Active</Badge>
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {Object.entries(projectData.keywords).map(([keyword, topics]: [string, any]) => (
                                <div key={keyword} className="border-l-2 border-primary/20 pl-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <h4 className="font-medium text-primary">{keyword}</h4>
                                    <Badge variant="secondary">{topics.length} topics</Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                                                          {topics.map((topic: any, index: number) => {
                                        const hasMentions = hasTopicMentions(topic, projectId)
                                        const analytics = getTopicAnalytics(topic, projectId)
                                        const topicId = `${projectId}-${topic.topic}`
                                        const isExpanded = expandedTopics.has(topicId)
                                        
                                        return (
                                          <div key={topic.id} className="border border-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between p-3 bg-muted/30">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium">{topic.topic}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  Added {new Date(topic.addedAt).toLocaleDateString()}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                  {/* Position metrics display */}
                                                  <div className="flex items-center gap-4 text-xs">
                                                    {/* Status indicator - Found/Not Found */}
                                                    <div className="flex items-center gap-1">
                                                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                        (() => {
                                                          const projectMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic
                                                          )
                                                          const hasAnyMentions = projectMentions.some(m => m.hasMention)
                                                          return hasAnyMentions 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                        })()
                                                      }`}>
                                                        {(() => {
                                                          const projectMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic
                                                          )
                                                          const hasAnyMentions = projectMentions.some(m => m.hasMention)
                                                          return hasAnyMentions ? 'Found' : 'Not Found'
                                                        })()}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-muted-foreground">Avg:</span>
                                                      <span className="font-medium">
                                                        {(() => {
                                                          const projectMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic && 
                                                            m.hasMention
                                                          )
                                                          if (projectMentions.length > 0) {
                                                            const positions = projectMentions.map(m => m.position || 0)
                                                            const avg = positions.reduce((sum, pos) => sum + pos, 0) / positions.length
                                                            return `#${Math.round(avg)}`
                                                          }
                                                          return '-'
                                                        })()}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-muted-foreground">Change:</span>
                                                      <span className="font-medium text-green-600">
                                                        {(() => {
                                                          const projectMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic && 
                                                            m.hasMention
                                                          )
                                                          if (projectMentions.length > 1) {
                                                            const recentMentions = projectMentions
                                                              .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
                                                              .slice(0, 2)
                                                            if (recentMentions.length === 2) {
                                                              const change = recentMentions[0].position - recentMentions[1].position
                                                              return change > 0 ? `↓${Math.abs(change)}` : change < 0 ? `↑${Math.abs(change)}` : '→0'
                                                            }
                                                          }
                                                          return '→0'
                                                        })()}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-muted-foreground">ChatGPT:</span>
                                                      <span className="font-medium">
                                                        {(() => {
                                                          const chatgptMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic && 
                                                            m.hasMention && 
                                                            m.source === 'chatgpt'
                                                          )
                                                          return chatgptMentions.length > 0 ? `#${chatgptMentions[0].position || 1}` : '-'
                                                        })()}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-muted-foreground">Perplexity:</span>
                                                      <span className="font-medium">
                                                        {(() => {
                                                          const perplexityMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic && 
                                                            m.hasMention && 
                                                            m.source === 'perplexity'
                                                          )
                                                          return perplexityMentions.length > 0 ? `#${perplexityMentions[0].position || 1}` : '-'
                                                        })()}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-muted-foreground">Gemini:</span>
                                                      <span className="font-medium">
                                                        {(() => {
                                                          const geminiMentions = mentionResults.filter(m => 
                                                            m.projectId === projectId && 
                                                            m.topic === topic.topic && 
                                                            m.hasMention && 
                                                            m.source === 'gemini'
                                                          )
                                                          return geminiMentions.length > 0 ? `#${geminiMentions[0].position || 1}` : '-'
                                                        })()}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                  {hasMentions ? `${analytics.totalMentions} mentions` : 'Monitoring'}
                                                </Badge>
                                                {/* Refresh button for single topic scan */}
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => refreshSingleTopic(projectId, topic)}
                                                  disabled={refreshingTopics.has(`${projectId}-${topic.keyword}-${topic.topic}`)}
                                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                                >
                                                  <RefreshCw className={`w-4 h-4 ${refreshingTopics.has(`${projectId}-${topic.keyword}-${topic.topic}`) ? 'animate-spin' : ''}`} />
                                                </Button>
                                                {/* Remove topic button */}
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => removeTopicFromTracking(projectId, topic)}
                                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <XCircle className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </div>
                                            
                                            {/* Analytics Panel */}
                                            {isExpanded && (
                                              <div className="p-4 bg-white border-t">
                                                <div className="space-y-4">
                                                  {/* Summary Stats */}
                                                  <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                      <div className="text-lg font-bold text-blue-600">
                                                        {analytics.totalMentions}
                                                      </div>
                                                      <div className="text-xs text-muted-foreground">Total Mentions</div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-lg font-bold text-green-600">
                                                        {analytics.lastMention ? new Date(analytics.lastMention.detectedAt).toLocaleDateString() : 'Never'}
                                                      </div>
                                                      <div className="text-xs text-muted-foreground">Last Mention</div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-lg font-bold text-purple-600">
                                                        {topic.keyword || 'N/A'}
                                                      </div>
                                                      <div className="text-xs text-muted-foreground">Keyword</div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* 7-Day Chart */}
                                                  <div>
                                                    <h4 className="text-sm font-medium mb-2">Mentions Last 7 Days</h4>
                                                    <div className="space-y-2">
                                                      {analytics.mentionsByDay.map((day) => (
                                                        <div key={day.date} className="flex items-center justify-between">
                                                          <span className="text-xs text-muted-foreground">
                                                            {new Date(day.date).toLocaleDateString('en-US', { 
                                                              weekday: 'short', 
                                                              month: 'short', 
                                                              day: 'numeric' 
                                                            })}
                                                          </span>
                                                          <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1">
                                                              <Bot className="w-3 h-3 text-blue-500" />
                                                              <span className="text-xs">{day.platforms.perplexity}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                              <MessageSquare className="w-3 h-3 text-green-500" />
                                                              <span className="text-xs">{day.platforms.chatgpt}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                              <Sparkles className="w-3 h-3 text-purple-500" />
                                                              <span className="text-xs">{day.platforms.gemini}</span>
                                                            </div>
                                                            <span className="text-xs font-medium">Total: {day.count}</span>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  } catch (error) {
                    console.error('Error loading tracking data:', error)
                    return (
                      <div className="text-center py-8">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-muted-foreground">
                          There was an error loading your tracking data. Please try refreshing the page.
                        </p>
                      </div>
                    )
                  }
                })()}
              </CardContent>
            </Card>





            {/* Recent Mentions and Data Sources - Side by Side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Recent Mentions - Left Side */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Recent Mentions
                      </CardTitle>
                      <CardDescription>
                        Latest mentions found across AI platforms
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsAddMentionModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Mention
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {mentionResults.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Mentions Found Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Your tracked mentions will appear here once detected.
                      </p>
                      <Button
                        onClick={() => setIsAddMentionModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sample Mention
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="max-h-80 overflow-y-auto">
                      {mentionResults
                        .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
                        .slice((mentionsPage - 1) * mentionsPageSize, mentionsPage * mentionsPageSize)
                        .map((result) => (
                          <div key={result.id} className="flex items-start gap-4 p-4 rounded-lg border">
                            <div className="text-2xl">
                              {result.source === 'perplexity' ? '🤖' : 
                               result.source === 'chatgpt' ? '💬' : '🔮'}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{result.brandName}</span>
                                  <Badge variant="outline" className="capitalize">{result.source}</Badge>
                                  <Badge 
                                    variant={result.mentionType === 'positive' ? 'default' : 
                                            result.mentionType === 'negative' ? 'destructive' : 'secondary'}
                                  >
                                    {result.mentionType}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(result.detectedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.content}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span>Keyword: {result.keyword}</span>
                                  <span>Project: {result.projectName}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteMention(result.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Pagination Controls */}
                      {Math.ceil(mentionResults.length / mentionsPageSize) > 1 && (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMentionsPage(p => Math.max(1, p - 1))}
                            disabled={mentionsPage === 1}
                          >
                            Prev
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            Page {mentionsPage} of {Math.ceil(mentionResults.length / mentionsPageSize)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMentionsPage(p => Math.min(Math.ceil(mentionResults.length / mentionsPageSize), p + 1))}
                            disabled={mentionsPage === Math.ceil(mentionResults.length / mentionsPageSize)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Sources - Right Side */}
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Data Sources
                    </CardTitle>
                    <CardDescription>
                      URLs and sources collected from AI responses
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dataSources.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Sources Found Yet</h3>
                    <p className="text-muted-foreground">
                      Sources will appear here after running scans
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="max-h-80 overflow-y-auto">
                    {dataSources
                      .slice((dataSourcesPage - 1) * dataSourcesPageSize, dataSourcesPage * dataSourcesPageSize)
                      .map((source, index) => (
                      <div key={source.id || index} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => window.open(source.url, '_blank')}
                              className="font-medium text-primary hover:underline text-left"
                            >
                              {source.domain || new URL(source.url).hostname}
                            </button>
                            <div className="text-sm text-muted-foreground">
                              {source.date ? new Date(source.date).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {source.title || 'AI Response Source'}
                          </div>
                          <button
                            onClick={() => window.open(source.url, '_blank')}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {source.url}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {source.keyword || 'General'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {source.platform || 'AI'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                    {Math.ceil(dataSources.length / dataSourcesPageSize) > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDataSourcesPage(p => Math.max(1, p - 1))}
                          disabled={dataSourcesPage === 1}
                        >
                          Prev
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Page {dataSourcesPage} of {Math.ceil(dataSources.length / dataSourcesPageSize)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDataSourcesPage(p => Math.min(Math.ceil(dataSources.length / dataSourcesPageSize), p + 1))}
                          disabled={dataSourcesPage === Math.ceil(dataSources.length / dataSourcesPageSize)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="aurora-bg">
        <div className="aurora-tertiary" />
      </div>

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border">
          <div className="p-4">
            {/* App Logo/Title */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aimentions.app
              </h1>
            </div>
            
            <nav className="space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Main
                </div>
                
                <button
                  onClick={() => setActiveItem('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeItem === 'overview'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Overview
                </button>

                <button
                  onClick={() => setActiveItem('projects')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeItem === 'projects'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Projects
                </button>
              </div>

              <Separator />

              {/* Tools */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Tools
                </div>
                
                <button
                  onClick={() => setActiveItem('keyword-research')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeItem === 'keyword-research'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Keyword Research
                </button>

                <button
                  onClick={() => setActiveItem('mention-tracking')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeItem === 'mention-tracking'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Mention Tracking
                </button>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Actions
                </div>
                
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              <Separator />

              {/* Account */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Account
                </div>
                
                <AccountDropdown 
                  onAccountSettings={handleAccountSettings}
                  onBilling={handleBilling}
                />
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Selection Modal */}
      {selectedTopicData && (
        <ProjectSelectionModal
          isOpen={isProjectSelectionModalOpen}
          onClose={() => {
            setIsProjectSelectionModalOpen(false)
            setSelectedTopicData(null)
          }}
          projects={projects}
          onProjectSelected={(project) => {
            if (selectedTopicData) {
              addTopicToProject(project, { question: selectedTopicData.topic })
            }
          }}
          onProjectCreated={handleProjectCreated}
          topicData={selectedTopicData}
        />
      )}

      {/* Add Mention Modal */}
      <AddMentionModal
        isOpen={isAddMentionModalOpen}
        onClose={() => setIsAddMentionModalOpen(false)}
        projects={projects}
        onAddMention={addManualMention}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={editingProject}
        onUpdateProject={updateProject}
      />

      <AddKeywordModal
        isOpen={isAddKeywordModalOpen}
        onClose={() => setIsAddKeywordModalOpen(false)}
        projects={projects}
        onAddKeyword={addManualKeywordTracking}
      />

    </div>
  )
}
