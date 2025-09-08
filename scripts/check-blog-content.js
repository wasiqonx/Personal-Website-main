const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBlogContent() {
  console.log('🔍 Checking blog post content for image references...')

  try {
    // Get all posts with their content
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true
      }
    })

    console.log(`📝 Found ${posts.length} posts:\n`)

    for (const post of posts) {
      console.log(`Title: ${post.title}`)
      console.log(`Slug: ${post.slug}`)
      console.log(`Published: ${post.published}`)

      // Check if content contains the missing image reference
      const missingImagePattern = /1757331716367_798e19e8-6cf8-4565-bc55-c44c048b4fed/
      if (missingImagePattern.test(post.content)) {
        console.log(`⚠️  FOUND MISSING IMAGE REFERENCE in post: ${post.title}`)
        console.log('Content snippet:', post.content.substring(0, 200) + '...')
      } else {
        console.log('✅ No missing image references')
      }

      // Also check for any image references
      const imageRefs = post.content.match(/\/uploads\/images\/[^"'\s]+/g)
      if (imageRefs) {
        console.log('📸 Image references found:', imageRefs)
      }

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
  checkBlogContent()
}
