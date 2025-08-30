'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User, Github, Sparkles, Bot } from "lucide-react"
import { signIn, signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Handle signup
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        toast.success('Account created successfully! Please sign in.')
        setIsSignUp(false)
        setFormData({ name: '', email: '', password: '' })
      } else {
        // Handle signin
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.error) {
          throw new Error('Invalid email or password')
        }

        toast.success('Signed in successfully!')
        onClose()
        setFormData({ name: '', email: '', password: '' })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      console.log(`🔐 Initiating ${provider} OAuth sign in...`)
      
      // Use redirect: true to ensure proper redirect handling
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false // Set to false to handle errors properly
      })
      
      console.log('🔐 OAuth result:', result)
      
      if (result?.error) {
        console.error('❌ OAuth error:', result.error)
        toast.error(`${provider} sign in failed: ${result.error}`)
      } else if (result?.ok) {
        console.log('✅ OAuth successful, redirecting...')
        window.location.href = '/dashboard'
      } else if (result?.url) {
        console.log('🔄 OAuth redirecting to:', result.url)
        window.location.href = result.url
      }
    } catch (error) {
      console.error('❌ OAuth exception:', error)
      toast.error(`${provider} sign in failed. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    onClose()
  }

  if (session) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-white flex items-center justify-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              AI Mentions Account
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </div>
              <h3 className="font-semibold text-white">{session.user?.name}</h3>
              <p className="text-sm text-slate-400">{session.user?.email}</p>
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            {isSignUp ? 'Join AI Mentions' : 'Welcome Back'}
          </DialogTitle>
          <p className="text-sm text-slate-400 text-center mt-1">
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue'}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 py-3 px-4 rounded-lg"
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormData({ name: '', email: '', password: '' })
              }}
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
