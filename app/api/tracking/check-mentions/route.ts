import { NextRequest, NextResponse } from 'next/server'
import { aiTrackingService } from '@/lib/ai-tracking'

export async function POST(request: NextRequest) {
  try {
    const { trackingItems } = await request.json()

    if (!trackingItems || !Array.isArray(trackingItems)) {
      return NextResponse.json(
        { error: 'Invalid tracking items provided' },
        { status: 400 }
      )
    }

    // Check mentions for all tracking items
    const results = await aiTrackingService.batchCheckMentions(trackingItems)

    // In real app, save to database
    // For now, just return the results

    return NextResponse.json({
      success: true,
      results,
      totalMentions: results.filter(r => r.hasMention).length
    })

  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json(
      { error: 'Failed to check mentions' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve mention results
export async function GET() {
  try {
    // In real app, retrieve from database
    // For now, return empty array
    return NextResponse.json({
      success: true,
      results: [],
      totalMentions: 0
    })

  } catch (error) {
    console.error('Error retrieving mention results:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve mention results' },
      { status: 500 }
    )
  }
}
