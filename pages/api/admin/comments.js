import prisma from '../../../lib/db'
import { verifyToken, requireAuth } from '../../../lib/auth'

async function adminCommentsHandler(req, res) {
  // Verify admin authentication
  const { user, error } = await verifyToken(req)
  if (error || !user || !user.isAdmin) {
    return res.status(401).json({ error: 'Admin access required' })
  }

  if (req.method === 'GET') {
    try {
      // Get all comments with post information
      const comments = await prisma.comment.findMany({
        include: {
          Post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({ comments })
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }


  if (req.method === 'DELETE') {
    try {
      const { commentId } = req.body

      if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' })
      }

      // Delete the comment
      await prisma.comment.delete({
        where: { id: commentId }
      })

      return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
      console.error('Error deleting comment:', error)
      return res.status(500).json({ error: 'Failed to delete comment' })
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  return res.status(405).json({ error: 'Method not allowed' })
}

export default function handler(req, res) {
  return adminCommentsHandler(req, res)
}


