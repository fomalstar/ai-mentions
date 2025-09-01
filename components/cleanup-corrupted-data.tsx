'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Trash2, RotateCcw, List, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function CleanupCorruptedData() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentKeywords, setCurrentKeywords] = useState<any[]>([])
  const [showKeywords, setShowKeywords] = useState(false)

  const cleanupCorruptedKeywords = async () => {
    if (!confirm('Are you sure you want to remove all corrupted keywords? This will delete:\n- Corrupted keywords (google, tewgw, gerg, etc.)\n- Related scan results\n- Scan queue items\n\nThis action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/cleanup-corrupted-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup-corrupted-keywords' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Cleanup completed! Deleted ${result.deleted.keywords} corrupted keywords`)
        
        if (result.corruptedKeywords?.length > 0) {
          console.log('🧹 Cleaned up corrupted keywords:', result.corruptedKeywords)
        }
      } else {
        const error = await response.json()
        toast.error(`Cleanup failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('Cleanup failed - check console for details')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefault = async () => {
    if (!confirm('Are you sure you want to reset to default state? This will:\n- Delete ALL existing keywords\n- Delete ALL scan results\n- Delete ALL scan queue items\n- Create a single clean keyword: "how to do seo"\n\nThis action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/cleanup-corrupted-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-to-default' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Reset completed! Database is now clean with correct keyword')
        console.log('🔄 Reset result:', result)
      } else {
        const error = await response.json()
        toast.error(`Reset failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Reset failed - check console for details')
    } finally {
      setIsLoading(false)
    }
  }

  const listCurrentKeywords = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cleanup-corrupted-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-keywords' })
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentKeywords(result.keywords || [])
        setShowKeywords(true)
        toast.success(`Found ${result.keywords?.length || 0} keywords`)
      } else {
        const error = await response.json()
        toast.error(`Failed to list keywords: ${error.error}`)
      }
    } catch (error) {
      console.error('List keywords error:', error)
      toast.error('Failed to list keywords - check console for details')
    } finally {
      setIsLoading(false)
    }
  }

  const comprehensiveCleanup = async () => {
    if (!confirm('Are you sure you want to perform comprehensive cleanup? This will:\n- Remove corrupted keywords from keyword_tracking\n- Remove corrupted keywords from brand_tracking\n- Clean up related scan results\n- Clean up scan queue items\n\nThis action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/cleanup-corrupted-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comprehensive-cleanup' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Comprehensive cleanup completed! Deleted ${result.deleted.keywords} keywords and ${result.deleted.brandTracking} brand tracking items`)
        console.log('🧹 Comprehensive cleanup result:', result)
      } else {
        const error = await response.json()
        toast.error(`Comprehensive cleanup failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Comprehensive cleanup error:', error)
      toast.error('Comprehensive cleanup failed - check console for details')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          Database Cleanup Tools
        </CardTitle>
        <CardDescription className="text-orange-700">
          Remove corrupted data and reset to clean state
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={listCurrentKeywords}
            disabled={isLoading}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <List className="w-4 h-4 mr-2" />
            List Keywords
          </Button>
          
          <Button
            onClick={cleanupCorruptedKeywords}
            disabled={isLoading}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clean Corrupted
          </Button>
          
          <Button
            onClick={comprehensiveCleanup}
            disabled={isLoading}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Comprehensive
          </Button>
          
          <Button
            onClick={resetToDefault}
            disabled={isLoading}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-sm text-orange-600 mt-2">Processing...</p>
          </div>
        )}

        {showKeywords && currentKeywords.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Current Keywords in Database:</h4>
            <div className="space-y-2">
              {currentKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{keyword.keyword}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-sm text-gray-600">{keyword.topic}</span>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                    keyword.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {keyword.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showKeywords && currentKeywords.length === 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">No keywords found in database</span>
            </div>
          </div>
        )}

        <div className="text-xs text-orange-600 bg-orange-100 p-3 rounded-lg">
          <strong>⚠️ Warning:</strong> These actions will permanently delete data from your database. 
          Make sure you have backups or are certain about the cleanup before proceeding.
        </div>
      </CardContent>
    </Card>
  )
}
