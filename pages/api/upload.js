import { FileStorage } from '../../lib/fileStorage.js'
import { requireAuth } from '../../lib/auth'

// Simple in-memory rate limiting for uploads
const uploadRateLimit = new Map()

function checkUploadRateLimit(ip, maxRequests = 3, windowMs = 300000) { // 3 uploads per 5 minutes
  const now = Date.now()
  const windowStart = now - windowMs

  if (!uploadRateLimit.has(ip)) {
    uploadRateLimit.set(ip, [])
  }

  const requests = uploadRateLimit.get(ip).filter(time => time > windowStart)
  requests.push(now)
  uploadRateLimit.set(ip, requests)

  return requests.length <= maxRequests
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
}

async function parseFormData(req) {
  const formidable = (await import('formidable')).default

  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 500 * 1024 * 1024, // 500MB max file size (for videos)
      maxFiles: 10, // Maximum 10 files per upload
      keepExtensions: true,
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting for uploads
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  if (!checkUploadRateLimit(clientIP)) {
    return res.status(429).json({ error: 'Upload rate limit exceeded. Please try again later.' })
  }

  try {
    // Parse multipart form data
    const { fields, files } = await parseFormData(req)

    const uploadedFiles = []
    const errors = []

    // Process each uploaded file
    const fileKeys = Object.keys(files)
    for (const key of fileKeys) {
      const file = files[key]

      // Handle array of files or single file
      const fileList = Array.isArray(file) ? file : [file]

      for (const fileItem of fileList) {
        try {
          // Validate file
          FileStorage.validateFile(fileItem)

          // Read file content
          const fs = require('fs')
          const buffer = fs.readFileSync(fileItem.filepath)

          // Save file
          const fileInfo = await FileStorage.saveFile(
            buffer,
            fileItem.originalFilename || fileItem.name,
            fileItem.mimetype
          )

          uploadedFiles.push(fileInfo)
        } catch (error) {
          errors.push({
            filename: fileItem.originalFilename || fileItem.name,
            error: error.message
          })
        }
      }
    }

    if (uploadedFiles.length === 0 && errors.length > 0) {
      return res.status(400).json({
        error: 'All file uploads failed',
        errors
      })
    }

    return res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      error: 'Failed to upload files',
      details: error.message
    })
  }
}

export default requireAuth(handler)
