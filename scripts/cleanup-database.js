#!/usr/bin/env node

/**
 * Database Cleanup Script for Render
 * 
 * This script can be run on Render to clean up corrupted data.
 * Run with: node scripts/cleanup-database.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...')
  
  try {
    // 1. Find all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    })
    
    console.log(`Found ${users.length} users`)
    
    for (const user of users) {
      console.log(`\n🔍 Processing user: ${user.email}`)
      
      // 2. Clean corrupted keywords from keyword tracking
      const corruptedKeywords = await prisma.keywordTracking.findMany({
        where: {
          userId: user.id,
          OR: [
            { keyword: { contains: 'erg' } },
            { topic: { contains: 'erg' } },
            { keyword: { contains: 'tewgw' } },
            { keyword: { contains: 'gerg' } },
            { keyword: { contains: 'google' } },
            { keyword: { contains: 'new schedule' } },
            { topic: { contains: 'erge' } },
            { topic: { contains: 'gre' } },
            { topic: { contains: 'ewgerg' } },
            { topic: { contains: 'ergerg' } }
          ]
        }
      })
      
      if (corruptedKeywords.length > 0) {
        console.log(`  Found ${corruptedKeywords.length} corrupted keywords:`)
        corruptedKeywords.forEach(k => {
          console.log(`    - ${k.keyword} (topic: ${k.topic})`)
        })
        
        // Delete corrupted keywords
        const deleteResult = await prisma.keywordTracking.deleteMany({
          where: {
            userId: user.id,
            OR: [
              { keyword: { contains: 'erg' } },
              { topic: { contains: 'erg' } },
              { keyword: { contains: 'tewgw' } },
              { keyword: { contains: 'gerg' } },
              { keyword: { contains: 'google' } },
              { keyword: { contains: 'new schedule' } },
              { topic: { contains: 'erge' } },
              { topic: { contains: 'gre' } },
              { topic: { contains: 'ewgerg' } },
              { topic: { contains: 'ergerg' } }
            ]
          }
        })
        
        console.log(`  ✅ Deleted ${deleteResult.count} corrupted keywords`)
        
        // Clean related scan results
        const scanResultDelete = await prisma.scanResult.deleteMany({
          where: {
            userId: user.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
        
        console.log(`  ✅ Deleted ${scanResultDelete.count} related scan results`)
        
        // Clean scan queue items
        const scanQueueDelete = await prisma.scanQueue.deleteMany({
          where: {
            userId: user.id,
            keywordTrackingId: {
              in: corruptedKeywords.map(k => k.id)
            }
          }
        })
        
        console.log(`  ✅ Deleted ${scanQueueDelete.count} related scan queue items`)
      } else {
        console.log('  ✅ No corrupted keywords found')
      }
      
      // 3. Clean brand tracking keywords
      const brandTracking = await prisma.brandTracking.findMany({
        where: { userId: user.id }
      })
      
      for (const brand of brandTracking) {
        let needsUpdate = false
        let cleanKeywords = brand.keywords || []
        
        if (brand.keywords && Array.isArray(brand.keywords)) {
          const hasCorruptedKeywords = brand.keywords.some((k) => 
            k.includes('erg') || k.includes('tewgw') || k.includes('gerg') || 
            k.includes('google') || k.includes('new schedule') || k === 'ergerg'
          )
          
          if (hasCorruptedKeywords) {
            console.log(`  ⚠️ Found corrupted keywords in brand: ${brand.displayName}`)
            
            cleanKeywords = brand.keywords.filter((k) => 
              !k.includes('erg') && !k.includes('tewgw') && !k.includes('gerg') && 
              !k.includes('google') && !k.includes('new schedule') && k !== 'ergerg'
            )
            
            needsUpdate = true
          }
        }
        
        if (needsUpdate) {
          if (cleanKeywords.length === 0) {
            cleanKeywords.push('how to do seo')
          }
          
          await prisma.brandTracking.update({
            where: { id: brand.id },
            data: { keywords: cleanKeywords }
          })
          
          console.log(`  ✅ Cleaned brand tracking: ${brand.displayName}`)
        }
      }
      
      // 4. Create clean keyword if none exist
      const remainingKeywords = await prisma.keywordTracking.count({
        where: { userId: user.id }
      })
      
      if (remainingKeywords === 0) {
        const brandTracking = await prisma.brandTracking.findFirst({
          where: { userId: user.id }
        })
        
        if (brandTracking) {
          const newKeyword = await prisma.keywordTracking.create({
            data: {
              userId: user.id,
              brandTrackingId: brandTracking.id,
              keyword: 'how to do seo',
              topic: 'how to do seo',
              isActive: true
            }
          })
          
          console.log(`  ✅ Created clean default keyword: ${newKeyword.keyword}`)
        }
      }
    }
    
    console.log('\n🎉 Database cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDatabase()
