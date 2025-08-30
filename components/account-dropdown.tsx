'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  ChevronUp,
  Crown,
  Sparkles
} from "lucide-react"
import { AuthModal } from "./auth-modal"

interface AccountDropdownProps {
  onAccountSettings?: () => void
  onBilling?: () => void
}

export function AccountDropdown({ onAccountSettings, onBilling }: AccountDropdownProps) {
  const { data: session, status } = useSession()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="w-20 h-3 bg-muted rounded mb-1" />
          <div className="w-16 h-2 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <>
        <Button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full justify-start gap-3 h-auto p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 hover:border-blue-500/40 text-foreground"
          variant="ghost"
        >
          <User className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Sign In</div>
            <div className="text-xs text-muted-foreground">Access your account</div>
          </div>
          <Sparkles className="w-4 h-4 text-blue-400" />
        </Button>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </>
    )
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
        return { label: 'Pro', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown }
      case 'starter':
        return { label: 'Starter', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: Sparkles }
      case 'explorer':
        return { label: 'Explorer', color: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: Sparkles }
      default:
        return { label: 'Free', color: 'bg-gradient-to-r from-gray-500 to-slate-500', icon: User }
    }
  }

  const tierInfo = getTierInfo(session.user.subscriptionTier || 'free')
  const TierIcon = tierInfo.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto p-3 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`text-xs font-medium text-white ${getAIAvatar(session.user.email || '')}`}>
              {getInitials(session.user.name || session.user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium truncate">
              {session.user.name || 'User'}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0 text-white border-0 ${tierInfo.color}`}
              >
                <TierIcon className="w-3 h-3 mr-1" />
                {tierInfo.label}
              </Badge>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`text-xs font-medium text-white ${getAIAvatar(session.user.email || '')}`}>
                {getInitials(session.user.name || session.user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{session.user.name || 'User'}</div>
              <div className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAccountSettings} className="gap-2">
          <Settings className="w-4 h-4" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBilling} className="gap-2">
          <CreditCard className="w-4 h-4" />
          Billing & Plans
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
