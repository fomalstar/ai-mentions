import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This endpoint is designed to be called by external cron services
    // It will trigger the automated scan run
    
    console.log('⏰ Cron job triggered - running automated scans...')
    
    // Call the automated scan endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mentions/run-automated-scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add a simple secret to prevent unauthorized access
        'X-Cron-Secret': process.env.CRON_SECRET || 'default-secret'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Cron job completed successfully:', data)
      
      return NextResponse.json({
        success: true,
        message: 'Automated scans triggered successfully',
        timestamp: new Date().toISOString(),
        results: data
      })
    } else {
      const error = await response.text()
      console.error('❌ Cron job failed:', error)
      
      return NextResponse.json({
        success: false,
        message: 'Failed to trigger automated scans',
        error: error,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Cron job failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
