'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Trash2, RotateCcw, List, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runCleanup = async (action: string) => {
    setIsLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/cleanup-corrupted-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        setResults(result)
        
        if (action === 'comprehensive-cleanup') {
          toast.success(`Cleanup completed! Deleted ${result.deleted?.keywords || 0} keywords and cleaned ${result.deleted?.brandTracking || 0} brand tracking items`)
        } else if (action === 'list-keywords') {
          toast.success(`Found ${result.keywords?.length || 0} keywords in database`)
        } else if (action === 'reset-to-default') {
          toast.success('Database reset to clean state!')
        } else if (action === 'nuclear-reset') {
          toast.success('Nuclear reset completed! All data deleted and recreated.')
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Cleanup Tools</h1>
          <p className="text-gray-600">Clean corrupted data and reset database to working state</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <List className="w-5 h-5" />
                Inspect Database
              </CardTitle>
              <CardDescription className="text-orange-700">
                List all current keywords to see what's in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runCleanup('list-keywords')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    List Keywords
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Trash2 className="w-5 h-5" />
                Clean Corrupted Data
              </CardTitle>
              <CardDescription className="text-red-700">
                Remove corrupted keywords like "ergerg", "tewgw", etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runCleanup('cleanup-corrupted-keywords')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Corrupted
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <AlertTriangle className="w-5 h-5" />
                Comprehensive Cleanup
              </CardTitle>
              <CardDescription className="text-purple-700">
                Clean both keyword tracking AND brand tracking tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runCleanup('comprehensive-cleanup')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Comprehensive
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <RotateCcw className="w-5 h-5" />
                Reset to Default
              </CardTitle>
              <CardDescription className="text-blue-700">
                Complete reset with clean "how to do seo" keyword
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runCleanup('reset-to-default')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-500 bg-red-100 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                💥 Nuclear Reset (DANGER)
              </CardTitle>
              <CardDescription className="text-red-800">
                DELETE ALL DATA and start completely fresh. Use only if other cleanups fail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  if (confirm('⚠️ DANGER: This will DELETE ALL your data and start fresh. Are you absolutely sure?')) {
                    runCleanup('nuclear-reset')
                  }
                }}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting Everything...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    💥 Nuclear Reset
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-white p-4 rounded-lg border text-sm overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• These actions will permanently delete data from your database</li>
                <li>• Make sure you have backups or are certain about the cleanup</li>
                <li>• Start with "List Keywords" to see what's in your database</li>
                <li>• Use "Comprehensive Cleanup" to remove all corrupted data</li>
                <li>• After cleanup, test your mention tracking functionality</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
