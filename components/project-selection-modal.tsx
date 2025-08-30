'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, Check } from "lucide-react"
import { ProjectModal } from "./project-modal"

interface Project {
  id: string
  name: string
  website: string
  description: string
  brandName: string
  createdAt: string
  status: 'active' | 'paused'
  keywordsTracked: number
  mentionsFound: number
  lastActivity: string
}

interface ProjectSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onProjectSelected: (project: Project) => void
  onProjectCreated: (project: Project) => void
  topicData: {
    keyword: string
    topic: string
  }
}

export function ProjectSelectionModal({
  isOpen,
  onClose,
  projects,
  onProjectSelected,
  onProjectCreated,
  topicData
}: ProjectSelectionModalProps) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id)
  }

  const handleConfirm = () => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId)
      if (project) {
        onProjectSelected(project)
        onClose()
        setSelectedProjectId(null)
      }
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    onProjectCreated(newProject)
    setIsProjectModalOpen(false)
    // Auto-select the newly created project
    setSelectedProjectId(newProject.id)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Select Project for Tracking
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Topic Info */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Topic to Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Keyword:</span>
                  <span className="text-sm ml-2 text-muted-foreground">{topicData.keyword}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Topic:</span>
                  <span className="text-sm ml-2 text-muted-foreground">{topicData.topic}</span>
                </div>
              </CardContent>
            </Card>

            {/* Project Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select a Project</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsProjectModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start tracking mentions
                  </p>
                  <Button onClick={() => setIsProjectModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProjectId === project.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleProjectSelect(project)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{project.name}</h4>
                              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {project.website}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Brand: {project.brandName} • {project.keywordsTracked} keywords tracked
                            </p>
                          </div>
                          {selectedProjectId === project.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!selectedProjectId}
              >
                Add to Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}
