import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyword, n8nWebhookUrl, n8nApiKey } = body

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // If n8n webhook is provided, forward the request to n8n
    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(n8nApiKey && { 'Authorization': `Bearer ${n8nApiKey}` }),
          },
          body: JSON.stringify({
            keyword,
            action: 'generate_content_strategy',
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          }),
        })

        if (!n8nResponse.ok) {
          throw new Error(`n8n webhook error: ${n8nResponse.status}`)
        }

        const n8nData = await n8nResponse.json()
        return NextResponse.json(n8nData)
      } catch (error) {
        console.error('n8n webhook error:', error)
        return NextResponse.json({ 
          error: 'Failed to connect to n8n webhook',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // Fallback to demo data if no n8n webhook
    const demoStrategy = {
      keyword,
      briefs: [
        {
          id: `demo-${Date.now()}`,
          title: `The Ultimate Guide to ${keyword}`,
          description: `Comprehensive guide covering everything about ${keyword} for beginners and experts alike.`,
          targetAudience: 'Professionals and enthusiasts interested in this topic',
          keyPoints: [
            `What is ${keyword} and why it matters`,
            'Key benefits and applications',
            'Best practices and implementation strategies',
            'Common challenges and solutions',
            'Future trends and predictions'
          ],
          contentType: 'Comprehensive Guide',
          estimatedWordCount: 2500,
          seoScore: 85,
          aiOpportunityScore: 9,
          suggestedKeywords: [
            `${keyword} guide`,
            `${keyword} tutorial`,
            `${keyword} best practices`,
            `${keyword} examples`,
            `${keyword} tips`
          ],
          contentOutline: [
            'Introduction and overview',
            'Core concepts and definitions',
            'Step-by-step implementation',
            'Real-world examples and case studies',
            'Advanced techniques and optimization',
            'Conclusion and next steps'
          ],
          callToAction: 'Start implementing these strategies today to improve your results.',
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          n8nWorkflowId: 'demo-workflow-1'
        },
        {
          id: `demo-${Date.now() + 1}`,
          title: `Top 10 ${keyword} Strategies for 2024`,
          description: `Discover the most effective strategies for ${keyword} that are working in 2024.`,
          targetAudience: 'Marketing professionals and business owners',
          keyPoints: [
            'Current market trends and insights',
            'Proven strategies that work',
            'Tools and resources needed',
            'Measurement and analytics',
            'Scaling and optimization'
          ],
          contentType: 'Listicle',
          estimatedWordCount: 1800,
          seoScore: 78,
          aiOpportunityScore: 7,
          suggestedKeywords: [
            `${keyword} strategies`,
            `${keyword} 2024`,
            `${keyword} tips`,
            `${keyword} techniques`,
            `${keyword} methods`
          ],
          contentOutline: [
            'Introduction to current landscape',
            'Strategy 1-5 with detailed explanations',
            'Strategy 6-10 with actionable steps',
            'Implementation roadmap',
            'Success metrics and KPIs'
          ],
          callToAction: 'Choose 2-3 strategies to implement this month and track your results.',
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          n8nWorkflowId: 'demo-workflow-2'
        }
      ],
      contentCalendar: [
        {
          week: 1,
          content: `Ultimate Guide to ${keyword}`,
          type: 'Comprehensive Guide',
          status: 'Planned',
          priority: 'High'
        },
        {
          week: 2,
          content: `Top 10 ${keyword} Strategies`,
          type: 'Listicle',
          status: 'Planned',
          priority: 'Medium'
        },
        {
          week: 3,
          content: `${keyword} Case Study`,
          type: 'Case Study',
          status: 'Planned',
          priority: 'Medium'
        }
      ],
      roiProjections: [
        {
          metric: 'Organic Traffic',
          current: 1000,
          projected: 2500,
          growth: '+150%'
        },
        {
          metric: 'Lead Generation',
          current: 50,
          projected: 125,
          growth: '+150%'
        },
        {
          metric: 'Brand Mentions',
          current: 10,
          projected: 35,
          growth: '+250%'
        }
      ],
      n8nIntegration: {
        webhookUrl: n8nWebhookUrl || '',
        apiKey: n8nApiKey || '',
        workflowStatus: n8nWebhookUrl ? 'active' : 'inactive',
        lastSync: new Date().toISOString()
      }
    }

    return NextResponse.json(demoStrategy)
  } catch (error) {
    console.error('Content strategy API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword parameter is required' }, { status: 400 })
    }

    // Return demo data for GET requests
    const demoStrategy = {
      keyword,
      briefs: [
        {
          id: `demo-${Date.now()}`,
          title: `The Ultimate Guide to ${keyword}`,
          description: `Comprehensive guide covering everything about ${keyword} for beginners and experts alike.`,
          targetAudience: 'Professionals and enthusiasts interested in this topic',
          keyPoints: [
            `What is ${keyword} and why it matters`,
            'Key benefits and applications',
            'Best practices and implementation strategies',
            'Common challenges and solutions',
            'Future trends and predictions'
          ],
          contentType: 'Comprehensive Guide',
          estimatedWordCount: 2500,
          seoScore: 85,
          aiOpportunityScore: 9,
          suggestedKeywords: [
            `${keyword} guide`,
            `${keyword} tutorial`,
            `${keyword} best practices`,
            `${keyword} examples`,
            `${keyword} tips`
          ],
          contentOutline: [
            'Introduction and overview',
            'Core concepts and definitions',
            'Step-by-step implementation',
            'Real-world examples and case studies',
            'Advanced techniques and optimization',
            'Conclusion and next steps'
          ],
          callToAction: 'Start implementing these strategies today to improve your results.',
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          n8nWorkflowId: 'demo-workflow-1'
        }
      ],
      contentCalendar: [],
      roiProjections: [],
      n8nIntegration: {
        webhookUrl: '',
        apiKey: '',
        workflowStatus: 'inactive' as const,
        lastSync: new Date().toISOString()
      }
    }

    return NextResponse.json(demoStrategy)
  } catch (error) {
    console.error('Content strategy API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
