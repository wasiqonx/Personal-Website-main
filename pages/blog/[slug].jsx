import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'
import swr from '../../lib/swr'
import { useAuth } from '../../lib/auth'
import Image from 'next/image'
import DOMPurify from 'dompurify'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  const { user, loading: authLoading } = useAuth()

  const { data: post, error } = swr(slug ? `/api/blog/${slug}` : null)

  if (error) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl text-white font-semibold mb-4">Post Not Found</h1>
        <p className="text-white/50 mb-6">The blog post you're looking for doesn't exist.</p>
        <Link href="/blog" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200">
          Back to Blog
        </Link>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-20">
        <div className="animate-pulse">
          <div className="bg-neutral-700/30 h-8 w-3/4 rounded mb-4"></div>
          <div className="bg-neutral-700/30 h-4 w-1/2 rounded mb-6"></div>
          <div className="bg-neutral-700/30 h-64 w-full rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{post.title} - Blog - Wasiq Syed</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>
      
      <div className="py-10">
        <Link href="/blog" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors duration-200">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Blog
        </Link>

        <article className="max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-white/60 mb-6">
              <span>By {post.User?.username || 'Unknown Author'}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Media Files Section - Above Content */}
          {post.MediaFile && post.MediaFile.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {post.MediaFile.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.type === 'image' ? (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-800/20">
                        <Image
                          src={media.url}
                          alt={media.originalName}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-800/20 flex items-center justify-center">
                        <video
                          src={media.url}
                          controls
                          className="w-full h-full object-cover rounded-lg"
                          poster=""
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Media Info Overlay - Top Left Corner */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[calc(100%-1rem)]">
                      <p className="text-white text-sm font-medium truncate" title={media.originalName}>
                        {media.originalName}
                      </p>
                      <p className="text-white/70 text-xs">
                        {(media.size / 1024 / 1024).toFixed(1)}MB • {media.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none text-justify"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content || '') }}
          />
        </article>

        {/* Comments Section */}
        <CommentsSection post={post} />
      </div>
    </>
  )
}

// Secure markdown-like formatting with XSS protection
function formatContent(content) {
  if (!content || typeof content !== 'string') {
    return 'No content available.';
  }

  // Escape HTML entities first to prevent XSS
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  // Apply markdown-like formatting
  let formatted = escaped
    .replace(/\n\n/g, '</p><p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-neutral-800/50 px-1 rounded">$1</code>')
    .replace(/^#\s(.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^##\s(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^###\s(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4">$1</ul>')
    .replace(/\n/g, '<br>')

  // Sanitize the final HTML to ensure no XSS
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'h2', 'h3', 'h4', 'ul', 'li'],
    ALLOWED_ATTR: ['class']
  })
}

// Comments Section Component
function CommentsSection({ post }) {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [commentForm, setCommentForm] = useState({
    content: '',
    author: '',
    email: ''
  })
  const [replyingTo, setReplyingTo] = useState(null) // Track which comment we're replying to

  // Fetch comments separately for real-time updates
  const { data: commentsData, error: commentsError, mutate } = swr(
    slug ? `/api/blog/${slug}/comments` : null
  )

  const comments = commentsData?.comments || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')


    try {
      // Use authenticated user data if available
      const submitData = user ? {
        content: commentForm.content,
        author: user.username,
        email: user.email || null,
        parentId: replyingTo
      } : {
        ...commentForm,
        parentId: replyingTo
      }

      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitData,
          csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const analysis = data.analysis
        let message = 'Comment submitted successfully!'

        message = '💬 Comment posted successfully!'

        setSubmitMessage(message)
        // Reset form - keep author/email for guest users, just clear content
        setCommentForm(prev => ({
          ...prev,
          content: '',
          ...(user ? {} : { author: '', email: '' }) // Don't reset author/email for authenticated users
        }))
        setReplyingTo(null) // Reset reply state
        // Refresh comments (comments are now visible immediately)
        mutate(async () => {
          const response = await fetch(`/api/blog/${slug}/comments`)
          if (response.ok) {
            const data = await response.json()
            return data
          }
          return commentsData
        }, false)
      } else {
        setSubmitMessage(data.error || 'Failed to submit comment')
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="mt-12 max-w-4xl">
      <h2 className="text-3xl font-bold text-white mb-8">
        Comments ({comments.length + comments.reduce((total, comment) => total + (comment.replies?.length || 0), 0)})
      </h2>

      {/* Comment Form */}
      <div className="bg-neutral-800/30 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {replyingTo ? `Reply to ${comments.find(c => c.id === replyingTo)?.author || 'Comment'}` : 'Leave a Comment'}
          {replyingTo && (
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Cancel Reply
            </button>
          )}
        </h3>

        {submitMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            submitMessage.includes('successfully')
              ? 'bg-green-600/20 text-green-300 border border-green-600/30'
              : 'bg-red-600/20 text-red-300 border border-red-600/30'
          }`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {user ? (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-sm">
                <i className="fas fa-user-check mr-2"></i>
                Commenting as <strong>{user.username}</strong>
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="author" className="block text-white/80 mb-2">Name *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  required
                  maxLength={100}
                  value={commentForm.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white/80 mb-2">Email (optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={commentForm.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="content" className="block text-white/80 mb-2">Comment *</label>
            <textarea
              id="content"
              name="content"
              required
              maxLength={1000}
              rows={4}
              value={commentForm.content}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Write your comment here..."
            />
            <div className="text-sm text-white/60 mt-1">
              {commentForm.content.length}/1000 characters
            </div>
          </div>

          {/* Comments are auto-approved - no captcha needed */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {commentsError && (
          <div className="bg-red-600/20 text-red-300 border border-red-600/30 p-4 rounded-lg">
            Failed to load comments. Please try again later.
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-neutral-800/20 border border-neutral-700/50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-300 font-semibold text-sm">
                      {comment.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{comment.author}</h4>
                    <p className="text-white/60 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {/* All comments are auto-approved */}
              </div>

              <div className="leading-relaxed text-white/90">
                {comment.content.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
                {/* All comments are auto-approved */}
              </div>

              {/* Reply Button */}
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <i className="fas fa-reply mr-1"></i>Reply
                </button>
                {comment.replies && comment.replies.length > 0 && (
                  <span className="text-sm text-white/50">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>

              {/* Display Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 space-y-3 border-l-2 border-neutral-700/50 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-neutral-800/10 border border-neutral-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-300 font-semibold text-xs">
                              {reply.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-white font-medium text-sm">{reply.author}</h5>
                            <p className="text-white/50 text-xs">
                              {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        {/* All replies are auto-approved */}
                      </div>

                      <div className="leading-relaxed text-sm text-white/80">
                        {reply.content.split('\n').map((line, index) => (
                          <p key={index} className={index > 0 ? 'mt-1' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}