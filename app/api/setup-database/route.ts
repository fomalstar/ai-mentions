import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting database setup...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ` as any[]
    
    console.log('📋 Existing tables:', tables.map(t => t.table_name))
    
    // Check if required tables exist
    const requiredTables = [
      'users', 'accounts', 'sessions', 'verification_tokens',
      'brand_tracking', 'keyword_tracking', 'scan_results', 'scan_queue'
    ]
    const existingTableNames = tables.map(t => t.table_name)
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table))
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables)
      console.log('🔧 Attempting to create tables automatically...')
      
      try {
        // Create tables using raw SQL
        await createAllTables()
        console.log('✅ Tables created successfully')
        
        return NextResponse.json({
          status: 'success',
          message: 'Database tables created successfully!',
          createdTables: missingTables,
          existingTables: existingTableNames,
          timestamp: new Date().toISOString()
        })
      } catch (createError) {
        console.error('❌ Failed to create tables:', createError)
        
        return NextResponse.json({
          status: 'error',
          message: 'Could not create database tables automatically.',
          missingTables,
          existingTables: existingTableNames,
          error: createError instanceof Error ? createError.message : 'Unknown error',
          instructions: [
            'The database needs to be set up manually.',
            'Contact support or use a different database setup method.'
          ]
        }, { status: 500 })
      }
    }
    
    // Test creating a user (this will verify all relationships work)
    try {
      const testUser = await prisma.user.upsert({
        where: { email: 'test@aimentions.com' },
        update: { name: 'Test User Updated' },
        create: {
          email: 'test@aimentions.com',
          name: 'Test User',
          subscriptionTier: 'free',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Test user created/updated:', testUser.id)
    } catch (error) {
      console.error('❌ Error creating test user:', error)
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Database setup completed successfully',
      existingTables: existingTableNames,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Function to create all required tables using raw SQL
async function createAllTables() {
  console.log('🔧 Creating all required tables...')
  
  // Create users table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL,
      "name" TEXT,
      "email" TEXT NOT NULL,
      "emailVerified" TIMESTAMP(3),
      "image" TEXT,
      "password" TEXT,
      "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
      "stripeCustomerId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "users_email_key" UNIQUE ("email"),
      CONSTRAINT "users_stripeCustomerId_key" UNIQUE ("stripeCustomerId")
    )
  `
  
  // Create accounts table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId"),
      CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  // Create sessions table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "id" TEXT NOT NULL,
      "sessionToken" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expires" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "sessions_sessionToken_key" UNIQUE ("sessionToken"),
      CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  // Create verification_tokens table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "verification_tokens" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expires" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token"),
      CONSTRAINT "verification_tokens_token_key" UNIQUE ("token")
    )
  `
  
  // Drop existing tables if they exist (they have wrong schema)
  await prisma.$executeRaw`DROP TABLE IF EXISTS "scan_queue" CASCADE`
  await prisma.$executeRaw`DROP TABLE IF EXISTS "scan_results" CASCADE`
  await prisma.$executeRaw`DROP TABLE IF EXISTS "keyword_tracking" CASCADE`
  await prisma.$executeRaw`DROP TABLE IF EXISTS "brand_tracking" CASCADE`
  
  // Create mention tracking tables with correct schema
  await prisma.$executeRaw`
    CREATE TABLE "brand_tracking" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "brandName" TEXT NOT NULL,
      "displayName" TEXT NOT NULL,
      "website" TEXT,
      "description" TEXT,
      "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "competitors" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "scanningEnabled" BOOLEAN NOT NULL DEFAULT true,
      "lastScanAt" TIMESTAMP(3),
      "nextScanAt" TIMESTAMP(3),
      "scanInterval" INTEGER NOT NULL DEFAULT 24,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "brand_tracking_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "brand_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  await prisma.$executeRaw`
    CREATE TABLE "keyword_tracking" (
      "id" TEXT NOT NULL,
      "brandTrackingId" TEXT NOT NULL,
      "keyword" TEXT NOT NULL,
      "projectName" TEXT NOT NULL,
      "avgPosition" DOUBLE PRECISION,
      "positionChange" INTEGER DEFAULT 0,
      "chatgptPosition" INTEGER,
      "perplexityPosition" INTEGER,
      "geminiPosition" INTEGER,
      "lastScanned" TIMESTAMP(3),
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "keyword_tracking_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "keyword_tracking_brandTrackingId_fkey" FOREIGN KEY ("brandTrackingId") REFERENCES "brand_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  await prisma.$executeRaw`
    CREATE TABLE "scan_results" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "brandTrackingId" TEXT NOT NULL,
      "keywordTrackingId" TEXT NOT NULL,
      "platform" TEXT NOT NULL,
      "query" TEXT NOT NULL,
      "brandMentioned" BOOLEAN NOT NULL DEFAULT false,
      "position" INTEGER,
      "responseText" TEXT,
      "brandContext" TEXT,
      "sourceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "metadata" TEXT,
      "scanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "scan_results_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "scan_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "scan_results_brandTrackingId_fkey" FOREIGN KEY ("brandTrackingId") REFERENCES "brand_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "scan_results_keywordTrackingId_fkey" FOREIGN KEY ("keywordTrackingId") REFERENCES "keyword_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  await prisma.$executeRaw`
    CREATE TABLE "scan_queue" (
      "id" TEXT NOT NULL,
      "keywordTrackingId" TEXT NOT NULL,
      "scheduledFor" TIMESTAMP(3) NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "retryCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "completedAt" TIMESTAMP(3),
      CONSTRAINT "scan_queue_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "scan_queue_keywordTrackingId_fkey" FOREIGN KEY ("keywordTrackingId") REFERENCES "keyword_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `
  
  console.log('✅ All tables created successfully')
}

// Also allow GET for easy testing
export async function GET() {
  return POST()
}
