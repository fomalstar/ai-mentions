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
import { Play, Square, BarChart3, ExternalLink, TrendingUp, TrendingDown, Minus, Loader2, Plus, Eye } from 'lucide-react'
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
        const data = await response.json()
        toast.success(immediate ? 'Scan completed successfully!' : 'Scan scheduled successfully!')
        
        if (immediate) {
          // Simulate progress for immediate scan
          for (let i = 0; i <= 100; i += 20) {
            setScanProgress(i)
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
        
        loadData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start scan')
      }
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to start scan')
    } finally {
      setIsScanning(false)
      setScanProgress(0)
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
      const response = await fetch('/api/mentions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: newBrand.name,
          keywords,
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

      {/* Main Content */}
      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tracking">Position Tracking</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

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
                      onClick={() => startScan(brand.id, true)}
                      disabled={isScanning}
                      className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                    >
                      {isScanning && selectedBrand === brand.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run Scan
                    </Button>
                    {brand.scanningEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stopScanning(brand.id)}
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startScan(brand.id, false)}
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {brand.keywords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Avg. Position</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>ChatGPT</TableHead>
                        <TableHead>Perplexity</TableHead>
                        <TableHead>Gemini</TableHead>
                        <TableHead>Last Scan</TableHead>
                        <TableHead>Scans</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brand.keywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell className="font-medium">{keyword.keyword}</TableCell>
                          <TableCell>
                            {keyword.avgPosition ? (
                              <Badge variant="outline">#{keyword.avgPosition.toFixed(1)}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{formatChange(keyword.positionChange)}</TableCell>
                          <TableCell>{formatPosition(keyword.chatgptPosition)}</TableCell>
                          <TableCell>{formatPosition(keyword.perplexityPosition)}</TableCell>
                          <TableCell>{formatPosition(keyword.geminiPosition)}</TableCell>
                          <TableCell>
                            {keyword.lastScanAt ? (
                              <span className="text-sm text-muted-foreground">
                                {new Date(keyword.lastScanAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{keyword.scanCount}</Badge>
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
                  {dataSources.map((source) => (
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
    </div>
  )
}
