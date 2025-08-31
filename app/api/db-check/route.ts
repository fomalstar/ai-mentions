import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Database check route called')
    
    const results: any = {
      connection: false,
      tables: {},
      errors: []
    }
    
    // Test 1: Basic connection
    try {
      await prisma.$queryRaw`SELECT 1`
      results.connection = true
      console.log('✅ Database connection works')
    } catch (error) {
      results.connection = false
      results.errors.push(`Connection failed: ${error instanceof Error ? error.message : 'Unknown'}`)
      console.error('❌ Database connection failed:', error)
    }
    
    // Test 2: Check each table
    const tablesToCheck = [
      'User',
      'BrandTracking', 
      'KeywordTracking',
      'ScanResult',
      'ScanQueue'
    ]
    
    for (const tableName of tablesToCheck) {
      try {
        // Try to query each table
        let count = 0
        if (tableName === 'User') {
          count = await prisma.user.count()
        } else if (tableName === 'BrandTracking') {
          count = await prisma.brandTracking.count()
        } else if (tableName === 'KeywordTracking') {
          count = await prisma.keywordTracking.count()
        } else if (tableName === 'ScanResult') {
          count = await prisma.scanResult.count()
        } else if (tableName === 'ScanQueue') {
          count = await prisma.scanQueue.count()
        }
        
        results.tables[tableName] = {
          exists: true,
          count: count
        }
        console.log(`✅ Table ${tableName} exists with ${count} records`)
        
      } catch (error) {
        results.tables[tableName] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        results.errors.push(`Table ${tableName} failed: ${error instanceof Error ? error.message : 'Unknown'}`)
        console.error(`❌ Table ${tableName} check failed:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database check completed',
      timestamp: new Date().toISOString(),
      results
    })
    
  } catch (error) {
    console.error('❌ Database check route error:', error)
    return NextResponse.json({ 
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
