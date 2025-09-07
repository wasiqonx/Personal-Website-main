import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import swr from '../../lib/swr'

export default function Blog() {
  const { data: posts, error } = swr('/api/blog')
  const [searchTerm, setSearchTerm] = useState('')

  // Ensure posts is an array before filtering
  const postsArray = Array.isArray(posts) ? posts : []
  const filteredPosts = postsArray.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.length > 0 && post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl text-red-400">Failed to load posts</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Blog - Wasiq Syed</title>
        <meta name="description" content="Read the latest blog posts about technology, software development, and more." />
      </Head>
      
      <div className="py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl text-white font-semibold mb-4">Blog</h1>
          <p className="text-xl text-white/50 font-normal mb-8">
            Thoughts on technology, software development, and more
          </p>
          
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:border-neutral-500 text-white placeholder-white/50"
            />
          </div>
        </div>

        {!posts || !Array.isArray(posts) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-neutral-800/10 p-6 rounded-lg animate-pulse">
                <div className="bg-neutral-700/30 h-6 w-3/4 rounded mb-3"></div>
                <div className="bg-neutral-700/30 h-4 w-1/2 rounded mb-4"></div>
                <div className="bg-neutral-700/30 h-16 w-full rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-white/50">
              {searchTerm ? 'No posts found matching your search.' : 'No posts published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <a className="block bg-neutral-800/10 hover:bg-neutral-800/20 p-6 rounded-lg transition-all duration-200 group">
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-200 mb-2">
                    {post.title}
                  </h2>
                  
                  <div className="flex items-center text-sm text-white/50 mb-3">
                    <span>By {post.author?.username || 'Unknown Author'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-white/70 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-neutral-700/30 text-xs rounded-full text-white/60"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}