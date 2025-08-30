const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Create a test user if needed
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        subscriptionTier: 'free',
        tokensRemaining: 100,
        tokensUsed: 0,
      },
    })
    
    console.log('✅ Test user created:', testUser.email)
    console.log('✅ Database setup complete!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('\nTo fix this:')
    console.log('1. Make sure PostgreSQL is running')
    console.log('2. Check your DATABASE_URL in .env.local')
    console.log('3. Run: npx prisma db push')
  } finally {
    await prisma.$disconnect()
  }
}

main()
