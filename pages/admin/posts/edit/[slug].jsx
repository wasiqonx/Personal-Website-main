import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../../lib/auth'

export default function EditPost() {
  const router = useRouter()
  const { slug } = router.query
  const { isAdmin, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: false,
    tags: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return

    if (slug) {
      fetchPost()
    }
  }, [slug, isAuthenticated, isAdmin])

  const fetchPost = async () => {
    try {
      // First try without authentication (for published posts)
      let response = await fetch(`/api/blog/${slug}`)

      // If that fails and user is admin, try with authentication
      if (!response.ok && isAuthenticated && isAdmin) {
        const token = localStorage.getItem('token')
        response = await fetch(`/api/blog/${slug}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }

      const post = await response.json()

      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        published: post.published,
        tags: post.Tag ? post.Tag.map(tag => tag.name).join(', ') : ''
      })
    } catch (error) {
      setError('Failed to load post - make sure you are logged in as admin')
      console.error('Error fetching post:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="py-20 text-center">
      <p className="text-xl text-white/50">Access denied</p>
    </div>
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      setError('Title and content are required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update post')
      }

      await response.json()
      router.push(`/admin`)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="py-20 text-center">
        <i className="fas fa-spinner fa-spin text-2xl text-white/50"></i>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Post - Admin - Wasiq Syed</title>
      </Head>

      <div className="py-10">
        <div className="flex items-center mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mr-4">
            <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
          </Link>
          <h1 className="text-3xl text-white font-semibold">Edit Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label htmlFor="title" className="block text-white/70 mb-2">
                  Title * ({formData.title.length}/100 characters)
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none focus:border-neutral-500 text-white ${
                    formData.title.length > 80 ? 'border-yellow-500' :
                    formData.title.length > 90 ? 'border-red-500' : 'border-neutral-700/50'
                  }`}
                  placeholder="Enter post title"
                  required
                />
                <div className="mt-1 flex justify-between items-center">
                  <span className={`text-xs ${
                    formData.title.length > 90 ? 'text-red-400' :
                    formData.title.length > 80 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {formData.title.length > 80 ?
                      `${100 - formData.title.length} characters remaining` :
                      'Title should be descriptive but concise'
                    }
                  </span>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${formData.title.length > 0 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${formData.title.length > 10 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${formData.title.length > 20 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-white/70 mb-2">
                  Excerpt ({formData.excerpt.length}/300 characters)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none focus:border-neutral-500 text-white resize-none ${
                    formData.excerpt.length > 250 ? 'border-yellow-500' :
                    formData.excerpt.length > 280 ? 'border-red-500' : 'border-neutral-700/50'
                  }`}
                  placeholder="Brief description of the post"
                />
                <div className="mt-1">
                  <span className={`text-xs ${
                    formData.excerpt.length > 280 ? 'text-red-400' :
                    formData.excerpt.length > 250 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {formData.excerpt.length > 250 ?
                      `${300 - formData.excerpt.length} characters remaining` :
                      'Optional summary for SEO and previews'
                    }
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-white/70 mb-2">
                  Content * ({formData.content.length.toLocaleString()}/100,000 characters)
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={20}
                  maxLength={100000}
                  className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none focus:border-neutral-500 text-white resize-none ${
                    formData.content.length > 80000 ? 'border-yellow-500' :
                    formData.content.length > 95000 ? 'border-red-500' : 'border-neutral-700/50'
                  }`}
                  placeholder="Write your post content here. You can use basic markdown formatting."
                  required
                />
                <div className="mt-2 space-y-2">
                  <div className="w-full bg-neutral-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        formData.content.length > 95000 ? 'bg-red-500' :
                        formData.content.length > 80000 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((formData.content.length / 100000) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={`${
                      formData.content.length > 95000 ? 'text-red-400' :
                      formData.content.length > 80000 ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      {formData.content.length > 80000 ?
                        `${(100000 - formData.content.length).toLocaleString()} characters remaining` :
                        `${formData.content.length.toLocaleString()} characters written`
                      }
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Usage:</span>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full ${formData.content.length > 1000 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${formData.content.length > 10000 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${formData.content.length > 50000 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${formData.content.length > 80000 ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/50 text-sm">
                    Supports basic markdown: **bold**, *italic*, `code`, # headers, - lists
                    <br />
                    <strong>Maximum length: 100,000 characters</strong>
                    <br />
                    <em>Note: Posts over 50,000 characters may affect page loading performance</em>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-800/10 p-6 rounded-lg">
                <h3 className="text-lg text-white font-semibold mb-4">Post Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <span className="text-white/70">Published</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-white/70 mb-2">
                      Tags ({formData.tags.length}/200 characters)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      maxLength={200}
                      className={`w-full px-3 py-2 bg-neutral-800/20 border rounded-lg focus:outline-none focus:border-neutral-500 text-white text-sm ${
                        formData.tags.length > 150 ? 'border-yellow-500' :
                        formData.tags.length > 180 ? 'border-red-500' : 'border-neutral-700/50'
                      }`}
                      placeholder="tag1, tag2, tag3"
                    />
                    <div className="mt-1">
                      <p className="text-white/50 text-xs">
                        Separate tags with commas
                      </p>
                      {formData.tags.length > 150 && (
                        <p className={`text-xs mt-1 ${
                          formData.tags.length > 180 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {200 - formData.tags.length} characters remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800/10 p-6 rounded-lg">
                <h3 className="text-lg text-white font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? 'Updating...' : 'Update Post'}
                  </button>

                  <Link href={`/blog/${slug}`} target="_blank" className="block w-full text-center bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg transition-colors duration-200">
                    Preview Post
                  </Link>

                  <Link href="/admin" className="block w-full text-center bg-neutral-700/50 hover:bg-neutral-700/70 text-white py-2 rounded-lg transition-colors duration-200">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

