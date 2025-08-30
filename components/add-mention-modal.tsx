'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Bot, Sparkles, Zap } from "lucide-react"

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

interface AddMentionModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onAddMention: (mentionData: any) => void
}

export function AddMentionModal({
  isOpen,
  onClose,
  projects,
  onAddMention
}: AddMentionModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    keyword: '',
    topic: '',
    aiResponse: '',
    mentionType: 'neutral',
    source: 'perplexity'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectId || !formData.keyword || !formData.topic || !formData.aiResponse) {
      return
    }

    const selectedProject = projects.find(p => p.id === formData.projectId)
    if (!selectedProject) return

    onAddMention({
      ...formData,
      brandName: selectedProject.brandName
    })

    // Reset form
    setFormData({
      projectId: '',
      keyword: '',
      topic: '',
      aiResponse: '',
      mentionType: 'neutral',
      source: 'perplexity'
    })
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'perplexity': return <Bot className="w-4 h-4" />
      case 'chatgpt': return <MessageSquare className="w-4 h-4" />
      case 'gemini': return <Sparkles className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Add Manual Mention
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="project">Project *</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.brandName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keyword">Keyword *</Label>
            <Input
              id="keyword"
              placeholder="e.g., AI tools, project management"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., How do search engines use AI to rank websites?"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aiResponse">AI Response *</Label>
            <Textarea
              id="aiResponse"
              placeholder="Paste the AI response here..."
              value={formData.aiResponse}
              onChange={(e) => setFormData(prev => ({ ...prev, aiResponse: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="source">AI Platform *</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perplexity">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Perplexity
                    </div>
                  </SelectItem>
                  <SelectItem value="chatgpt">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      ChatGPT
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Gemini
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mentionType">Sentiment</Label>
              <Select 
                value={formData.mentionType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, mentionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Mention
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
