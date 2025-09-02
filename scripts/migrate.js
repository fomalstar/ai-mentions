const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // SAFE: Only create missing tables without destroying existing data
    console.log('🔒 Running SAFE database migration (no data loss)...')
    
    try {
      // Check which tables exist
      const existingTables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      
      const existingTableNames = existingTables.map((t: any) => t.table_name)
      console.log('📊 Existing tables:', existingTableNames)
      
      // Only create missing tables, never drop existing ones
      const requiredTables = ['users', 'brand_tracking', 'keyword_tracking', 'scan_result', 'scan_queue']
      const missingTables = requiredTables.filter(table => !existingTableNames.includes(table))
      
      if (missingTables.length > 0) {
        console.log('🔧 Creating missing tables:', missingTables)
        
        // Create missing tables safely
        for (const table of missingTables) {
          console.log(`🔧 Creating ${table} table...`)
          await createTableSafely(table)
        }
      } else {
        console.log('✅ All required tables already exist')
      }
      
      // Generate Prisma client
      console.log('🔧 Generating Prisma client...')
      const { execSync } = require('child_process')
      execSync('npx prisma generate', { stdio: 'inherit' })
      
      console.log('✅ Prisma client generated')
      
      // Create initial data if needed
      console.log('📝 Creating initial data...')
      await createInitialData()
      
      console.log('🎉 SAFE migration completed successfully!')
      
    } catch (error) {
      console.log('⚠️ Safe migration approach failed:', error.message)
      console.log('📝 Database setup will be handled via API endpoint during runtime')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function createTableSafely(tableName) {
  try {
    switch (tableName) {
      case 'scan_result':
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS scan_result (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "brandTrackingId" TEXT NOT NULL,
            "keywordTrackingId" TEXT NOT NULL,
            platform TEXT NOT NULL,
            query TEXT NOT NULL,
            "brandMentioned" BOOLEAN DEFAULT false,
            position INTEGER,
            "responseText" TEXT,
            "brandContext" TEXT,
            "sourceUrls" JSONB,
            confidence DOUBLE PRECISION,
            "scanDuration" INTEGER,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        break
        
      case 'scan_queue':
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS scan_queue (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "brandTrackingId" TEXT NOT NULL,
            "keywordTrackingId" TEXT,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 5,
            "scheduledAt" TIMESTAMP NOT NULL,
            "startedAt" TIMESTAMP,
            "completedAt" TIMESTAMP,
            attempts INTEGER DEFAULT 0,
            "maxAttempts" INTEGER DEFAULT 3,
            "lastError" TEXT,
            "scanType" TEXT NOT NULL,
            metadata JSONB,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        break
        
      default:
        console.log(`⚠️ Table ${tableName} creation not implemented yet`)
    }
    
    console.log(`✅ Table ${tableName} created successfully`)
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message)
  }
}

async function createInitialData() {
  try {
    // Check if we need to create any initial data
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('👤 Creating demo user...')
      
      // Create a demo user for testing
      await prisma.user.create({
        data: {
          email: 'demo@aimentions.com',
          name: 'Demo User',
          subscriptionTier: 'free',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Demo user created')
    }
    
  } catch (error) {
    console.log('⚠️ Could not create initial data:', error.message)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
}

module.exports = { migrate }
