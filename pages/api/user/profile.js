import bcrypt from 'bcryptjs'
import { requireAuth } from '../../../lib/auth'

async function handler(req, res) {
  // Dynamic import to avoid loading Prisma on client side
  const { default: prisma } = await import('../../../lib/db')

  const userId = req.user.userId

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Get profile error:', error)
      return res.status(500).json({ error: 'Failed to get user profile' })
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const { username, currentPassword, newPassword } = req.body


      // Get current user data
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          isAdmin: true
        }
      })

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      let updateData = {}

      // Handle username change
      if (username && username !== currentUser.username) {
        if (username.length < 3) {
          return res.status(400).json({ error: 'Username must be at least 3 characters' })
        }

        // Check if username is already taken
        const existingUser = await prisma.user.findUnique({
          where: { username }
        })

        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Username already taken' })
        }

        updateData.username = username
      }

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password required to change password' })
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password)
        if (!passwordMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' })
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters' })
        }

        // Hash new password
        updateData.password = await bcrypt.hash(newPassword, 12)
      }

      // If no changes requested
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No changes requested' })
      }

      // Update user (admin status is preserved - not in updateData)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          updatedAt: true
        }
      })

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
        passwordChanged: !!newPassword,
        usernameChanged: !!username
      })

    } catch (error) {
      console.error('Update profile error:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

export default requireAuth(handler)