'use client'

import { signIn, getSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Github, Chrome, ArrowRight, Shield, Zap, Target } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return // Only run on client
    
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router, isClient])

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="aurora-bg">
          <div className="aurora-tertiary" />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sign in page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="aurora-bg">
        <div className="aurora-tertiary" />
      </div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Keyword Research
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover AI query insights and brand mention opportunities with our advanced keyword research tool.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm">AI Query Analysis & Opportunity Scoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm">Strategic Recommendations & Content Planning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm">Brand Monitoring & Topic Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In */}
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to access your AI keyword analysis dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleSignIn('google')} 
              disabled={isLoading}
              className="w-full h-12"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="w-5 h-5 mr-2" />
                  Continue with Google
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => handleSignIn('github')} 
              disabled={isLoading}
              className="w-full h-12"
              variant="outline"
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>By signing in, you agree to our terms of service and privacy policy.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
