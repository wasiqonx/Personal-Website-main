import prisma from '../../../../lib/db'
import { analyzeComment } from '../../../../lib/commentAnalysis'
import { validateCsrfToken } from '../../../../lib/auth'

export default async function handler(req, res) {
  const { slug } = req.query

  if (req.method === 'GET') {
    try {
      // Get the post to verify it exists
      const post = await prisma.post.findUnique({
        where: { slug },
        select: { id: true, published: true }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Only show comments for published posts
      if (!post.published) {
        return res.status(200).json({ comments: [] })
      }

      // Get all top-level comments for this post (including pending approval)
      const comments = await prisma.comment.findMany({
        where: {
          postId: post.id,
          parentId: null // Only get top-level comments
        },
        select: {
          id: true,
          content: true,
          author: true,
          createdAt: true,
          updatedAt: true,
          approved: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Get all replies for these comments
      const commentIds = comments.map(c => c.id)
      const replies = await prisma.comment.findMany({
        where: {
          postId: post.id,
          parentId: {
            in: commentIds
          }
        },
        select: {
          id: true,
          content: true,
          author: true,
          createdAt: true,
          updatedAt: true,
          approved: true,
          parentId: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group replies by parentId
      const repliesByParent = replies.reduce((acc, reply) => {
        if (!acc[reply.parentId]) {
          acc[reply.parentId] = []
        }
        acc[reply.parentId].push(reply)
        return acc
      }, {})

      // Add replies to comments
      const commentsWithReplies = comments.map(comment => ({
        ...comment,
        replies: repliesByParent[comment.id] || []
      }))

      return res.status(200).json({ comments: commentsWithReplies })
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, author, email, parentId } = req.body

      // Validate CSRF token
      const csrfValidation = validateCsrfToken(req)
      if (csrfValidation.error) {
        return res.status(403).json({ error: csrfValidation.error })
      }

      // Validate input
      if (!content || !author) {
        return res.status(400).json({ error: 'Content and author are required' })
      }

      // Optional hCaptcha verification (skip for now to simplify process)
      // TODO: Re-enable hCaptcha when needed for spam protection

      if (content.length > 1000) {
        return res.status(400).json({ error: 'Comment must be less than 1000 characters' })
      }

      if (author.length > 100) {
        return res.status(400).json({ error: 'Author name must be less than 100 characters' })
      }

      // Get the post
      const post = await prisma.post.findUnique({
        where: { slug },
        select: { id: true, published: true }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Only allow comments on published posts
      if (!post.published) {
        return res.status(400).json({ error: 'Cannot comment on unpublished posts' })
      }

      // If parentId is provided, validate that the parent comment exists and belongs to this post
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { postId: true, parentId: true }
        })

        if (!parentComment) {
          return res.status(400).json({ error: 'Parent comment not found' })
        }

        if (parentComment.postId !== post.id) {
          return res.status(400).json({ error: 'Parent comment does not belong to this post' })
        }

        // Prevent nested replies (only allow replies to top-level comments)
        if (parentComment.parentId) {
          return res.status(400).json({ error: 'Cannot reply to a reply' })
        }
      }

      // Auto-approve all comments (no review process)
      const approved = true
      const analysisMessage = 'Comment auto-approved'

      // Create the comment with analysis-based approval
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          author: author.trim(),
          email: email?.trim() || null,
          postId: post.id,
          parentId: parentId || null,
          approved: approved
        },
        select: {
          id: true,
          content: true,
          author: true,
          createdAt: true,
          approved: true,
          parentId: true
        }
      })

      // Comment auto-approved - no analysis needed
      console.log(`Comment created [${comment.id}]: auto-approved`)

      const responseMessage = 'Comment posted successfully!'

      return res.status(201).json({
        message: responseMessage,
        comment
      })
    } catch (error) {
      console.error('Error creating comment:', error.message)
      console.error('Stack:', error.stack)
      return res.status(500).json({ error: 'Failed to create comment', details: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { commentId } = req.body

      if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' })
      }

      // Verify the comment exists and belongs to this post
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          postId: true,
          post: {
            select: { slug: true }
          }
        }
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.post.slug !== slug) {
        return res.status(400).json({ error: 'Comment does not belong to this post' })
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

  res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
  return res.status(405).json({ error: 'Method not allowed' })
}
