'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Users,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  Brain,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { EnhancedMentionTracking } from "@/components/enhanced-mention-tracking"
import { toast } from 'sonner'

interface BrandMention {
  id: string
  brand: string
  platform: 'chatgpt' | 'bard' | 'claude' | 'reddit' | 'twitter' | 'linkedin' | 'quora'
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  timestamp: string
  url?: string
  engagement?: number
  reach?: number
}

interface TrackedBrand {
  id: string
  name: string
  website: string
  status: 'active' | 'paused'
  mentionsThisMonth: number
  mentionsLastMonth: number
  growthRate: number
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
  lastMention: string
}

export default function MentionTracking() {
  const { data: session, status } = useSession()
  const [trackedBrands, setTrackedBrands] = useState<TrackedBrand[]>([])
  const [recentMentions, setRecentMentions] = useState<BrandMention[]>([])
  const [isClient, setIsClient] = useState(false)
  const [newBrand, setNewBrand] = useState('')
  const [newWebsite, setNewWebsite] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadDemoData()
  }, [])

  const loadDemoData = () => {
    // Start with empty data for new users
    const demoBrands: TrackedBrand[] = []
    const demoMentions: BrandMention[] = []

    setTrackedBrands(demoBrands)
    setRecentMentions(demoMentions)
  }

  const addNewBrand = () => {
    if (!newBrand.trim() || !newWebsite.trim()) {
      toast.error('Please enter both brand name and website')
      return
    }

    const newBrandData: TrackedBrand = {
      id: Date.now().toString(),
      name: newBrand.trim(),
      website: newWebsite.trim(),
      status: 'active',
      mentionsThisMonth: 0,
      mentionsLastMonth: 0,
      growthRate: 0,
      sentiment: {
        positive: 0,
        negative: 0,
        neutral: 0
      },
      lastMention: new Date().toISOString()
    }

    setTrackedBrands([...trackedBrands, newBrandData])
    setNewBrand('')
    setNewWebsite('')
    toast.success('Brand added successfully!')
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'chatgpt': return '🤖'
      case 'bard': return '🧠'
      case 'claude': return '💬'
      case 'reddit': return '📱'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      case 'quora': return '❓'
      default: return '🌐'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading mention tracking...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Sign in to access Mention Tracking</h1>
          <p className="text-muted-foreground mb-6">
            Track brand mentions across AI platforms and get real-time insights.
          </p>
          <Button 
            onClick={() => setIsAuthModalOpen(true)} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Sign In to Continue
          </Button>
        </div>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="aurora-bg">
        <div className="aurora-tertiary" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Brand Mention Tracking
              </h1>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <EnhancedMentionTracking />
      </div>
    </div>
  )
}

