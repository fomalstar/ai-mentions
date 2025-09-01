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

    // Check what tables actually exist in the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `

    // Check if there are any scan-related tables
    const scanTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%scan%'
      ORDER BY table_name;
    `

    // Try to test each table
    const tableTests = {}
    const tableNames = ['scan_result', 'scan_results', 'scan_queue', 'brand_tracking', 'keyword_tracking', 'users']
    
    for (const tableName of tableNames) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}";`)
        tableTests[tableName] = { exists: true, count: result[0]?.count || 0 }
      } catch (error) {
        tableTests[tableName] = { exists: false, error: error.message }
      }
    }

    return NextResponse.json({
      success: true,
      allTables: tables,
      scanTables: scanTables,
      tableTests: tableTests,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
