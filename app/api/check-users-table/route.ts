import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking users table structure...')
    
    // Check if users table exists
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `
      console.log('📋 Tables found:', tables)
      
      if (!tables || tables.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Users table does not exist',
          suggestion: 'Run database setup or migrations'
        })
      }
    } catch (tableError) {
      console.error('❌ Table check failed:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check tables',
        details: tableError instanceof Error ? tableError.message : 'Unknown error'
      })
    }
    
    // Check users table structure
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `
      console.log('📋 Users table columns:', columns)
      
      return NextResponse.json({
        success: true,
        message: 'Users table structure retrieved',
        columns: columns
      })
      
    } catch (columnError) {
      console.error('❌ Column check failed:', columnError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check columns',
        details: columnError instanceof Error ? columnError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('❌ Check users table error:', error)
    return NextResponse.json({ 
      error: 'Failed to check users table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
