import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../../lib/auth'

export default function EditThesis() {
  const router = useRouter()
  const { id } = router.query
  const { isAdmin, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    pdfUrl: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin')
      return
    }
    
    if (!isAdmin) {
      router.push('/')
      return
    }

    if (id) {
      fetchThesis()
    }
  }, [id, isAuthenticated, isAdmin, router])

  const fetchThesis = async () => {
    try {
      const response = await fetch(`/api/admin/investment-theses?id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch thesis')
      const theses = await response.json()
      const thesis = theses.find(t => t.id === id)
      if (!thesis) throw new Error('Thesis not found')
      setFormData({
        title: thesis.title,
        pdfUrl: thesis.pdfUrl
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Validation function for PDF URL
  const isValidPdfUrl = (url) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname.toLowerCase()
      
      // Must be HTTPS
      if (urlObj.protocol !== 'https:') return false
      
      // Check if it ends with .pdf
      if (pathname.endsWith('.pdf')) return true
      
      // For imagekit CDN URLs
      if (urlObj.hostname.includes('imagekit.io')) return true
      
      return false
    } catch (error) {
      return false
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setValidationError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationError('')

    // Validation
    if (!formData.title.trim()) {
      setValidationError('Title is required')
      return
    }

    if (formData.title.length > 200) {
      setValidationError('Title must be less than 200 characters')
      return
    }

    if (!formData.pdfUrl.trim()) {
      setValidationError('PDF URL is required')
      return
    }

    if (!isValidPdfUrl(formData.pdfUrl)) {
      setValidationError('Invalid PDF URL. Must be HTTPS and end with .pdf or be from imagekit.io')
      return
    }

    if (formData.pdfUrl.includes('javascript:') || formData.pdfUrl.includes('data:') || formData.pdfUrl.includes('blob:')) {
      setValidationError('Invalid URL format detected')
      return
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch('/api/admin/investment-theses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          title: formData.title.trim(),
          pdfUrl: formData.pdfUrl.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update thesis')
      }

      router.push('/admin/investment-theses')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="py-20 text-center">
      <p className="text-xl text-white/50">Access denied</p>
    </div>
  }

  if (isLoading) {
    return <div className="py-20 text-center">
      <i className="fas fa-spinner fa-spin text-2xl text-white/50"></i>
    </div>
  }

  return (
    <>
      <Head>
        <title>Edit Investment Thesis - Admin - Wasiq Syed</title>
      </Head>
      
      <div className="py-10">
        <div className="flex items-center mb-8">
          <Link href="/admin/investment-theses" className="text-blue-400 hover:text-blue-300 mr-4">
            <i className="fas fa-arrow-left mr-2"></i>Back to Investment Theses
          </Link>
          <h1 className="text-3xl text-white font-semibold">Edit Investment Thesis</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {validationError && (
            <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-400 px-4 py-3 rounded-lg mb-6">
              {validationError}
            </div>
          )}

          <div className="bg-neutral-800/10 rounded-lg p-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-white/70 mb-2">
                Title * ({formData.title.length}/200 characters)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                placeholder="e.g., Q1 2025 Market Analysis"
                className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none focus:ring-2 text-white ${
                  formData.title.length > 180 ? 'border-yellow-500 focus:ring-yellow-500' :
                  formData.title.length > 0 ? 'border-green-500/50 focus:ring-green-500' : 'border-neutral-700/50 focus:ring-blue-500'
                }`}
                required
              />
              <p className="text-white/50 text-sm mt-2">
                A clear, descriptive title for this investment thesis
              </p>
            </div>

            <div>
              <label htmlFor="pdfUrl" className="block text-white/70 mb-2">
                PDF URL * (HTTPS only)
              </label>
              <input
                type="url"
                id="pdfUrl"
                name="pdfUrl"
                value={formData.pdfUrl}
                onChange={handleChange}
                placeholder="https://example.com/thesis.pdf"
                className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
              <p className="text-white/50 text-sm mt-2">
                <i className="fas fa-lock mr-1"></i>Must be HTTPS URL ending with .pdf
              </p>
              {formData.pdfUrl && (
                <div className="mt-3 p-3 bg-neutral-900/50 rounded border border-neutral-700/30">
                  <p className="text-sm text-white/70">
                    {isValidPdfUrl(formData.pdfUrl) ? (
                      <span className="text-green-400"><i className="fas fa-check mr-2"></i>Valid PDF URL</span>
                    ) : (
                      <span className="text-red-400"><i className="fas fa-times mr-2"></i>Invalid PDF URL</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
              >
                {isSaving ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                ) : (
                  <><i className="fas fa-check mr-2"></i>Save Changes</>
                )}
              </button>
              <Link href="/admin/investment-theses" className="flex-1 text-center bg-neutral-700/50 hover:bg-neutral-700/70 text-white py-3 px-4 rounded-lg transition-colors duration-200">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
