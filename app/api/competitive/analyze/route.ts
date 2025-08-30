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
    const { keyword } = body

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // Demo competitive analysis data
    const competitiveAnalysis = {
      keyword,
      competitors: [
        {
          id: 'comp-1',
          name: 'Competitor A',
          domain: 'competitora.com',
          marketShare: 25,
          trafficShare: 30,
          keywordOverlap: 65,
          contentGap: 15,
          backlinkStrength: 85,
          socialPresence: 70,
          aiMentions: 45,
          strengths: [
            'Strong brand recognition',
            'Extensive content library',
            'High domain authority'
          ],
          weaknesses: [
            'Limited AI integration',
            'Slow content updates',
            'Poor mobile experience'
          ],
          opportunities: [
            'AI-powered features',
            'Video content expansion',
            'Mobile optimization'
          ],
          threats: [
            'New market entrants',
            'Changing algorithms',
            'User behavior shifts'
          ],
          recentContent: [
            {
              title: `How to Master ${keyword} in 2024`,
              url: 'https://competitora.com/master-keyword',
              publishedAt: '2024-01-15',
              engagement: 85
            },
            {
              title: `${keyword} Best Practices Guide`,
              url: 'https://competitora.com/best-practices',
              publishedAt: '2024-01-10',
              engagement: 72
            }
          ],
          aiQueries: [
            {
              query: `best ${keyword} tools`,
              volume: 1200,
              opportunity: 8
            },
            {
              query: `${keyword} tutorial`,
              volume: 800,
              opportunity: 6
            }
          ]
        },
        {
          id: 'comp-2',
          name: 'Competitor B',
          domain: 'competitorb.com',
          marketShare: 18,
          trafficShare: 22,
          keywordOverlap: 45,
          contentGap: 25,
          backlinkStrength: 65,
          socialPresence: 85,
          aiMentions: 30,
          strengths: [
            'Strong social media presence',
            'Innovative features',
            'Active community'
          ],
          weaknesses: [
            'Limited SEO focus',
            'Weak backlink profile',
            'Inconsistent content'
          ],
          opportunities: [
            'SEO optimization',
            'Content strategy',
            'Backlink building'
          ],
          threats: [
            'Algorithm changes',
            'Competition intensification',
            'Resource constraints'
          ],
          recentContent: [
            {
              title: `${keyword} Trends for 2024`,
              url: 'https://competitorb.com/trends',
              publishedAt: '2024-01-12',
              engagement: 68
            }
          ],
          aiQueries: [
            {
              query: `${keyword} examples`,
              volume: 600,
              opportunity: 7
            }
          ]
        }
      ],
      marketOverview: {
        totalMarketSize: 1000000,
        marketGrowth: 15,
        topPlayers: ['Competitor A', 'Competitor B', 'Your Brand'],
        emergingTrends: [
          'AI-powered content generation',
          'Voice search optimization',
          'Video-first content strategy'
        ]
      },
      aiOpportunities: {
        untappedQueries: 45,
        lowCompetitionKeywords: 23,
        contentGaps: 12,
        mentionOpportunities: 18
      },
      recommendations: {
        immediate: [
          'Create content for high-opportunity AI queries',
          'Optimize existing content for voice search',
          'Build backlinks from industry publications'
        ],
        shortTerm: [
          'Develop video content strategy',
          'Implement AI-powered features',
          'Expand social media presence'
        ],
        longTerm: [
          'Establish thought leadership position',
          'Build comprehensive content ecosystem',
          'Develop strategic partnerships'
        ]
      }
    }

    return NextResponse.json(competitiveAnalysis)
  } catch (error) {
    console.error('Competitive analysis API error:', error)
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
    const demoAnalysis = {
      keyword,
      competitors: [
        {
          id: 'demo-comp-1',
          name: 'Demo Competitor',
          domain: 'democompetitor.com',
          marketShare: 20,
          trafficShare: 25,
          keywordOverlap: 50,
          contentGap: 20,
          backlinkStrength: 70,
          socialPresence: 60,
          aiMentions: 25,
          strengths: ['Strong brand', 'Good content'],
          weaknesses: ['Limited AI', 'Slow updates'],
          opportunities: ['AI features', 'Mobile optimization'],
          threats: ['New entrants', 'Algorithm changes'],
          recentContent: [],
          aiQueries: []
        }
      ],
      marketOverview: {
        totalMarketSize: 500000,
        marketGrowth: 10,
        topPlayers: ['Demo Competitor', 'Your Brand'],
        emergingTrends: ['AI integration', 'Mobile-first']
      },
      aiOpportunities: {
        untappedQueries: 20,
        lowCompetitionKeywords: 10,
        contentGaps: 5,
        mentionOpportunities: 8
      },
      recommendations: {
        immediate: ['Focus on AI queries', 'Improve mobile experience'],
        shortTerm: ['Build content library', 'Enhance SEO'],
        longTerm: ['Establish authority', 'Expand features']
      }
    }

    return NextResponse.json(demoAnalysis)
  } catch (error) {
    console.error('Competitive analysis API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

