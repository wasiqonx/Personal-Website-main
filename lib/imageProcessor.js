import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

export class ImageProcessor {
  // Define standard image sizes for responsive images
  static SIZES = {
    thumbnail: { width: 300, height: 200, suffix: '_thumb' },
    small: { width: 640, height: 480, suffix: '_small' },
    medium: { width: 1024, height: 768, suffix: '_medium' },
    large: { width: 1280, height: 960, suffix: '_large' },
    original: { width: null, height: null, suffix: '' } // Keep original size
  }

  // Quality settings for different formats
  static QUALITY = {
    jpeg: 85,
    png: 85,
    webp: 90,
    avif: 85
  }

  /**
   * Process an uploaded image and create multiple resized versions
   * @param {Buffer} buffer - Original image buffer
   * @param {string} originalFilename - Original filename
   * @param {string} basePath - Base path for saving images
   * @param {Object} options - Processing options
   * @returns {Object} Processed image information
   */
  static async processImage(buffer, originalFilename, basePath, options = {}) {
    const {
      generateSizes = ['thumbnail', 'small', 'medium', 'large'],
      maintainAspectRatio = true,
      quality = null,
      format = null
    } = options

    try {
      // Get original image metadata
      const metadata = await sharp(buffer).metadata()

      // Determine output format
      const outputFormat = format || this.getFormatFromExtension(originalFilename)

      // Prepare result object
      const result = {
        original: {
          width: metadata.width,
          height: metadata.height,
          size: buffer.length,
          format: metadata.format
        },
        sizes: {}
      }

      // Generate filename base (without extension)
      const filenameBase = path.parse(originalFilename).name
      const extension = this.getExtensionForFormat(outputFormat)

      // Process each size
      for (const sizeKey of generateSizes) {
        const sizeConfig = this.SIZES[sizeKey]
        if (!sizeConfig) continue

        const outputFilename = `${filenameBase}${sizeConfig.suffix}.${extension}`
        const outputPath = path.join(basePath, outputFilename)

        let sharpInstance = sharp(buffer)

        // Apply resizing if dimensions are specified
        if (sizeConfig.width && sizeConfig.height) {
          if (maintainAspectRatio) {
            // Calculate dimensions maintaining aspect ratio
            const aspectRatio = metadata.width / metadata.height
            let newWidth = sizeConfig.width
            let newHeight = sizeConfig.height

            if (metadata.width > metadata.height) {
              // Landscape image
              newHeight = Math.round(newWidth / aspectRatio)
            } else {
              // Portrait image
              newWidth = Math.round(newHeight * aspectRatio)
            }

            // Ensure we don't exceed original dimensions
            if (newWidth > metadata.width) newWidth = metadata.width
            if (newHeight > metadata.height) newHeight = metadata.height

            sharpInstance = sharpInstance.resize(newWidth, newHeight, {
              fit: 'inside',
              withoutEnlargement: true
            })
          } else {
            sharpInstance = sharpInstance.resize(sizeConfig.width, sizeConfig.height, {
              fit: 'cover',
              position: 'center'
            })
          }
        }

        // Apply format-specific settings
        const formatQuality = quality || this.QUALITY[outputFormat] || 85

        switch (outputFormat) {
          case 'jpeg':
          case 'jpg':
            sharpInstance = sharpInstance.jpeg({
              quality: formatQuality,
              progressive: true
            })
            break
          case 'png':
            sharpInstance = sharpInstance.png({
              quality: formatQuality,
              progressive: true
            })
            break
          case 'webp':
            sharpInstance = sharpInstance.webp({
              quality: formatQuality,
              effort: 4
            })
            break
          case 'avif':
            sharpInstance = sharpInstance.avif({
              quality: formatQuality,
              effort: 4
            })
            break
          default:
            // Keep original format
            break
        }

        // Save the processed image
        const processedBuffer = await sharpInstance.toBuffer()
        await fs.writeFile(outputPath, processedBuffer)

        // Store size information
        const processedMetadata = await sharp(processedBuffer).metadata()
        result.sizes[sizeKey] = {
          filename: outputFilename,
          width: processedMetadata.width,
          height: processedMetadata.height,
          size: processedBuffer.length,
          path: outputPath,
          url: `/uploads/images/${outputFilename}`
        }
      }

      // Also save original if requested
      if (generateSizes.includes('original')) {
        const originalFilenameFull = `${filenameBase}_original.${extension}`
        const originalPath = path.join(basePath, originalFilenameFull)
        await fs.writeFile(originalPath, buffer)

        result.sizes.original = {
          filename: originalFilenameFull,
          width: metadata.width,
          height: metadata.height,
          size: buffer.length,
          path: originalPath,
          url: `/uploads/images/${originalFilenameFull}`
        }
      }

      return result

    } catch (error) {
      console.error('Error processing image:', error)
      throw new Error(`Image processing failed: ${error.message}`)
    }
  }

