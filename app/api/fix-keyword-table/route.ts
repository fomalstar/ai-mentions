import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Fixing keyword_tracking table for user:', session.user.email)

    try {
      // Check current columns in keyword_tracking table
      console.log('📋 Checking current keyword_tracking columns...')
      const currentColumns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking'
        ORDER BY ordinal_position
      `
      console.log('✅ Current columns:', currentColumns)

      // Check if userId column exists
      const userIdExists = currentColumns.some((col: any) => col.column_name === 'userId')
      
      if (!userIdExists) {
        console.log('🔧 Adding missing userId column...')
        
        // Add the missing userId column
        await prisma.$executeRaw`
          ALTER TABLE keyword_tracking 
          ADD COLUMN "userId" TEXT NOT NULL DEFAULT ''
        `
        console.log('✅ userId column added')

        // Add foreign key constraint
        await prisma.$executeRaw`
          ALTER TABLE keyword_tracking 
          ADD CONSTRAINT keyword_tracking_userId_fkey 
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        `
        console.log('✅ Foreign key constraint added')

      } else {
        console.log('✅ userId column already exists')
      }

      // Check if other missing columns exist and add them
      const expectedColumns = ['id', 'userId', 'brandTrackingId', 'keyword', 'topic', 'isActive', 'createdAt', 'updatedAt']
      
      for (const expectedCol of expectedColumns) {
        const exists = currentColumns.some((col: any) => col.column_name === expectedCol)
        
        if (!exists) {
          console.log(`🔧 Adding missing ${expectedCol} column...`)
          
          let columnDef = ''
          switch (expectedCol) {
            case 'brandTrackingId':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "brandTrackingId" TEXT NOT NULL DEFAULT \'\''
              break
            case 'keyword':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "keyword" TEXT NOT NULL DEFAULT \'\''
              break
            case 'topic':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "topic" TEXT NOT NULL DEFAULT \'\''
              break
            case 'isActive':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true'
              break
            case 'createdAt':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
              break
            case 'updatedAt':
              columnDef = 'ALTER TABLE keyword_tracking ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
              break
          }
          
          if (columnDef) {
            await prisma.$executeRaw(columnDef as any)
            console.log(`✅ ${expectedCol} column added`)
          }
        }
      }

      // Verify final structure
      const finalColumns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking'
        ORDER BY ordinal_position
      `
      
      console.log('✅ Final keyword_tracking structure:', finalColumns)

      return NextResponse.json({
        success: true,
        message: 'keyword_tracking table fixed successfully',
        columns: finalColumns,
        timestamp: new Date().toISOString()
      })

    } catch (fixError) {
      console.error('❌ Failed to fix keyword_tracking table:', fixError)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fix keyword_tracking table',
        details: fixError instanceof Error ? fixError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Fix keyword table API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fix keyword table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
