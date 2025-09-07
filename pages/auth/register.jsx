import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
// Removed HCaptcha import - using HTML-based approach
import { useAuth } from '../../lib/auth'

export default function Register() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [hcaptchaToken, setHcaptchaToken] = useState('')
  const hcaptchaRef = useRef(null)

  // Set up hCaptcha callbacks when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onHCaptchaVerify = (token) => {
        console.log('hCaptcha verified with token:', token)
        setHcaptchaToken(token)
        if (errors.captcha) {
          setErrors(prev => ({ ...prev, captcha: '' }))
        }
      }

      window.onHCaptchaExpire = () => {
        console.log('hCaptcha expired')
        setHcaptchaToken('')
      }
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.onHCaptchaVerify = null
        window.onHCaptchaExpire = null
      }
    }
  }, [errors.captcha])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!hcaptchaToken) {
      newErrors.captcha = 'Please complete the captcha'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          hcaptchaToken
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-login after registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          hcaptchaToken
        }),
      })

      const loginData = await loginResponse.json()

      if (loginResponse.ok) {
        // Login all users - session duration depends on cookie consent
        login(loginData.token, loginData.user)
        router.push('/')
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      setErrors({ general: error.message })
      hcaptchaRef.current?.resetCaptcha()
      setHcaptchaToken('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Register - Wasiq Syed</title>
        <meta name="description" content="Create an account to access exclusive content and features." />
      </Head>
      
      <div className="py-20">
        <div className="max-w-md mx-auto bg-neutral-800/10 p-8 rounded-lg">
          <h1 className="text-3xl text-white font-semibold text-center mb-8">Register</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white/70 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none transition-colors duration-200 text-white ${
                  errors.email ? 'border-red-500' : 'border-neutral-700/50 focus:border-neutral-500'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

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
                className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none transition-colors duration-200 text-white ${
                  errors.username ? 'border-red-500' : 'border-neutral-700/50 focus:border-neutral-500'
                }`}
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-white/70 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none transition-colors duration-200 text-white ${
                  errors.password ? 'border-red-500' : 'border-neutral-700/50 focus:border-neutral-500'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white/70 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-800/20 border rounded-lg focus:outline-none transition-colors duration-200 text-white ${
                  errors.confirmPassword ? 'border-red-500' : 'border-neutral-700/50 focus:border-neutral-500'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex justify-center">
              <div
                className="h-captcha"
                data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
                data-theme="dark"
                data-callback="onHCaptchaVerify"
                data-expired-callback="onHCaptchaExpire"
                suppressHydrationWarning
              ></div>
            </div>
            {errors.captcha && <p className="text-red-400 text-sm text-center">{errors.captcha}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-white/50 text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}