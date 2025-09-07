import jwt from 'jsonwebtoken'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import Cookies from 'js-cookie'

// Auth context
const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Auto-logout after 4 hours of login (not just inactivity)
  const AUTO_LOGOUT_TIME = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute

  const logout = useCallback(() => {
    Cookies.remove('token')
    Cookies.remove('user')
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const updateActivity = useCallback(() => {
    const now = Date.now()
    setLastActivity(now)
    Cookies.set('lastActivity', now.toString(), { expires: 4/24 }) // 4 hours = 4/24 days
  }, [])

  const checkAuthStatus = useCallback(() => {
    const token = Cookies.get('token') || localStorage.getItem('token')
    const savedUser = Cookies.get('user')
    const savedLastActivity = Cookies.get('lastActivity')
    const loginTime = Cookies.get('loginTime')
    const cookieConsent = Cookies.get('cookieConsent')
    const cookieConsentStatus = Cookies.get('cookieConsentStatus')

    // Check if user has revoked cookie consent since login
    if (cookieConsentStatus === 'true' && (!cookieConsent || cookieConsent !== 'accepted')) {
      console.warn('Auto-logout: User revoked cookie consent')
      logout()
      setLoading(false)
      return
    }

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const decoded = jwt.decode(token)

        // Check if token is expired
        if (!decoded || decoded.exp <= Date.now() / 1000) {
          logout()
          return
        }

        const hasAcceptedCookies = cookieConsentStatus === 'true'

        // Check session duration based on cookie consent
        if (loginTime) {
          const loginTimestamp = parseInt(loginTime)
          const timeSinceLogin = Date.now() - loginTimestamp

          if (!hasAcceptedCookies && timeSinceLogin > AUTO_LOGOUT_TIME) {
            // Users without cookie consent get logged out after 4 hours
            console.warn('Auto-logout: 4-hour session expired (no cookie consent)')
            logout()
            return
          }
          // Users with cookie consent can stay logged in until cookies expire naturally
        }

        // Check inactivity timeout (applies to all users)
        if (savedLastActivity) {
          const lastActivityTime = parseInt(savedLastActivity)
          const timeSinceActivity = Date.now() - lastActivityTime

          if (timeSinceActivity > AUTO_LOGOUT_TIME) {
            console.warn('Auto-logout: Inactivity timeout')
            logout()
            return
          }

          setLastActivity(lastActivityTime)
        }

        setUser(userData)
        updateActivity() // Update activity on auth check

      } catch (error) {
        console.error('Auth check error:', error)
        logout()
      }
    }
    setLoading(false)
  }, [logout, updateActivity, AUTO_LOGOUT_TIME])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Set up activity monitoring
  useEffect(() => {
    if (!user) return

    const handleActivity = () => {
      updateActivity()
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [user, updateActivity])

  // Set up periodic activity and session check
  useEffect(() => {
    if (!user) return

    const intervalId = setInterval(() => {
      const savedLastActivity = Cookies.get('lastActivity')
      const loginTime = Cookies.get('loginTime')
      const cookieConsent = Cookies.get('cookieConsent')
      const cookieConsentStatus = Cookies.get('cookieConsentStatus')

      // Check if user has revoked cookie consent since login
      if (cookieConsentStatus === 'true' && (!cookieConsent || cookieConsent !== 'accepted')) {
        console.warn('Periodic check: User revoked cookie consent')
        logout()
        return
      }

      const hasAcceptedCookies = cookieConsentStatus === 'true'

      // Check session duration based on cookie consent
      if (loginTime && !hasAcceptedCookies) {
        const loginTimestamp = parseInt(loginTime)
        const timeSinceLogin = Date.now() - loginTimestamp

        if (timeSinceLogin > AUTO_LOGOUT_TIME) {
          console.warn('Periodic check: 4-hour session expired (no cookie consent)')
          logout()
          return
        }
      }

      // Check inactivity timeout (applies to all users)
      if (savedLastActivity) {
        const lastActivityTime = parseInt(savedLastActivity)
        const timeSinceActivity = Date.now() - lastActivityTime

        if (timeSinceActivity > AUTO_LOGOUT_TIME) {
          console.warn('Periodic check: Inactivity timeout')
          logout()
          return
        }
      }
    }, ACTIVITY_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [user, logout, AUTO_LOGOUT_TIME, ACTIVITY_CHECK_INTERVAL])

  const login = (token, userData) => {
    const cookieConsent = Cookies.get('cookieConsent')
    const hasAcceptedCookies = cookieConsent === 'accepted'

    // Determine cookie expiration based on consent
    const cookieExpiry = hasAcceptedCookies ? 7 : 4/24 // 7 days if accepted, 4 hours if not
    const cookieExpiryLabel = hasAcceptedCookies ? '7 days' : '4 hours'

    console.log(`Login: User ${hasAcceptedCookies ? 'has' : 'has not'} accepted cookies - session expires in ${cookieExpiryLabel}`)

    // Store login info
    Cookies.set('token', token, { expires: cookieExpiry, secure: true, sameSite: 'strict', httpOnly: true })
    Cookies.set('user', JSON.stringify(userData), { expires: cookieExpiry, secure: true, sameSite: 'strict', httpOnly: true })
    Cookies.set('loginTime', Date.now().toString(), { expires: cookieExpiry, secure: true, sameSite: 'strict', httpOnly: true })
    Cookies.set('cookieConsentStatus', hasAcceptedCookies.toString(), { expires: cookieExpiry, secure: true, sameSite: 'strict', httpOnly: true })
    localStorage.setItem('token', token)

    setUser(userData)
    updateActivity()
    return true // Always return true - allow login for all users
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateActivity,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    lastActivity
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}

// Server-side middleware
export const verifyToken = async (req) => {
  // Dynamic import to avoid loading Prisma on client side
  const { default: prisma } = await import('./db')
  
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'No token provided' }
  }

  try {
    // First decode without verification to get userId
    const unverified = jwt.decode(token)
    if (!unverified || !unverified.userId) {
      return { error: 'Invalid token format' }
    }

    // Get user's individual JWT secret from database
    const user = await prisma.user.findUnique({
      where: { id: unverified.userId },
      select: { jwtSecret: true, id: true, email: true, username: true, isAdmin: true }
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Verify token with user's individual secret
    const decoded = jwt.verify(token, user.jwtSecret)

    // Additional session hijacking protection
    if (!decoded.iat || !decoded.exp) {
      return { error: 'Invalid token structure' }
    }

    // Check if token was issued recently (within last 24 hours for additional security)
    const tokenAge = Date.now() / 1000 - decoded.iat
    if (tokenAge > 24 * 60 * 60) { // 24 hours
      return { error: 'Token too old, please login again' }
    }
    
    // Return the full user data from database (more secure than trusting token data)
    return { 
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }
    }
  } catch (error) {
    return { error: 'Invalid token' }
  }
}

export const requireAuth = (handler) => {
  return async (req, res) => {
    const { user, error } = await verifyToken(req)
    
    if (error) {
      return res.status(401).json({ error })
    }
    
    req.user = user
    return handler(req, res)
  }
}

export const requireAdmin = (handler) => {
  return async (req, res) => {
    const { user, error } = await verifyToken(req)

    if (error) {
      return res.status(401).json({ error })
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.user = user
    return handler(req, res)
  }
}

// CSRF token validation
export const validateCsrfToken = (req) => {
  const csrfToken = req.body?.csrfToken
  const cookieCsrfToken = req.cookies?.['csrf-token']

  if (!csrfToken || !cookieCsrfToken) {
    return { error: 'CSRF token missing' }
  }

  if (csrfToken !== cookieCsrfToken) {
    return { error: 'CSRF token invalid' }
  }

  return { valid: true }
}