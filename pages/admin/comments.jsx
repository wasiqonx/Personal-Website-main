import { useState } from 'react'
import Link from 'next/link'
import swr from '../../lib/swr'
import { useAuth } from '../../lib/auth'

export default function AdminComments() {
  const { user, loading } = useAuth()
  const [updating, setUpdating] = useState(null)

  const { data: commentsData, error, mutate } = swr(user && user.isAdmin ? '/api/admin/comments' : null)

  if (loading) {
    return (
      <div className="py-20">
        <div className="animate-pulse">
          <div className="bg-neutral-700/30 h-8 w-1/4 rounded mb-6"></div>
          <div className="bg-neutral-700/30 h-64 w-full rounded"></div>
        </div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl text-white font-semibold mb-4">Access Denied</h1>
        <p className="text-white/50 mb-6">
          You need admin privileges to access this page.
          {user && !user.isAdmin && <span className="block mt-2 text-yellow-400">You are logged in as: {user.username} (not admin)</span>}
          {!user && <span className="block mt-2 text-red-400">You are not logged in</span>}
        </p>
        <Link href="/auth/login">
          <a className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200">
            Login as Admin
          </a>
        </Link>
      </div>
    )
  }

  const comments = commentsData?.comments || []


  const handleReject = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setUpdating(commentId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      })

      if (response.ok) {
        mutate() // Refresh the comments list
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      alert('Error deleting comment')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Comments Management</h1>
          <p className="text-white/60">Manage blog post comments</p>
        </div>
        <Link href="/admin">
          <a className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg transition-colors duration-200">
            Back to Admin
          </a>
        </Link>
      </div>

      {/* Comments Count */}
      <div className="mb-6">
        <p className="text-white/60">Total Comments: {comments.length}</p>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-600/20 text-red-300 border border-red-600/30 p-4 rounded-lg">
            Failed to load comments. Please try again later.
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Debug Info</summary>
              <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </details>
          </div>
        )}

        {!error && comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No comments found in the database.</p>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No comments found.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-6">
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-300 font-semibold">
                      {comment.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{comment.author}</h3>
                    <p className="text-white/60 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {comment.email && (
                      <p className="text-white/40 text-xs">{comment.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReject(comment.id)}
                      disabled={updating === comment.id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-200 disabled:opacity-50"
                    >
                      {updating === comment.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Info */}
              <div className="mb-4">
                <Link href={`/blog/${comment.Post.slug}`}>
                  <a className="text-blue-400 hover:text-blue-300 text-sm">
                    On: {comment.Post.title}
                  </a>
                </Link>
              </div>

              {/* Auto-Approval Notice */}
              <div className="mb-4 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-300 mb-2">✅ Auto-Approved</h4>
                <div className="text-sm text-blue-200">
                  <p>This comment was automatically posted without review.</p>
                  <p className="mt-1">All comments are immediately visible on the blog post.</p>
                </div>
              </div>

              {/* Comment Content */}
              <div className="text-white/90 leading-relaxed bg-neutral-900/50 p-4 rounded-lg">
                {comment.content.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
