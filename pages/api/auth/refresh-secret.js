import crypto from 'crypto'
import prisma from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = req.user.userId

  try {
    // Generate new JWT secret
    const newJwtSecret = crypto.randomBytes(64).toString('hex')

    // Update user's JWT secret in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { jwtSecret: newJwtSecret },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true
      }
    })

    // Note: This will invalidate all existing tokens for this user
    // Client should handle re-authentication after this endpoint is called

    return res.status(200).json({
      message: 'JWT secret regenerated successfully. Please login again.',
      user: updatedUser
    })
  } catch (error) {
    console.error('JWT secret regeneration error:', error)
    return res.status(500).json({ error: 'Failed to regenerate JWT secret' })
  }
}

export default requireAuth(handler)