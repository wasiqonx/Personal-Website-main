import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path: filePath } = req.query

    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' })
    }

    // Construct the full path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...filePath)

    // Security check - ensure the path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const resolvedPath = path.resolve(fullPath)

    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check if file exists
    try {
      await stat(resolvedPath)
    } catch (error) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase()
    let contentType = 'application/octet-stream'

    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime'
    }

    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext]
    }

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400') // 24 hours
    res.setHeader('Content-Type', contentType)

    // For images and videos, set appropriate headers
    if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    // Stream the file
    const fileStream = fs.createReadStream(resolvedPath)
    fileStream.pipe(res)

    fileStream.on('error', (error) => {
      console.error('File streaming error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read file' })
      }
    })

  } catch (error) {
    console.error('Upload serving error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
