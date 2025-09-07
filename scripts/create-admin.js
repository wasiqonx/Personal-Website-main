const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.argv[2]
  const username = process.argv[3]
  const password = process.argv[4]

  if (!email || !username || !password) {
    console.log('❌ Usage: node scripts/create-admin.js <email> <username> <password>')
    console.log('📝 Example: node scripts/create-admin.js admin@example.com admin mySecurePassword123')
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      console.log('❌ User with this email or username already exists')
      
      // Ask if they want to make existing user admin
      console.log('🔄 Making existing user admin instead...')
      
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { isAdmin: true },
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true
        }
      })

      console.log('✅ User updated to admin:')
      console.log(`   📧 Email: ${updatedUser.email}`)
      console.log(`   👤 Username: ${updatedUser.username}`)
      console.log(`   🔑 Admin: ${updatedUser.isAdmin}`)
      return
    }

    // Hash password and generate JWT secret
    const hashedPassword = await bcrypt.hash(password, 12)
    const jwtSecret = crypto.randomBytes(64).toString('hex')

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        jwtSecret,
        isAdmin: true, // 👑 Admin flag set to true
      },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true
      }
    })

    console.log('🎉 Admin user created successfully!')
    console.log('👑 Admin Details:')
    console.log(`   📧 Email: ${adminUser.email}`)
    console.log(`   👤 Username: ${adminUser.username}`)
    console.log(`   🔑 Admin: ${adminUser.isAdmin}`)
    console.log(`   📅 Created: ${adminUser.createdAt}`)
    console.log('')
    console.log('🔐 Password Security:')
    console.log('   ✅ Password hashed with bcrypt (12 rounds)')
    console.log('   ✅ Individual JWT secret generated')
    console.log('   ✅ Ready to login and manage blog posts')

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()