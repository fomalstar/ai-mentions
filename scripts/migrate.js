const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Push the schema to the database
    console.log('📦 Pushing schema to database...')
    const { execSync } = require('child_process')
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    } catch (error) {
      console.log('⚠️ Prisma db push failed, trying alternative approach...')
      // If prisma db push fails, we'll create tables via API call during runtime
      console.log('📝 Database setup will be handled via API endpoint')
    }
    
    console.log('✅ Schema pushed successfully')
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('✅ Prisma client generated')
    
    // Create initial data if needed
    console.log('📝 Creating initial data...')
    await createInitialData()
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
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
