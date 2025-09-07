import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, hcaptchaToken } = req.body

  if (!email || !password || !hcaptchaToken) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Verify hCaptcha token
  const hcaptchaResponse = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.HCAPTCHA_SECRET_KEY}&response=${hcaptchaToken}`,
  })

  const hcaptchaData = await hcaptchaResponse.json()

  if (!hcaptchaData.success) {
    return res.status(400).json({ error: 'Invalid captcha' })
  }

  try {
    // Find user by email (include jwtSecret for token signing)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isAdmin: true,
        jwtSecret: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create JWT token using user's individual secret
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      },
      user.jwtSecret,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Login failed' })
  }
}