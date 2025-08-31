import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking keyword_tracking table structure...')
    
    // Check if table exists
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'keyword_tracking'
      `
      console.log('📋 Tables found:', tables)
      
      if (!tables || tables.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'keyword_tracking table does not exist'
        })
      }
    } catch (tableError) {
      console.error('❌ Table check failed:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check tables'
      })
    }
    
    // Check table structure
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'keyword_tracking' 
        ORDER BY ordinal_position
      `
      console.log('📋 keyword_tracking columns:', columns)
      
      return NextResponse.json({
        success: true,
        message: 'keyword_tracking table structure retrieved',
        columns: columns
      })
      
    } catch (columnError) {
      console.error('❌ Column check failed:', columnError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check columns'
      })
    }
    
  } catch (error) {
    console.error('❌ Check keyword table error:', error)
    return NextResponse.json({ 
      error: 'Failed to check keyword table'
    }, { status: 500 })
  }
}
