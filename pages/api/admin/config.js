import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify JWT and check admin status
async function verifyAdminToken(token) {
  try {
    if (!token) return null

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '')
    const decoded = jwt.decode(cleanToken)
    
    if (!decoded || !decoded.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    return user?.isAdmin ? user : null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get site config (public endpoint)
      let config = await prisma.siteConfig.findFirst()

      // Create default config if it doesn't exist
      if (!config) {
        config = await prisma.siteConfig.create({
          data: {
            investmentThesesLabel: 'Investment Theses'
          }
        })
      }

      return res.status(200).json(config)
    }

    if (req.method === 'PUT') {
      const authHeader = req.headers.authorization
      
      // Verify admin access
      const adminUser = await verifyAdminToken(authHeader)
      if (!adminUser) {
        return res.status(401).json({ error: 'Unauthorized - Admin access required' })
      }

      const { investmentThesesLabel } = req.body

      // Validation
      if (!investmentThesesLabel || typeof investmentThesesLabel !== 'string') {
        return res.status(400).json({ error: 'investmentThesesLabel must be a string' })
      }

      if (investmentThesesLabel.trim().length === 0 || investmentThesesLabel.trim().length > 100) {
        return res.status(400).json({ error: 'Label must be between 1 and 100 characters' })
      }

      // Get or create config
      let config = await prisma.siteConfig.findFirst()

      if (!config) {
        config = await prisma.siteConfig.create({
          data: {
            investmentThesesLabel: investmentThesesLabel.trim()
          }
        })
      } else {
        config = await prisma.siteConfig.update({
          where: { id: config.id },
          data: {
            investmentThesesLabel: investmentThesesLabel.trim()
          }
        })
      }

      return res.status(200).json(config)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
