const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function migrateJwtSecrets() {
  try {
    console.log('🔄 Checking for users without JWT secrets...')
    
    // Find users with null or empty JWT secrets
    const usersWithoutSecrets = await prisma.user.findMany({
      where: {
        OR: [
          { jwtSecret: null },
          { jwtSecret: '' }
        ]
      },
      select: { id: true, email: true, username: true }
    })

    if (usersWithoutSecrets.length === 0) {
      console.log('✅ All users already have JWT secrets')
      return
    }

    console.log(`📝 Found ${usersWithoutSecrets.length} users needing JWT secrets`)

    // Update each user with a new JWT secret
    for (const user of usersWithoutSecrets) {
      const jwtSecret = crypto.randomBytes(64).toString('hex')
      
      await prisma.user.update({
        where: { id: user.id },
        data: { jwtSecret }
      })

      console.log(`✅ Generated JWT secret for user: ${user.username} (${user.email})`)
    }

    console.log(`🎉 Successfully migrated ${usersWithoutSecrets.length} users`)
  } catch (error) {
    console.error('❌ Error migrating JWT secrets:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateJwtSecrets()