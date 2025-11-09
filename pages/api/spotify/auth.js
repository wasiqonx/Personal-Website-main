// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/spotify/callback`

export default async (req, res) => {
  // Generate Spotify authorization URL
  const scope = 'user-read-private user-read-email user-top-read user-read-playback-state user-modify-playback-state user-follow-read'
  const authUrl = `https://accounts.spotify.com/authorize?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: 'public' // Public access, no user ID needed
    }).toString()

  res.status(200).json({
    authUrl,
    message: 'Redirect to this URL to authenticate with Spotify'
  })
}
