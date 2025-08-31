import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Fixing database constraints for user:', session.user.email)

    try {
      // Fix brand_tracking table constraints
      console.log('🔧 Adding unique constraint to brand_tracking...')
      await prisma.$executeRaw`
        ALTER TABLE brand_tracking 
        ADD CONSTRAINT brand_tracking_userid_brandname_unique 
        UNIQUE ("userId", "brandName")
      `
      console.log('✅ brand_tracking unique constraint added')

      // Fix keyword_tracking table constraints
      console.log('🔧 Adding unique constraint to keyword_tracking...')
      await prisma.$executeRaw`
        ALTER TABLE keyword_tracking 
        ADD CONSTRAINT keyword_tracking_brandtrackingid_keyword_unique 
        UNIQUE ("brandTrackingId", "keyword")
      `
      console.log('✅ keyword_tracking unique constraint added')

      // Check if constraints were added successfully
      const constraints = await prisma.$queryRaw`
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name IN ('brand_tracking', 'keyword_tracking')
      `
      
      console.log('✅ Constraints added successfully:', constraints)

      return NextResponse.json({
        success: true,
        message: 'Database constraints fixed successfully',
        constraints: constraints,
        timestamp: new Date().toISOString()
      })

    } catch (constraintError) {
      console.error('❌ Failed to add constraints:', constraintError)
      
      // Check if constraints already exist
      try {
        const existingConstraints = await prisma.$queryRaw`
          SELECT constraint_name, table_name 
          FROM information_schema.table_constraints 
          WHERE constraint_type = 'UNIQUE' 
          AND table_name IN ('brand_tracking', 'keyword_tracking')
        `
        
        if (existingConstraints && Array.isArray(existingConstraints) && existingConstraints.length > 0) {
          console.log('✅ Constraints already exist:', existingConstraints)
          return NextResponse.json({
            success: true,
            message: 'Constraints already exist',
            constraints: existingConstraints,
            timestamp: new Date().toISOString()
          })
        }
      } catch (checkError) {
        console.error('❌ Failed to check existing constraints:', checkError)
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fix constraints',
        details: constraintError instanceof Error ? constraintError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Fix constraints API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fix constraints',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
