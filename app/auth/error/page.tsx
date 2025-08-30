'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          suggestion: 'This usually means the OAuth provider is not properly configured.'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          suggestion: 'Please try with a different account or contact support.'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification link has expired or is invalid.',
          suggestion: 'Please try signing in again.'
        }
      case 'Callback':
        return {
          title: 'OAuth Callback Error',
          description: 'There was an error during the OAuth authentication process.',
          suggestion: 'This might be due to incorrect redirect URLs. Please try again or contact support.'
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          suggestion: 'Please try signing in again.'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="aurora-bg">
        <div className="aurora-tertiary" />
      </div>
      
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold text-destructive">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-center">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Suggestion:</strong> {errorInfo.suggestion}
            </p>
            {error && (
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Error Code:</strong> {error}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              asChild
              className="w-full"
            >
              <Link href="/">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="w-full"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
