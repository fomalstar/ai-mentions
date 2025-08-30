'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: (project: any) => void
}

export function ProjectModal({ isOpen, onClose, onProjectCreated }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    brandName: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.website.trim() || !formData.brandName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newProject = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        website: formData.website.trim(),
        brandName: formData.brandName.trim(),
        description: formData.description.trim(),
        createdAt: new Date().toISOString(),
        status: 'active' as const,
        keywordsTracked: 0,
        mentionsFound: 0,
        lastActivity: new Date().toISOString()
      }
      
      onProjectCreated(newProject)
      toast.success('Project created successfully!')
      
      // Reset form
      setFormData({ name: '', website: '', brandName: '', description: '' })
      onClose()
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new website or brand to track keywords and mentions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                type="url"
                placeholder="https://example.com"
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
                placeholder="Brief description of your project or brand..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
