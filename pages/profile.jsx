import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useAuth } from '../lib/auth'

export default function Profile() {
  const { user, isAuthenticated, login } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hcaptchaToken, setHcaptchaToken] = useState('')
  const hcaptchaRef = useRef(null)

  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile')
      return
    }

    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.user)
      setFormData(prev => ({
        ...prev,
        username: data.user.username
      }))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password required to change password')
        return false
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return false
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return false
      }
    }

    if (!hcaptchaToken) {
      setError('Please complete the captcha')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        username: formData.username,
        hcaptchaToken
      }

      // Only include password fields if user wants to change password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(data.user)
      setSuccess('Profile updated successfully!')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      // Reset captcha
      hcaptchaRef.current?.resetCaptcha()
      setHcaptchaToken('')

      // Update auth context if username changed
      if (data.usernameChanged) {
        login(token, { ...user, username: data.user.username })
      }

    } catch (error) {
      setError(error.message)
      hcaptchaRef.current?.resetCaptcha()
      setHcaptchaToken('')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="py-20 text-center">
      <p className="text-xl text-white/50">Please log in to view your profile</p>
    </div>
  }

  if (loading) {
    return <div className="py-20 text-center">
      <i className="fas fa-spinner fa-spin text-2xl text-white/50"></i>
    </div>
  }

  return (
    <>
      <Head>
        <title>Profile Settings - Wasiq Syed</title>
        <meta name="description" content="Update your profile settings and change your password." />
      </Head>
      
      <div className="py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl text-white font-semibold mb-8">Profile Settings</h1>

          {profile && (
            <div className="bg-neutral-800/10 p-6 rounded-lg mb-8">
              <h2 className="text-xl text-white font-semibold mb-4">Account Information</h2>
              <div className="space-y-2 text-white/70">
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Current Username:</strong> {profile.username}</p>
                <p><strong>Account Type:</strong> {profile.isAdmin ? '👑 Admin' : '👤 User'}</p>
                <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="bg-neutral-800/10 p-6 rounded-lg">
            <h2 className="text-xl text-white font-semibold mb-6">Update Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-600/20 border border-green-600/50 text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-white/70 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:border-neutral-500 text-white"
                  placeholder="Enter new username"
                  required
                />
              </div>

              <div className="border-t border-neutral-700/50 pt-6">
                <h3 className="text-lg text-white font-medium mb-4">Change Password (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-white/70 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:border-neutral-500 text-white"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-white/70 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:border-neutral-500 text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-white/70 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-800/20 border border-neutral-700/50 rounded-lg focus:outline-none focus:border-neutral-500 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  ref={hcaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || 'f004cc1c-169e-4bea-b1da-b2a21d92d49a'}
                  onVerify={setHcaptchaToken}
                  onExpire={() => setHcaptchaToken('')}
                  theme="dark"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                {saving ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}