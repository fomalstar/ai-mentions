'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  User, 
  Mail, 
  Crown,
  Sparkles,
  CreditCard,
  Calendar,
  CheckCircle,
  Settings,
  Shield,
  Bell,
  Palette
} from "lucide-react"
import { toast } from 'sonner'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAIAvatar = (email: string) => {
    // Generate consistent AI avatar based on email hash
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    // Use different AI avatar styles based on hash
    const avatarStyles = [
      'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
      'bg-gradient-to-br from-green-500 via-teal-500 to-blue-500',
      'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
      'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
      'bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500'
    ]
    
    return avatarStyles[Math.abs(hash) % avatarStyles.length]
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'pro':
        return { 
          label: 'Pro', 
          color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
          icon: Crown,
          description: 'Advanced features and unlimited access'
        }
      case 'starter':
        return { 
          label: 'Starter', 
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500', 
          icon: Sparkles,
          description: 'Essential features for growing teams'
        }
      case 'explorer':
        return { 
          label: 'Explorer', 
          color: 'bg-gradient-to-r from-green-500 to-emerald-500', 
          icon: Sparkles,
          description: 'Enhanced features for professionals'
        }
      default:
        return { 
          label: 'Free', 
          color: 'bg-gradient-to-r from-gray-500 to-slate-500', 
          icon: User,
          description: 'Basic features to get started'
        }
    }
  }

  const tierInfo = getTierInfo(session.user.subscriptionTier || 'free')
  const TierIcon = tierInfo.icon

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradePlan = () => {
    router.push('/pricing')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your profile and subscription</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className={`text-lg font-medium text-white ${getAIAvatar(session.user.email || '')}`}>
                    {getInitials(session.user.name || session.user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{session.user.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  <div className="mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-white border-0 ${tierInfo.color}`}
                    >
                      <TierIcon className="w-3 h-3 mr-1" />
                      {tierInfo.label} Plan
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${tierInfo.color} flex items-center justify-center`}>
                    <TierIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tierInfo.label} Plan</h3>
                    <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {tierInfo.label === 'Free' ? '$0' : '$29'}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  {tierInfo.label === 'Free' && (
                    <Button onClick={handleUpgradePlan} size="sm" className="mt-2">
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-muted-foreground">Keywords Tracked</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">42</div>
                  <div className="text-sm text-muted-foreground">Mentions Found</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
              </div>

              {tierInfo.label !== 'Free' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Next billing date: January 15, 2025
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Customize your account settings and application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Settings */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notification Preferences
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates about mentions and reports</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Real-time Alerts</div>
                      <div className="text-sm text-muted-foreground">Get instant notifications for new brand mentions</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Reports</div>
                      <div className="text-sm text-muted-foreground">Receive weekly summary of keyword performance</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Privacy & Security */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy & Security
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Export</div>
                      <div className="text-sm text-muted-foreground">Download your data and analysis history</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Access</div>
                      <div className="text-sm text-muted-foreground">Manage API keys and third-party integrations</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Appearance */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance & Interface
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Theme Preference</div>
                      <div className="text-sm text-muted-foreground">Choose between light, dark, or system theme</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Dark Mode
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Dashboard Layout</div>
                      <div className="text-sm text-muted-foreground">Customize your dashboard view and widgets</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Customize
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Language</div>
                      <div className="text-sm text-muted-foreground">Set your preferred language for the interface</div>
                    </div>
                    <Button variant="outline" size="sm">
                      English
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
