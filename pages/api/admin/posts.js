import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  // Dynamic import to avoid loading Prisma on client side
  const { default: prisma } = await import('../../../lib/db')

  if (req.method === 'GET') {
    try {
      // Admin can see ALL posts (published and drafts)
      const posts = await prisma.post.findMany({
        include: {
          User: {
            select: { username: true, id: true }
          },
          Tag: true
        },
        orderBy: { createdAt: 'desc' } // Show newest first
      })
      
      return res.status(200).json(posts)
    } catch (error) {
      console.error('Admin posts fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch posts' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

export default requireAdmin(handler)