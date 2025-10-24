import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth'
import { useRouter } from 'next/router'

export default function InvestmentThesesAdmin() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [theses, setTheses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('Investment Theses')
  const [editingLabel, setEditingLabel] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [savingLabel, setSavingLabel] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin')
      return
    }
    
    if (!isAdmin) {
      router.push('/')
      return
    }

    fetchTheses()
    fetchConfig()
  }, [isAuthenticated, isAdmin, router])

  const fetchTheses = async () => {
    try {
      const response = await fetch('/api/admin/investment-theses')
      if (!response.ok) throw new Error('Failed to fetch theses')
      const data = await response.json()
      setTheses(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      const data = await response.json()
      setLabel(data.investmentThesesLabel)
      setNewLabel(data.investmentThesesLabel)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const deleteThesis = async (id) => {
    if (!confirm('Are you sure you want to delete this thesis?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/investment-theses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete thesis')

      setTheses(theses.filter(thesis => thesis.id !== id))
      setError('')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleSaveLabel = async () => {
    if (newLabel.trim() === label) {
      setEditingLabel(false)
      return
    }

    setSavingLabel(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ investmentThesesLabel: newLabel })
      })

      if (!response.ok) throw new Error('Failed to update label')

      const data = await response.json()
      setLabel(data.investmentThesesLabel)
      setEditingLabel(false)
      setError('')
    } catch (error) {
      setError(error.message)
    } finally {
      setSavingLabel(false)
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
        <title>Investment Theses - Admin - Wasiq Syed</title>
      </Head>
      
      <div className="py-10">
        <div className="flex items-center mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mr-4">
            <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
          </Link>
          <h1 className="text-3xl text-white font-semibold">Investment Theses</h1>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Label Configuration */}
        <div className="bg-neutral-800/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl text-white font-semibold mb-4">Section Label Configuration</h2>
          
          <div className="flex items-center space-x-3">
            {editingLabel ? (
              <>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  maxLength={100}
                  className="px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter label"
                />
                <button
                  onClick={handleSaveLabel}
                  disabled={savingLabel}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors duration-200"
                >
                  {savingLabel ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingLabel(false)
                    setNewLabel(label)
                  }}
                  className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-white/70 mb-2">Current Label:</p>
                  <p className="text-2xl text-white font-semibold">{label}</p>
                </div>
                <button
                  onClick={() => setEditingLabel(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <i className="fas fa-edit mr-2"></i>Edit Label
                </button>
              </>
            )}
          </div>
          <p className="text-white/50 text-sm mt-3">
            This label is displayed in the Projects section to identify the investment theses subsection.
          </p>
        </div>

        {/* Theses Management */}
        <div className="bg-neutral-800/10 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white font-semibold">Theses List</h2>
            <Link href="/admin/investment-theses/new" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200">
              <i className="fas fa-plus mr-2"></i>New Thesis
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-white/50"></i>
            </div>
          ) : theses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50">No investment theses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-neutral-700/50">
                    <th className="pb-3 text-white/70">Title</th>
                    <th className="pb-3 text-white/70">Author</th>
                    <th className="pb-3 text-white/70">Created</th>
                    <th className="pb-3 text-white/70">PDF</th>
                    <th className="pb-3 text-white/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {theses.map((thesis) => (
                    <tr key={thesis.id} className="border-b border-neutral-700/30 hover:bg-neutral-800/20 transition-colors">
                      <td className="py-4">
                        <p className="text-white font-medium">{thesis.title}</p>
                      </td>
                      <td className="py-4 text-white/70">{thesis.author?.username || 'Unknown'}</td>
                      <td className="py-4 text-white/70">
                        {new Date(thesis.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <a href={thesis.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                          <i className="fas fa-file-pdf mr-1"></i>View
                        </a>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Link href={`/admin/investment-theses/edit/${thesis.id}`} className="text-blue-400 hover:text-blue-300">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => deleteThesis(thesis.id)}
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
