'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen } from "lucide-react"

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

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onUpdateProject: (project: Project) => void
}

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  onUpdateProject
}: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    brandName: '',
    description: '',
    status: 'active' as 'active' | 'paused'
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        website: project.website,
        brandName: project.brandName,
        description: project.description,
        status: project.status
      })
    }
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.website.trim() || !formData.brandName.trim()) {
      return
    }

    if (!project) return

    const updatedProject: Project = {
      ...project,
      name: formData.name.trim(),
      website: formData.website.trim(),
      brandName: formData.brandName.trim(),
      description: formData.description.trim(),
      status: formData.status
    }

    onUpdateProject(updatedProject)
  }

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Edit Project
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
                              placeholder="e.g., MyBrand"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Website URL *</Label>
            <Input
              id="website"
              placeholder="e.g., https://mysaas.com"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              placeholder="e.g., MySaaS, Acme Corp"
              value={formData.brandName}
              onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'active' | 'paused') => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