  /**
   * Generate responsive image HTML with srcset
   * @param {Object} processedImage - Result from processImage
   * @param {string} alt - Alt text for the image
   * @param {Object} options - Additional options
   * @returns {string} HTML for responsive image
   */
  static generateResponsiveImageHTML(processedImage, alt = '', options = {}) {
    const {
      className = '',
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      loading = 'lazy'
    } = options

    // Build srcset from available sizes
    const srcset = Object.entries(processedImage.sizes)
      .filter(([key, size]) => key !== 'original' && size.width)
      .map(([key, size]) => `${size.url} ${size.width}w`)
      .join(', ')

    if (!srcset) {
      // Fallback to original if no processed sizes
      const originalUrl = processedImage.sizes.original?.url || ''
      return `<img src="${originalUrl}" alt="${alt}" class="${className}" loading="${loading}">`
    }

    // Use medium as fallback src
    const fallbackSrc = processedImage.sizes.medium?.url ||
                       processedImage.sizes.small?.url ||
                       processedImage.sizes.thumbnail?.url ||
                       Object.values(processedImage.sizes)[0].url

    return `<img src="${fallbackSrc}" srcset="${srcset}" sizes="${sizes}" alt="${alt}" class="${className}" loading="${loading}">`
  }

  /**
   * Get image format from filename extension
   * @param {string} filename - Filename
   * @returns {string} Image format
   */
  static getFormatFromExtension(filename) {
    const ext = path.extname(filename).toLowerCase()
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'jpeg'
      case '.png':
        return 'png'
      case '.webp':
        return 'webp'
      case '.avif':
        return 'avif'
      default:
        return 'jpeg' // Default fallback
    }
  }

  /**
   * Get file extension for format
   * @param {string} format - Image format
   * @returns {string} File extension
   */
  static getExtensionForFormat(format) {
    switch (format) {
      case 'jpeg':
        return 'jpg'
      case 'png':
        return 'png'
      case 'webp':
        return 'webp'
      case 'avif':
        return 'avif'
      default:
        return 'jpg'
    }
  }

  /**
   * Clean up old image files when updating
   * @param {string} filenameBase - Base filename to clean
   * @param {string} basePath - Base path
   */
  static async cleanupOldImages(filenameBase, basePath) {
    try {
      const files = await fs.readdir(basePath)
      const pattern = new RegExp(`^${filenameBase}.*\.(jpg|jpeg|png|webp|avif)$`, 'i')

      const filesToDelete = files.filter(file => pattern.test(file))

      for (const file of filesToDelete) {
        try {
          await fs.unlink(path.join(basePath, file))
        } catch (error) {
          console.warn(`Failed to delete old image file: ${file}`, error.message)
        }
      }
    } catch (error) {
      console.warn('Error during image cleanup:', error.message)
    }
  }

  /**
   * Get optimal image size based on container width
   * @param {Object} processedImage - Processed image data
   * @param {number} containerWidth - Container width in pixels
   * @returns {Object} Optimal size data
   */
  static getOptimalSize(processedImage, containerWidth) {
    const availableSizes = Object.entries(processedImage.sizes)
      .filter(([key, size]) => size.width && size.width >= containerWidth)
      .sort((a, b) => a[1].width - b[1].width)

    // Return the smallest size that meets or exceeds the container width
    return availableSizes[0]?.[1] || processedImage.sizes.thumbnail || Object.values(processedImage.sizes)[0]
  }
}
