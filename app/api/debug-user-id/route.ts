import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug user ID mismatch...')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 Session user ID:', session?.user?.id)
    console.log('📧 Session user email:', session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session email' })
    }
    
    // Find user by email (not by session ID)
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    })
    
    console.log('👤 Database user found:', dbUser)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' })
    }
    
    // Check if session ID matches database ID
    const idMatch = session.user.id === dbUser.id
    console.log('🔗 ID match:', idMatch)
    console.log('📊 Session ID:', session.user.id)
    console.log('📊 Database ID:', dbUser.id)
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.user.id,
        email: session.user.email
      },
      database: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name
      },
      idMatch: idMatch,
      problem: idMatch ? 'No ID mismatch' : 'Session ID does not match database ID'
    })
    
  } catch (error) {
    console.error('❌ Debug user ID error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
