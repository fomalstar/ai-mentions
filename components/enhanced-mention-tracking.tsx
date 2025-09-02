'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Play, Square, BarChart3, ExternalLink, TrendingUp, TrendingDown, Minus, Loader2, Plus, Eye, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface KeywordMetrics {
  id: string
  keyword: string
  topic: string
  avgPosition: number | null
  positionChange: number | null
  chatgptPosition: number | null
  perplexityPosition: number | null
  geminiPosition: number | null
  lastScanAt: string | null
  scanCount: number
  isScanning?: boolean
}

interface BrandTracking {
  id: string
  displayName: string
  scanningEnabled: boolean
  lastScanAt: string | null
  keywords: KeywordMetrics[]
  scansLast24h: number
}

interface DataSource {
  id: string
  brandName: string
  keyword: string
  platform: string
  urls: Array<{
    url: string
    domain: string
    title: string
    date?: string
  }>
  scanDate: string
  position: number | null
  confidence: number
}

export function EnhancedMentionTracking() {
  const [brands, setBrands] = useState<BrandTracking[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [newBrand, setNewBrand] = useState({ name: '', website: '', keywords: '' })
  const [sourcesPage, setSourcesPage] = useState(1)
  const [sourcesPageSize] = useState(10)
  const [showUrlsModal, setShowUrlsModal] = useState(false)
  const [selectedKeywordForUrls, setSelectedKeywordForUrls] = useState<{ brandId?: string, keyword: string, topic?: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load scanning status and brands
      const statusResponse = await fetch('/api/mentions/status')
      if (statusResponse.ok) {
        const data = await statusResponse.json()
        setBrands(data.brands || [])
      }

      // Load data sources
      const sourcesResponse = await fetch('/api/mentions/sources')
      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json()
        setDataSources(sourcesData.sources || [])
        setSourcesPage(1)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load mention tracking data')
    } finally {
      setIsLoading(false)
    }
  }

  const startScan = async (brandId: string, immediate = false) => {
    setIsScanning(true)
    setScanProgress(0)
    
    try {
      const response = await fetch('/api/mentions/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brandTrackingId: brandId, 
          immediate 
        })
      })

      if (response.ok) {
        toast.success('Scan started successfully!')
        // Start progress simulation
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 15
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setTimeout(() => {
              setIsScanning(false)
              setScanProgress(0)
              setSelectedBrand(null)
              loadData()
            }, 1000)
          }
          setScanProgress(Math.round(progress))
        }, 500)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start scan')
        setIsScanning(false)
        setScanProgress(0)
      }
    } catch (error) {
      console.error('Start scan error:', error)
      toast.error('Failed to start scan')
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  const startScanAll = async () => {
    setIsScanning(true)
    setScanProgress(0)
    
    try {
      const totalBrands = brands.length
      let completedBrands = 0
      
      for (const brand of brands) {
        try {
          const response = await fetch('/api/mentions/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              brandTrackingId: brand.id, 
              immediate: true 
            })
          })

          if (response.ok) {
            completedBrands++
            const progress = Math.round((completedBrands / totalBrands) * 100)
            setScanProgress(progress)
          } else {
            console.error(`Failed to scan brand ${brand.displayName}`)
          }
        } catch (error) {
          console.error(`Error scanning brand ${brand.displayName}:`, error)
        }
        
        // Add delay between scans to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      toast.success(`Scan completed for ${completedBrands} out of ${totalBrands} brands!`)
      
      // Refresh data after completion
      setTimeout(() => {
        loadData()
      }, 2000)
      
    } catch (error) {
      console.error('Scan all error:', error)
      toast.error('Failed to complete all scans')
    } finally {
      setTimeout(() => {
        setIsScanning(false)
        setScanProgress(0)
        setSelectedBrand(null)
      }, 1000)
    }
  }

  const stopScanning = async (brandId: string) => {
    try {
      const response = await fetch('/api/mentions/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandTrackingId: brandId })
      })

      if (response.ok) {
        toast.success('Scanning stopped successfully')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to stop scanning')
      }
    } catch (error) {
      console.error('Stop scanning error:', error)
      toast.error('Failed to stop scanning')
    }
  }

  const addNewBrand = async () => {
    if (!newBrand.name.trim() || !newBrand.keywords.trim()) {
      toast.error('Please enter brand name and keywords')
      return
    }

    try {
      const keywords = newBrand.keywords.split(',').map(k => k.trim()).filter(k => k)
      // Create topics from keywords (you can modify this logic)
      const topics = keywords.map(keyword => `What are the best ${keyword} tools and platforms?`)
      
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: newBrand.name,
          keywords,
          topics,
          website: newBrand.website
        })
      })

      if (response.ok) {
        toast.success('Brand added successfully!')
        setShowAddBrand(false)
        setNewBrand({ name: '', website: '', keywords: '' })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add brand')
      }
    } catch (error) {
      console.error('Add brand error:', error)
      toast.error('Failed to add brand')
    }
  }

  const formatPosition = (position: number | null) => {
    if (position === null) return '-'
    return `#${position}`
  }

  const formatChange = (change: number | null) => {
    if (change === null) return <Minus className="w-4 h-4 text-muted-foreground" />
    if (change > 0) return <div className="flex items-center text-green-600"><TrendingUp className="w-4 h-4 mr-1" />+{change.toFixed(1)}</div>
    if (change < 0) return <div className="flex items-center text-red-600"><TrendingDown className="w-4 h-4 mr-1" />{change.toFixed(1)}</div>
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const openUrlsForKeyword = (keyword: string, topic?: string) => {
    setSelectedKeywordForUrls({ keyword, topic })
    setShowUrlsModal(true)
  }

  const setKeywordScanningState = (brandId: string, keywordId: string, scanning: boolean) => {
    setBrands(prev => prev.map(b => {
      if (b.id !== brandId) return b
      return {
        ...b,
        keywords: b.keywords.map(k => k.id === keywordId ? { ...k, isScanning: scanning } : k)
      }
    }))
  }

  const startScanSingle = async (brandId: string, keywordId: string) => {
    try {
      setKeywordScanningState(brandId, keywordId, true)
      const response = await fetch('/api/mentions/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandTrackingId: brandId, keywordTrackingId: keywordId, immediate: true })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        toast.error(err.error || 'Failed to scan this topic')
        return
      }
      toast.success('Scan completed for this topic')
      await loadData()
    } catch (e) {
      console.error('Single scan error:', e)
      toast.error('Failed to scan this topic')
    } finally {
      setKeywordScanningState(brandId, keywordId, false)
    }
  }

  const totalSourcesPages = Math.max(1, Math.ceil(dataSources.length / sourcesPageSize))
  const pagedSources = dataSources.slice((sourcesPage - 1) * sourcesPageSize, sourcesPage * sourcesPageSize)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Mention Tracking</h1>
          <p className="text-muted-foreground">Track your brand mentions across AI platforms with position rankings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (brands.length > 0) {
                setSelectedBrand('all')
                startScanAll()
              } else {
                toast.error('No brands configured to scan')
              }
            }}
            disabled={isScanning || brands.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          >
            {isScanning && selectedBrand === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Scan All Projects
          </Button>
          <Dialog open={showAddBrand} onOpenChange={setShowAddBrand}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Start tracking mentions for a new brand across AI platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., MyBrand"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={newBrand.website}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="e.g., https://mybrand.com"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    value={newBrand.keywords}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g., project management, productivity tools"
                  />
                </div>
                <Button onClick={addNewBrand} className="w-full">
                  Add Brand
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tracking" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tracking">Position Tracking</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Position Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {brand.displayName}
                      <Badge variant={brand.scanningEnabled ? 'default' : 'secondary'}>
                        {brand.scanningEnabled ? 'Active' : 'Paused'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {brand.keywords.length} keywords tracked • {brand.scansLast24h} scans in last 24h
                      {brand.lastScanAt && ` • Last scan: ${new Date(brand.lastScanAt).toLocaleDateString()}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isScanning && selectedBrand === brand.id && (
                      <div className="flex items-center gap-2">
                        <Progress value={scanProgress} className="w-20" />
                        <span className="text-sm text-muted-foreground">{scanProgress}%</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBrand(brand.id)
                        startScan(brand.id, true)
                      }}
                      disabled={isScanning}
                    >
                      {isScanning && selectedBrand === brand.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isScanning && selectedBrand === brand.id ? 'Scanning...' : 'Run Scan'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => stopScanning(brand.id)}
                      disabled={!isScanning || selectedBrand !== brand.id}
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {brand.keywords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Avg Position</TableHead>
                        <TableHead>ChatGPT</TableHead>
                        <TableHead>Perplexity</TableHead>
                        <TableHead>Gemini</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Last Scan</TableHead>
                        <TableHead>Scan Count</TableHead>
                        <TableHead>Sources</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brand.keywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell className="font-medium">{keyword.keyword}</TableCell>
                          <TableCell className="max-w-xs truncate">{keyword.topic}</TableCell>
                          <TableCell>{formatPosition(keyword.avgPosition)}</TableCell>
                          <TableCell>{formatPosition(keyword.chatgptPosition)}</TableCell>
                          <TableCell>{formatPosition(keyword.perplexityPosition)}</TableCell>
                          <TableCell>{formatPosition(keyword.geminiPosition)}</TableCell>
                          <TableCell>{formatChange(keyword.positionChange)}</TableCell>
                          <TableCell>
                            {keyword.lastScanAt ? new Date(keyword.lastScanAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{keyword.scanCount}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUrlsForKeyword(keyword.keyword, keyword.topic)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" /> URLs
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startScanSingle(brand.id, keyword.id)}
                              disabled={!!keyword.isScanning}
                            >
                              {keyword.isScanning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-1" />
                              )}
                              {keyword.isScanning ? 'Scanning' : 'Refresh'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No keywords configured for this brand</p>
                    <p className="text-sm">Add keywords to start tracking mentions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {brands.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No brands configured</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your brand mentions across AI platforms
                </p>
                <Button onClick={() => setShowAddBrand(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Brand
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Data Sources
              </CardTitle>
              <CardDescription>
                Source URLs where your brand was mentioned by AI platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataSources.length > 0 ? (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto pr-1">
                  {pagedSources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{source.brandName} - {source.keyword}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{source.platform}</Badge>
                            {source.position && <Badge variant="secondary">#{source.position}</Badge>}
                            <span>•</span>
                            <span>{new Date(source.scanDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Confidence: {Math.round(source.confidence * 100)}%</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {source.urls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium text-sm">{url.domain}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-md">
                                {url.title}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(url.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                  {/* Pagination Controls */}
                  {totalSourcesPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSourcesPage(p => Math.max(1, p - 1))}
                        disabled={sourcesPage === 1}
                      >
                        Prev
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {sourcesPage} of {totalSourcesPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSourcesPage(p => Math.min(totalSourcesPages, p + 1))}
                        disabled={sourcesPage === totalSourcesPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data sources found</p>
                  <p className="text-sm">Run scans to collect source URLs from AI platforms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* URLs Modal for a specific keyword/topic */}
      <Dialog open={showUrlsModal} onOpenChange={setShowUrlsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Source URLs for {selectedKeywordForUrls?.keyword}</DialogTitle>
            <DialogDescription>
              All URLs collected across AI platforms for this topic's research.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {(() => {
              if (!selectedKeywordForUrls) return null
              const urls = dataSources
                .filter(s => s.keyword === selectedKeywordForUrls.keyword)
                .flatMap(s => s.urls.map(u => ({ ...u, platform: s.platform, date: s.scanDate })))
              const unique = Array.from(new Map(urls.map(u => [u.url, u])).values())
              if (unique.length === 0) {
                return <div className="text-sm text-muted-foreground">No URLs found for this keyword yet.</div>
              }
              return unique.map((u, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium text-sm">{u.domain}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-md">{u.title}</div>
                  </div>
                    <Button variant="ghost" size="sm" onClick={() => window.open(u.url, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
              ))
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
