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

// Security: Validate PDF URL format and ensure it's a PDF
function isValidPdfUrl(url) {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    
    // Must be HTTPS
    if (urlObj.protocol !== 'https:') return false
    
    // Check if it ends with .pdf or has pdf in query params
    if (pathname.endsWith('.pdf')) return true
    
    // For imagekit CDN URLs, allow them as long as they're HTTPS
    if (urlObj.hostname.includes('imagekit.io')) return true
    
    return false
  } catch (error) {
    return false
  }
}

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (req.method === 'GET') {
      // Get all investment theses (public endpoint)
      const theses = await prisma.investmentThesis.findMany({
        include: {
          author: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(theses)
    }

    // For POST, PUT, DELETE - verify admin access
    const adminUser = await verifyAdminToken(authHeader)
    if (!adminUser) {
      return res.status(401).json({ error: 'Unauthorized - Admin access required' })
    }

    if (req.method === 'POST') {
      const { title, pdfUrl } = req.body

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a string' })
      }

      if (!pdfUrl || typeof pdfUrl !== 'string') {
        return res.status(400).json({ error: 'PDF URL is required' })
      }

      // Security: Validate PDF URL format
      if (!isValidPdfUrl(pdfUrl)) {
        return res.status(400).json({ error: 'Invalid PDF URL. Must be HTTPS and end with .pdf or be from imagekit.io' })
      }

      // Additional check: ensure URL doesn't contain suspicious patterns
      if (pdfUrl.includes('javascript:') || pdfUrl.includes('data:') || pdfUrl.includes('blob:')) {
        return res.status(400).json({ error: 'Invalid URL format' })
      }

      const thesis = await prisma.investmentThesis.create({
        data: {
          title: title.trim(),
          pdfUrl: pdfUrl.trim(),
          authorId: adminUser.id
        },
        include: {
          author: {
            select: {
              username: true,
              email: true
            }
          }
        }
      })

      return res.status(201).json(thesis)
    }

    if (req.method === 'PUT') {
      const { id, title, pdfUrl } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID is required' })
      }

      // Check if thesis exists
      const existing = await prisma.investmentThesis.findUnique({
        where: { id }
      })

      if (!existing) {
        return res.status(404).json({ error: 'Investment thesis not found' })
      }

      // Validate title if provided
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({ error: 'Title must be a non-empty string' })
        }
      }

      // Validate PDF URL if provided
      if (pdfUrl !== undefined) {
        if (typeof pdfUrl !== 'string' || !isValidPdfUrl(pdfUrl)) {
          return res.status(400).json({ error: 'Invalid PDF URL. Must be HTTPS and end with .pdf' })
        }

        if (pdfUrl.includes('javascript:') || pdfUrl.includes('data:') || pdfUrl.includes('blob:')) {
          return res.status(400).json({ error: 'Invalid URL format' })
        }
      }

      const thesis = await prisma.investmentThesis.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(pdfUrl !== undefined && { pdfUrl: pdfUrl.trim() })
        },
        include: {
          author: {
            select: {
              username: true,
              email: true
            }
          }
        }
      })

      return res.status(200).json(thesis)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID is required' })
      }

      const thesis = await prisma.investmentThesis.findUnique({
        where: { id }
      })

      if (!thesis) {
        return res.status(404).json({ error: 'Investment thesis not found' })
      }

      await prisma.investmentThesis.delete({
        where: { id }
      })

      return res.status(200).json({ message: 'Investment thesis deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
