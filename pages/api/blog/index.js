import prisma from '../../../lib/db'
import { requireAuth } from '../../../lib/auth'

// Simple in-memory rate limiting
const rateLimit = new Map()

function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, [])
  }

  const requests = rateLimit.get(ip).filter(time => time > windowStart)
  requests.push(now)
  rateLimit.set(ip, requests)

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, times] of rateLimit.entries()) {
      const filtered = times.filter(time => time > windowStart)
      if (filtered.length === 0) {
        rateLimit.delete(key)
      } else {
        rateLimit.set(key, filtered)
      }
    }
  }

  return requests.length <= maxRequests
}

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get posts with authors and media in a single query using include
      const posts = await prisma.post.findMany({
        where: { published: true },
        include: {
          User: {
            select: { username: true, id: true }
          },
          MediaFile: {
            orderBy: { position: 'asc' }
          },
          Tag: {
            select: { id: true, name: true }
          }
        },
        orderBy: { publishedAt: 'desc' }
      })


      // Format the response
      const postsWithDetails = posts.map(post => ({
        ...post,
        author: post.User, // Map User to author for backward compatibility
        media: post.MediaFile || [], // Include media files
        tags: post.Tag || []
      }))

      return res.status(200).json(postsWithDetails)
    } catch (error) {
      console.error('Blog API Error:', error)
      return res.status(500).json({ error: 'Failed to fetch posts' })
    }
  } else if (req.method === 'POST') {
    // Rate limiting for POST requests
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    if (!checkRateLimit(clientIP, 5, 60000)) { // 5 requests per minute
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    try {
      const { title, content, excerpt, published, tags, media } = req.body
      const authorId = req.user.userId // Get from authenticated user

      // Input validation and sanitization
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Valid title is required' })
      }
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Valid content is required' })
      }

      // Sanitize inputs
      const sanitizedTitle = title.trim().substring(0, 200) // Limit title length
      const sanitizedContent = content.trim().substring(0, 100000) // Limit content length
      const sanitizedExcerpt = excerpt && typeof excerpt === 'string' ? excerpt.trim().substring(0, 500) : null

      // Validate tags
      let sanitizedTags = []
      if (tags && Array.isArray(tags)) {
        sanitizedTags = tags
          .filter(tag => typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 50)
          .map(tag => tag.trim().toLowerCase())
          .slice(0, 10) // Max 10 tags
      }

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars except spaces
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        || 'untitled-post' // Fallback if slug is empty
      
      const post = await prisma.post.create({
        data: {
          title: sanitizedTitle,
          slug,
          content: sanitizedContent,
          excerpt: sanitizedExcerpt,
          published,
          publishedAt: published ? new Date() : null,
          authorId,
          Tag: sanitizedTags.length > 0 ? {
            connectOrCreate: sanitizedTags.map(tag => ({
              where: { name: tag },
              create: { name: tag }
            }))
          } : undefined,
          MediaFile: media && media.length > 0 ? {
            create: media.map(file => ({
              filename: file.filename,
              originalName: file.originalName,
              mimetype: file.mimetype,
              size: file.size,
              url: file.url,
              type: file.type,
              position: file.position
            }))
          } : undefined
        },
        include: {
          User: {
            select: { username: true, id: true }
          },
          Tag: {
            select: { id: true, name: true }
          },
          MediaFile: {
            orderBy: { position: 'asc' }
          }
        }
      })

      return res.status(201).json(post)
    } catch (error) {
      console.error('Error creating post:', error)
      return res.status(500).json({ error: 'Failed to create post' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

export default function blogHandler(req, res) {
  if (req.method === 'POST') {
    // Require authentication for POST requests
    return requireAuth(handler)(req, res)
  } else {
    // Allow GET requests without authentication
    return handler(req, res)
  }
}