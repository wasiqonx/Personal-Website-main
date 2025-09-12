import prisma from '../../../lib/db'
import { verifyToken, requireAuth } from '../../../lib/auth'

async function blogPostHandler(req, res) {
  const { slug } = req.query

  if (req.method === 'GET') {
    try {
      // Optimized single query with joins
      const post = await prisma.post.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          User: {
            select: {
              id: true,
              username: true
            }
          },
          Tag: {
            select: {
              id: true,
              name: true
            }
          },
          MediaFile: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimetype: true,
              size: true,
              url: true,
              type: true,
              position: true,
              createdAt: true
            },
            orderBy: {
              position: 'asc'
            }
          },
          Comment: {
            where: {
              approved: true
            },
            select: {
              id: true,
              content: true,
              author: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      return res.status(200).json(post)
    } catch (error) {
      console.error('Error fetching post:', error)
      return res.status(500).json({ error: 'Failed to fetch post' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, content, excerpt, published, tags, media } = req.body

      // Check if post exists and get current publishedAt status
      const existingPost = await prisma.post.findUnique({
        where: { slug },
        select: { publishedAt: true, id: true }
      })

      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const updatedPost = await prisma.post.update({
        where: { slug },
        data: {
          title,
          content,
          excerpt,
          published,
          publishedAt: published && !existingPost.publishedAt
            ? new Date()
            : undefined,
          Tag: tags ? {
            set: [],
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag }
            }))
          } : undefined,
          MediaFile: {
            deleteMany: {}, // Always delete existing media files first
            ...(media && media.length > 0 ? {
              create: media.map(file => ({
                filename: file.filename,
                originalName: file.originalName,
                mimetype: file.mimetype,
                size: file.size,
                url: file.url,
                type: file.type,
                position: file.position
              }))
            } : {})
          }
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          User: {
            select: {
              id: true,
              username: true
            }
          },
          Tag: {
            select: {
              id: true,
              name: true
            }
          },
          MediaFile: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimetype: true,
              size: true,
              url: true,
              type: true,
              position: true,
              createdAt: true
            },
            orderBy: {
              position: 'asc'
            }
          },
          Comment: {
            where: {
              approved: true
            },
            select: {
              id: true,
              content: true,
              author: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      })

      return res.status(200).json(updatedPost)
    } catch (error) {
      console.error('Error updating post:', error)
      return res.status(500).json({ error: 'Failed to update post' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.post.delete({
        where: { slug }
      })

      return res.status(200).json({ message: 'Post deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete post' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Allow GET requests without authentication (but check admin status inside)
    return blogPostHandler(req, res)
  } else {
    // Require authentication for PUT and DELETE
    return requireAuth(blogPostHandler)(req, res)
  }
}