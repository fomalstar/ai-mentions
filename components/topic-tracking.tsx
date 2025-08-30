'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Target, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from 'sonner'

interface Topic {
  id: string
  topicName: string
  brandName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  brandMentions: BrandMention[]
}

interface BrandMention {
  id: string
  mentionDate: string
  source?: string
  responseText?: string
}

export function TopicTracking() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    topicName: '',
    brandName: ''
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    loadTopics()
  }, [isClient])

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/topics/track')
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics || [])
        setIsDemoMode(data.demoMode || false)
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
      toast.error('Failed to load topics')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topicName.trim() || !formData.brandName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/topics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Topic added successfully!')
          setFormData({ topicName: '', brandName: '' })
          setShowForm(false)
          loadTopics()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add topic')
      }
    } catch (error) {
      console.error('Failed to add topic:', error)
      toast.error('Failed to add topic')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTopicStatus = async (topicId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/topics/track', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, isActive })
      })

      if (response.ok) {
        toast.success(`Topic ${isActive ? 'activated' : 'deactivated'} successfully!`)
        loadTopics()
      } else {
        toast.error('Failed to update topic status')
      }
    } catch (error) {
      console.error('Failed to update topic status:', error)
      toast.error('Failed to update topic status')
    }
  }

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/topics/track?id=${topicId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Topic deleted successfully!')
        loadTopics()
      } else {
        toast.error('Failed to delete topic')
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
      toast.error('Failed to delete topic')
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Topic Tracking</h2>
          <p className="text-muted-foreground">
            Monitor your brand mentions across AI platforms and track success metrics
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Topic to Track</DialogTitle>
              <DialogDescription>
                Add a topic and brand name to monitor for AI mentions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="topicName">Topic Name</Label>
                <Input
                  id="topicName"
                  placeholder="e.g., project management software, AI tools"
                  value={formData.topicName}
                  onChange={(e) => setFormData(prev => ({ ...prev, topicName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="e.g., FlowTask, YourBrand"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Topic'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                <strong>Demo Mode:</strong> You're viewing sample data. Set up your database to track real topics.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{topic.topicName}</CardTitle>
                  <CardDescription>Brand: {topic.brandName}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(topic.isActive)}>
                    {getStatusIcon(topic.isActive)}
                    {topic.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-semibold text-primary">
                    {topic.brandMentions.length}
                  </div>
                  <div className="text-muted-foreground">Mentions</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-semibold text-accent">
                    {Math.ceil((Date.now() - new Date(topic.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-muted-foreground">Days</div>
                </div>
              </div>

              {/* Recent Mentions */}
              {topic.brandMentions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Recent Mentions</div>
                  <div className="space-y-2">
                    {topic.brandMentions.slice(0, 2).map((mention) => (
                      <div key={mention.id} className="text-xs p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3 h-3 text-green-600" />
                          <span className="font-medium">{mention.source || 'AI Platform'}</span>
                          <span className="text-muted-foreground">
                            {new Date(mention.mentionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {mention.responseText || 'Brand mentioned positively'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`switch-${topic.id}`} className="text-xs">Active</Label>
                  <Switch
                    id={`switch-${topic.id}`}
                    checked={topic.isActive}
                    onCheckedChange={(checked) => toggleTopicStatus(topic.id, checked)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTopic(topic.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Topics Tracked Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking topics to monitor your brand mentions across AI platforms
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Topic
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Metrics Summary */}
      {topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{topics.length}</div>
                <p className="text-sm text-muted-foreground">Total Topics</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-100 border border-green-200">
                <div className="text-2xl font-bold text-green-800">
                  {topics.filter(t => t.isActive).length}
                </div>
                <p className="text-sm text-green-700">Active Topics</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-100 border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">
                  {topics.reduce((sum, t) => sum + t.brandMentions.length, 0)}
                </div>
                <p className="text-sm text-blue-700">Total Mentions</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="text-2xl font-bold text-accent">
                  {topics.length > 0 ? Math.round(topics.reduce((sum, t) => sum + t.brandMentions.length, 0) / topics.length * 10) / 10 : 0}
                </div>
                <p className="text-sm text-muted-foreground">Avg. Mentions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
