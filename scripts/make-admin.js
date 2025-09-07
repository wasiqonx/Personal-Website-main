const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeAdmin() {
  const identifier = process.argv[2] // email or username

  if (!identifier) {
    console.log('❌ Usage: node scripts/make-admin.js <email_or_username>')
    console.log('📝 Example: node scripts/make-admin.js user@example.com')
    console.log('📝 Example: node scripts/make-admin.js john_doe')
    process.exit(1)
  }

  try {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    })

    if (!user) {
      console.log('❌ User not found with email/username:', identifier)
      
      // List all users to help
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          username: true,
          isAdmin: true
        }
      })
      
      console.log('\n👥 Available users:')
      allUsers.forEach(u => {
        console.log(`   📧 ${u.email} | 👤 ${u.username} | ${u.isAdmin ? '👑 Admin' : '👤 User'}`)
      })
      
      process.exit(1)
    }

    if (user.isAdmin) {
      console.log('ℹ️  User is already an admin:')
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   👤 Username: ${user.username}`)
      console.log(`   🔑 Admin: ${user.isAdmin}`)
      return
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        updatedAt: true
      }
    })

    console.log('🎉 User promoted to admin successfully!')
    console.log('👑 Admin Details:')
    console.log(`   📧 Email: ${updatedUser.email}`)
    console.log(`   👤 Username: ${updatedUser.username}`)
    console.log(`   🔑 Admin: ${updatedUser.isAdmin}`)
    console.log(`   📅 Updated: ${updatedUser.updatedAt}`)
    console.log('')
    console.log('✅ User can now access admin dashboard at /admin')

  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()