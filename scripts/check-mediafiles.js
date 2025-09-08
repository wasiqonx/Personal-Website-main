const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMediaFiles() {
  console.log('🔍 Checking MediaFile records...')

  try {
    // Get all MediaFile records with post info
    const mediaFiles = await prisma.mediaFile.findMany({
      include: {
        post: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })

    console.log(`📁 Found ${mediaFiles.length} MediaFile records:\n`)

    for (const mediaFile of mediaFiles) {
      console.log(`ID: ${mediaFile.id}`)
      console.log(`Filename: ${mediaFile.filename}`)
      console.log(`URL: ${mediaFile.url}`)
      console.log(`Type: ${mediaFile.type}`)
      console.log(`Size: ${mediaFile.size} bytes`)
      console.log(`Post: ${mediaFile.post.title} (${mediaFile.post.slug})`)
      console.log(`Created: ${mediaFile.createdAt}`)
      console.log('---')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
if (require.main === module) {
  checkMediaFiles()
}
