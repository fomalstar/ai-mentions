import { NextRequest, NextResponse } from 'next/server'
import { aiTrackingService } from '@/lib/ai-tracking'

export async function POST(request: NextRequest) {
  try {
    // Get tracking items from request body or from storage
    const { trackingItems } = await request.json()

    if (!trackingItems || !Array.isArray(trackingItems)) {
      return NextResponse.json(
        { error: 'No tracking items provided' },
        { status: 400 }
      )
    }

    console.log(`Starting scheduled mention check for ${trackingItems.length} items`)

    // Check mentions for all tracking items
    const results = await aiTrackingService.batchCheckMentions(trackingItems)
    
    const mentionsFound = results.filter(r => r.hasMention).length

    console.log(`Scheduled check completed. Found ${mentionsFound} mentions out of ${results.length} total checks`)

    return NextResponse.json({
      success: true,
      results,
      totalMentions: mentionsFound,
      checkedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Scheduled tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to perform scheduled mention check' },
      { status: 500 }
    )
  }
}

// GET endpoint to get tracking status
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Scheduled tracking endpoint is active',
      lastCheck: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in scheduled tracking GET:', error)
    return NextResponse.json(
      { error: 'Failed to get tracking status' },
      { status: 500 }
    )
  }
}
