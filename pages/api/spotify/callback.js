import { requireAuth } from '../../../lib/auth'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/spotify/callback`

export default async (req, res) => {
  const { code, error } = req.query

  if (error) {
    return res.status(400).json({ error: 'Spotify authentication failed', details: error })
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' })
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Store tokens in cookies (session-based, no user account needed)
    const isProduction = process.env.NODE_ENV === 'production'
    const secureCookie = isProduction ? 'Secure' : ''
    res.setHeader('Set-Cookie', [
      `spotify_access_token=${tokens.access_token}; Path=/; HttpOnly; ${secureCookie}; SameSite=Lax; Max-Age=${tokens.expires_in}`,
      `spotify_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; ${secureCookie}; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
      `spotify_token_expiry=${Date.now() + tokens.expires_in * 1000}; Path=/; HttpOnly; ${secureCookie}; SameSite=Lax; Max-Age=${tokens.expires_in}`
    ])

    // Redirect to the main Spotify page
    res.redirect('/spotify')

  } catch (error) {
    console.error('Spotify callback error:', error)
    res.status(500).json({ error: 'Failed to complete Spotify authentication' })
  }
}
