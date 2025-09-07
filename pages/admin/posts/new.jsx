import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../lib/auth'
import Image from 'next/image'

export default function NewPost() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: false, // explicitly set to false
    tags: ''
  })

  // Media upload state
  const [mediaFiles, setMediaFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Sync checkbox DOM state with React state
  useEffect(() => {
    if (checkboxRef.current && checkboxRef.current.checked !== formData.published) {
      checkboxRef.current.checked = formData.published
    }
  }, [formData.published])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const checkboxRef = useRef(null)

  // Handle uncontrolled checkbox changes
  const handleUncontrolledCheckbox = () => {
    if (checkboxRef.current) {
      const newChecked = checkboxRef.current.checked
      setFormData(prev => ({ ...prev, published: newChecked }))
    }
  }


  if (!isAuthenticated || !isAdmin) {
    return <div className="py-20 text-center">
      <p className="text-xl text-white/50">Access denied</p>
    </div>
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => {
      const newValue = type === 'checkbox' ? checked : value
      return {
        ...prev,
        [name]: newValue
      }
    })
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  // Media upload handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.type.startsWith('image/') ? file.size <= 5 * 1024 * 1024 : file.size <= 500 * 1024 * 1024 // 5MB for images, 500MB for videos
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Images must be under 5MB and videos under 500MB.')
    }

    setUploading(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      validFiles.forEach(file => {
        formDataUpload.append('files', file)
      })

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setMediaFiles(prev => [...prev, ...data.files])

      if (data.errors && data.errors.length > 0) {
        setError(`Some files failed to upload: ${data.errors.map(e => e.error).join(', ')}`)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveMediaFile = (fromIndex, toIndex) => {
    setMediaFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
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

      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        published: Boolean(formData.published),
        tags,
        media: mediaFiles.map((file, index) => ({
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          url: file.url,
          type: file.type,
          position: index
        }))
      }

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      const result = await response.json()

      router.push(`/admin`)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Post - Admin - Wasiq Syed</title>
      </Head>
      
      <div className="py-10">
        <div className="flex items-center mb-8">
          <Link href="/admin">
            <a className="text-blue-400 hover:text-blue-300 mr-4">
              <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </a>
          </Link>
          <h1 className="text-3xl text-white font-semibold">Create New Post</h1>
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
                  maxLength={100000} // 100k character limit
                  className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none focus:border-neutral-500 text-white resize-none ${
                    formData.content.length > 80000 ? 'border-yellow-500' :
                    formData.content.length > 95000 ? 'border-red-500' : 'border-neutral-700/50'
                  }`}
                  placeholder="Write your post content here. You can use basic markdown formatting."
                  required
                />
                <div className="mt-2 space-y-2">
                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        formData.content.length > 95000 ? 'bg-red-500' :
                        formData.content.length > 80000 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((formData.content.length / 100000) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Character Status */}
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

                    {/* Usage Indicator */}
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

              {/* Media Upload Section */}
              <div>
                <label className="block text-white/70 mb-2">
                  Media Files (Images & Videos) - {mediaFiles.length} files
                </label>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-400/10'
                      : 'border-neutral-700/50 hover:border-neutral-600'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="text-white/70">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-white/50 mb-2"></i>
                      <p className="text-white/70 mb-2">
                        Drag & drop images or videos here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-white/50 text-sm">
                        Supports: Images (JPEG, PNG, GIF, WebP) up to 5MB • Videos (MP4, WebM, OGG) up to 500MB
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Uploaded Files Preview */}
                {mediaFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white/70 font-medium">Uploaded Files ({mediaFiles.length}):</h4>
                      <p className="text-white/50 text-sm">Drag to reorder</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {mediaFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative bg-neutral-800/20 rounded-lg p-3 border border-neutral-700/30 group cursor-move"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                            if (fromIndex !== index) {
                              moveMediaFile(fromIndex, index)
                            }
                          }}
                        >
                          {/* Drag Handle */}
                          <div className="absolute top-1 left-1 text-white/30 group-hover:text-white/70 transition-colors">
                            <i className="fas fa-grip-vertical text-sm"></i>
                          </div>

                          {file.type === 'image' ? (
                            <div className="relative w-full h-24 mb-2">
                              <Image
                                src={file.url}
                                alt={file.originalName}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-neutral-700/30 rounded flex items-center justify-center mb-2">
                              <i className="fas fa-video text-2xl text-white/50"></i>
                            </div>
                          )}

                          <div className="text-xs text-white/70 truncate pr-8" title={file.originalName}>
                            {file.originalName}
                          </div>
                          <div className="text-xs text-white/50">
                            {(file.size / 1024 / 1024).toFixed(1)}MB • {file.type}
                          </div>
                          <div className="text-xs text-white/40 mt-1">
                            Position: {index + 1}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-70 hover:opacity-100 transition-opacity"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-800/10 p-6 rounded-lg">
                <h3 className="text-lg text-white font-semibold mb-4">Post Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <input
                        ref={checkboxRef}
                        type="checkbox"
                        name="published"
                        defaultChecked={formData.published}
                        onChange={handleUncontrolledCheckbox}
                        onClick={() => {
                          // Small delay to let the DOM update first
                          setTimeout(() => {
                            handleUncontrolledCheckbox()
                          }, 0)
                        }}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-white/70 cursor-pointer" onClick={() => {
                        handleCheckboxChange({ target: { name: 'published', checked: !formData.published } })
                      }}>
                        Publish immediately
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({formData.published ? 'Will publish' : 'Will save as draft'}) | State: {String(formData.published)}
                      </span>
                    </div>

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


                {/* Character Limits Summary */}
                <div className="mb-4 p-4 bg-neutral-900/50 rounded">
                  <h4 className="text-white font-semibold mb-3 text-sm">📊 Character Limits Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Title:</span>
                        <span className={`font-semibold ${
                          formData.title.length > 90 ? 'text-red-400' :
                          formData.title.length > 80 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {formData.title.length}/100
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700/50 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            formData.title.length > 90 ? 'bg-red-500' :
                            formData.title.length > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((formData.title.length / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Excerpt:</span>
                        <span className={`font-semibold ${
                          formData.excerpt.length > 280 ? 'text-red-400' :
                          formData.excerpt.length > 250 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {formData.excerpt.length}/300
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700/50 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            formData.excerpt.length > 280 ? 'bg-red-500' :
                            formData.excerpt.length > 250 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((formData.excerpt.length / 300) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Content:</span>
                        <span className={`font-semibold ${
                          formData.content.length > 95000 ? 'text-red-400' :
                          formData.content.length > 80000 ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {formData.content.length.toLocaleString()}/100,000
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            formData.content.length > 95000 ? 'bg-red-500' :
                            formData.content.length > 80000 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((formData.content.length / 100000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-700/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Status:</span>
                      <div className="flex items-center space-x-2">
                        <span className={formData.published ? 'text-green-400' : 'text-yellow-400'}>
                          {formData.published ? 'Will Publish' : 'Draft'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {formData.tags.split(',').filter(tag => tag.trim()).length} tags
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
                    onClick={(e) => {
                      console.log('Submit button clicked')
                      // The form onSubmit will handle the actual submission
                    }}
                  >
                    {isLoading ? 'Creating...' : formData.published ? 'Publish Post' : 'Save Draft'}
                  </button>

                  <Link href="/admin">
                    <a className="block w-full text-center bg-neutral-700/50 hover:bg-neutral-700/70 text-white py-2 rounded-lg transition-colors duration-200">
                      Cancel
                    </a>
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