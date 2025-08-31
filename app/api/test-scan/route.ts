import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiScanningService } from '@/lib/ai-scanning'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test the AI scanning service directly
    const testRequest = {
      userId: session.user.id,
      brandTrackingId: 'test-brand-id',
      keywordTrackingId: 'test-keyword-id',
      brandName: 'Yandex',
      keyword: 'yandex',
      topic: 'search engines'
    }

    console.log('🧪 Testing AI scanning service with:', testRequest)
    
    try {
      const results = await aiScanningService.scanKeyword(testRequest)
      
      return NextResponse.json({
        success: true,
        message: 'AI scanning test completed successfully',
        results: results.map(result => ({
          platform: result.platform,
          brandMentioned: result.brandMentioned,
          position: result.position,
          sourceUrlsCount: result.sourceUrls.length,
          responseLength: result.responseText.length,
          scanDuration: result.scanDuration
        }))
      })
    } catch (scanError) {
      console.error('AI scanning test failed:', scanError)
      return NextResponse.json({
        success: false,
        error: 'AI scanning test failed',
        details: scanError instanceof Error ? scanError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test scan API error:', error)
    return NextResponse.json({ 
      error: 'Failed to test scan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
