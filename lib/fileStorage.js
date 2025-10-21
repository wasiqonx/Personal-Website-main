import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { v4 as uuidv4 } from 'uuid'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const unlink = promisify(fs.unlink)

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images')
const VIDEOS_DIR = path.join(UPLOAD_DIR, 'videos')

// Create directories if they don't exist
async function ensureDirectories() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
    await mkdir(IMAGES_DIR, { recursive: true })
    await mkdir(VIDEOS_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating upload directories:', error)
  }
}

export class FileStorage {
  static async init() {
    await ensureDirectories()
  }

  static getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video'
    return 'unknown'
  }

  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase()
  }

  static generateFilename(originalName, type) {
    const ext = this.getFileExtension(originalName)
    const uuid = uuidv4()
    const timestamp = Date.now()
    return `${type}_${timestamp}_${uuid}${ext}`
  }

  static getUploadPath(filename, type) {
    const baseDir = type === 'image' ? IMAGES_DIR : VIDEOS_DIR
    return path.join(baseDir, filename)
  }

  static getPublicUrl(filename, type) {
    // Use API route for serving files to ensure compatibility with production builds
    const basePath = type === 'image' ? '/uploads/images/' : '/uploads/videos/'
    return `/api/uploads${basePath}${filename}`
  }

  static async saveFile(buffer, originalName, mimetype) {
    const type = this.getFileType(mimetype)

    if (type === 'unknown') {
      throw new Error('Unsupported file type')
    }

    const filename = this.generateFilename(originalName, type)
    const filePath = this.getUploadPath(filename, type)
    const publicUrl = this.getPublicUrl(filename, type)

    if (type === 'image') {
      // Process image with resizing (only server-side)
      try {
        // Dynamically import ImageProcessor to avoid build-time issues
        const { ImageProcessor } = await import('./imageProcessor.js')
        const processedImage = await ImageProcessor.processImage(
          buffer,
          filename,
          IMAGES_DIR,
          {
            generateSizes: ['thumbnail', 'small', 'medium', 'large'],
            maintainAspectRatio: true,
            format: 'webp' // Convert to WebP for better compression
          }
        )

        // Return processed image information
        return {
          filename,
          originalName,
          mimetype,
          size: buffer.length,
          url: processedImage.sizes.medium?.url || publicUrl, // Use medium size as primary URL
          type,
          filePath,
          processedImage, // Include all processed sizes
          responsive: true
        }
      } catch (error) {
        console.warn('Image processing failed, falling back to original:', error.message)
        // Fall back to original image if processing fails
        await writeFile(filePath, buffer)
        return {
          filename,
          originalName,
          mimetype,
          size: buffer.length,
          url: publicUrl,
          type,
          filePath,
          processedImage: null,
          responsive: false
        }
      }
    } else {
      // For videos and other files, save as-is
      await writeFile(filePath, buffer)
      return {
        filename,
        originalName,
        mimetype,
        size: buffer.length,
        url: publicUrl,
        type,
        filePath
      }
    }
  }

  static async deleteFile(filename, type) {
    try {
      const filePath = this.getUploadPath(filename, type)
      await unlink(filePath)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  static validateFile(file) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

    const type = this.getFileType(file.mimetype)

    if (type === 'unknown') {
      throw new Error('Unsupported file type')
    }

    // Different size limits for images and videos
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 500 * 1024 * 1024 // 5MB for images, 500MB for videos

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB for ${type}s`)
    }

    const allowedTypes = type === 'image' ? allowedImageTypes : allowedVideoTypes

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid ${type} file type. Allowed types: ${allowedTypes.join(', ')}`)
    }

    return true
  }

  static getFileInfo(filename) {
    try {
      const ext = this.getFileExtension(filename)
      const type = ext.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video'
      const filePath = this.getUploadPath(filename, type)

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        return {
          filename,
          type,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          exists: true
        }
      }

      return { exists: false }
    } catch (error) {
      console.error('Error getting file info:', error)
      return { exists: false }
    }
  }
}

// Initialize directories on module load
FileStorage.init().catch(console.error)
