import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    })

    // Get all accounts
    const accounts = await prisma.account.findMany()

    // Get all sessions
    const sessions = await prisma.session.findMany()

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          accountsCount: user.accounts.length,
          sessionsCount: user.sessions.length,
          accounts: user.accounts.map(acc => ({
            id: acc.id,
            provider: acc.provider,
            providerAccountId: acc.providerAccountId,
            type: acc.type
          }))
        })),
        totalAccounts: accounts.length,
        totalSessions: sessions.length,
        accountDetails: accounts.map(acc => ({
          id: acc.id,
          userId: acc.userId,
          provider: acc.provider,
          providerAccountId: acc.providerAccountId,
          type: acc.type
        }))
      }
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
