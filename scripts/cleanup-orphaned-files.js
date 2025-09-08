const { PrismaClient } = require('@prisma/client')
const { FileStorage } = require('../lib/fileStorage')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function cleanupOrphanedFiles() {
  console.log('🔍 Checking for orphaned MediaFile records...')

  try {
    // Get all MediaFile records
    const mediaFiles = await prisma.mediaFile.findMany({
      include: {
        post: true
      }
    })

    console.log(`📁 Found ${mediaFiles.length} MediaFile records`)

    let orphanedCount = 0
    let validCount = 0

    for (const mediaFile of mediaFiles) {
      // Extract filename from URL
      const urlParts = mediaFile.url.split('/')
      const filename = urlParts[urlParts.length - 1]

      // Check if file exists on disk
      const fileInfo = FileStorage.getFileInfo(filename)

      if (!fileInfo.exists) {
        console.log(`❌ Orphaned file: ${filename} (ID: ${mediaFile.id})`)
        console.log(`   Post: ${mediaFile.post.title} (ID: ${mediaFile.postId})`)

        // Delete the orphaned record
        await prisma.mediaFile.delete({
          where: { id: mediaFile.id }
        })

        orphanedCount++
      } else {
        validCount++
      }
    }

    console.log(`\n✅ Cleanup completed:`)
    console.log(`   - Valid files: ${validCount}`)
    console.log(`   - Orphaned records removed: ${orphanedCount}`)

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupOrphanedFiles()
}

module.exports = { cleanupOrphanedFiles }
