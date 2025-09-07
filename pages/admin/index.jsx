import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/router'

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin')
      return
    }
    
    if (!isAdmin) {
      router.push('/')
      return
    }

    fetchPosts()
  }, [isAuthenticated, isAdmin, router])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (slug) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete post')

      setPosts(posts.filter(post => post.slug !== slug))
    } catch (error) {
      setError(error.message)
    }
  }

  const togglePublished = async (post) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blog/${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...post,
          published: !post.published
        })
      })

      if (!response.ok) throw new Error('Failed to update post')

      const updatedPost = await response.json()
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p))
    } catch (error) {
      setError(error.message)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="py-20 text-center">
      <p className="text-xl text-white/50">Access denied</p>
    </div>
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Wasiq Syed</title>
      </Head>
      
      <div className="py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-white font-semibold">Admin Dashboard</h1>
          <div className="flex space-x-3">
            <Link href="/admin/comments">
              <a className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors duration-200">
                <i className="fas fa-comments mr-2"></i>Comments
              </a>
            </Link>
            <Link href="/admin/posts/new">
              <a className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200">
                <i className="fas fa-plus mr-2"></i>New Post
              </a>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-neutral-800/10 rounded-lg p-6">
          <h2 className="text-xl text-white font-semibold mb-4">Blog Posts</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-white/50"></i>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50">No posts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-neutral-700/50">
                    <th className="pb-3 text-white/70">Title</th>
                    <th className="pb-3 text-white/70">Status</th>
                    <th className="pb-3 text-white/70">Author</th>
                    <th className="pb-3 text-white/70">Created</th>
                    <th className="pb-3 text-white/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-neutral-700/30">
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium">{post.title}</p>
                          <p className="text-white/50 text-sm">/{post.slug}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => togglePublished(post)}
                          className={`px-2 py-1 rounded text-xs ${
                            post.published
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-4 text-white/70">{post.User?.username || 'Unknown'}</td>
                      <td className="py-4 text-white/70">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Link href={`/admin/posts/edit/${post.slug}`}>
                            <a className="text-blue-400 hover:text-blue-300">
                              <i className="fas fa-edit"></i>
                            </a>
                          </Link>
                          <Link href={`/blog/${post.slug}`}>
                            <a className="text-green-400 hover:text-green-300" target="_blank">
                              <i className="fas fa-eye"></i>
                            </a>
                          </Link>
                          <button
                            onClick={() => deletePost(post.slug)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}