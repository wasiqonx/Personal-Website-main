import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, username, password } = req.body

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Email, username, and password are required' })
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
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate individual JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex')

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        jwtSecret,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    return res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Failed to create user' })
  }
}