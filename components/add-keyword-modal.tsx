'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Plus } from "lucide-react"

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

interface AddKeywordModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onAddKeyword: (keywordData: any) => void
}

export function AddKeywordModal({
  isOpen,
  onClose,
  projects,
  onAddKeyword
}: AddKeywordModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    keyword: '',
    topic: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectId || !formData.keyword || !formData.topic) {
      return
    }

    const selectedProject = projects.find(p => p.id === formData.projectId)
    if (!selectedProject) return

    onAddKeyword({
      ...formData,
      projectName: selectedProject.name,
      brandName: selectedProject.brandName
    })

    // Reset form
    setFormData({
      projectId: '',
      keyword: '',
      topic: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Add Keyword to Tracking
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
            <Label htmlFor="topic">Topic to Track *</Label>
            <Textarea
              id="topic"
              placeholder="e.g., How do search engines use AI to rank websites?"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is the question/topic that will be asked to AI platforms to check for brand mentions.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add to Tracking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
