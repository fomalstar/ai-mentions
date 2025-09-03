const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addAutomationFields() {
  try {
    console.log('🔧 Adding automation fields to database...')
    
    // Add automation fields to BrandTracking table
    console.log('📝 Adding automation fields to BrandTracking...')
    await prisma.$executeRaw`
      ALTER TABLE brand_tracking 
      ADD COLUMN IF NOT EXISTS "autoScanEnabled" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "autoScanStartedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "autoScanLastRun" TIMESTAMP
    `
    console.log('✅ BrandTracking automation fields added')
    
    // Add automation fields to KeywordTracking table
    console.log('📝 Adding automation fields to KeywordTracking...')
    await prisma.$executeRaw`
      ALTER TABLE keyword_tracking 
      ADD COLUMN IF NOT EXISTS "autoScanEnabled" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "autoScanStartedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "autoScanLastRun" TIMESTAMP
    `
    console.log('✅ KeywordTracking automation fields added')
    
    // Check if nextScanAt column exists in BrandTracking
    console.log('🔍 Checking for nextScanAt column...')
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'brand_tracking' 
      AND column_name = 'nextScanAt'
    `
    
    if (columns.length === 0) {
      console.log('📝 Adding nextScanAt column to BrandTracking...')
      await prisma.$executeRaw`
        ALTER TABLE brand_tracking 
        ADD COLUMN "nextScanAt" TIMESTAMP
      `
      console.log('✅ nextScanAt column added')
    } else {
      console.log('ℹ️ nextScanAt column already exists')
    }
    
    console.log('🎉 All automation fields added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding automation fields:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addAutomationFields()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
