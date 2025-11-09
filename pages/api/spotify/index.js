// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/spotify/callback`

// Helper function to get Spotify access token
async function getSpotifyAccessToken(req, res) {
  // Get tokens from cookies
  const accessToken = req.cookies['spotify_access_token']
  const refreshToken = req.cookies['spotify_refresh_token']
  const tokenExpiry = req.cookies['spotify_token_expiry']

  if (!accessToken) {
    throw new Error('No Spotify access token found. Please authenticate with Spotify first.')
  }

  // Check if token is expired or will expire in the next 5 minutes
  const now = new Date()
  const expiryTime = new Date(parseInt(tokenExpiry))
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  if (expiryTime <= fiveMinutesFromNow) {
    // Token is expired or will expire soon, refresh it
    const refreshedToken = await refreshSpotifyToken(refreshToken)

    // Store refreshed tokens in cookies
    res.setHeader('Set-Cookie', [
      `spotify_access_token=${refreshedToken.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${refreshedToken.expires_in}`,
      `spotify_refresh_token=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`, // 30 days
      `spotify_token_expiry=${Date.now() + refreshedToken.expires_in * 1000}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${refreshedToken.expires_in}`
    ])

    return refreshedToken.access_token
  }

  return accessToken
}

// Helper function to refresh Spotify token
async function refreshSpotifyToken(refreshToken) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Spotify token')
  }

  return await response.json()
}

// Helper function to make Spotify API requests
async function spotifyApiRequest(endpoint, accessToken, method = 'GET', body = null) {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Spotify API error: ${response.status} ${error}`)
  }

  return await response.json()
}

export default async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken(req, res)

    const { action, trackUri } = req.query

    // Handle different actions
    if (req.method === 'POST') {
      if (action === 'pause') {
        await spotifyApiRequest('/me/player/pause', accessToken, 'PUT')
        return res.status(200).json({ success: true, message: 'Playback paused' })
      }

      if (action === 'play' && trackUri) {
        // Start playing a specific track
        const body = {
          uris: [trackUri],
          position_ms: 0
        }
        await spotifyApiRequest('/me/player/play', accessToken, 'PUT', body)
        return res.status(200).json({ success: true, message: 'Track started playing' })
      }
    }

    // Get all data in parallel
    const [topTracks, currentlyPlaying, followedArtists] = await Promise.all([
      // Get top 10 tracks
      spotifyApiRequest('/me/top/tracks?limit=10&time_range=short_term', accessToken),

      // Get currently playing track
      spotifyApiRequest('/me/player/currently-playing', accessToken).catch(() => null),

      // Get followed artists
      spotifyApiRequest('/me/following?type=artist&limit=50', accessToken)
    ])

    const response = {
      topTracks: {
        items: topTracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images
          },
          duration_ms: track.duration_ms,
          external_urls: track.external_urls,
          uri: track.uri,
          preview_url: track.preview_url
        })),
        total: topTracks.total,
        limit: topTracks.limit,
        offset: topTracks.offset
      },
      currentlyPlaying: currentlyPlaying ? {
        is_playing: currentlyPlaying.is_playing,
        progress_ms: currentlyPlaying.progress_ms,
        item: currentlyPlaying.item ? {
          id: currentlyPlaying.item.id,
          name: currentlyPlaying.item.name,
          artists: currentlyPlaying.item.artists.map(artist => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: currentlyPlaying.item.album.id,
            name: currentlyPlaying.item.album.name,
            images: currentlyPlaying.item.album.images
          },
          duration_ms: currentlyPlaying.item.duration_ms,
          external_urls: currentlyPlaying.item.external_urls,
          uri: currentlyPlaying.item.uri
        } : null,
        device: currentlyPlaying.device ? {
          id: currentlyPlaying.device.id,
          name: currentlyPlaying.device.name,
          type: currentlyPlaying.device.type,
          volume_percent: currentlyPlaying.device.volume_percent
        } : null
      } : null,
      followedArtists: {
        artists: {
          items: followedArtists.artists.items.map(artist => ({
            id: artist.id,
            name: artist.name,
            images: artist.images,
            external_urls: artist.external_urls,
            followers: artist.followers,
            genres: artist.genres,
            popularity: artist.popularity
          })),
          total: followedArtists.artists.total,
          limit: followedArtists.artists.limit,
          offset: followedArtists.artists.offset
        }
      },
      controls: {
        pause: {
          url: `/api/spotify?action=pause`,
          method: 'POST'
        },
        play: {
          url: `/api/spotify?action=play&trackUri={trackUri}`,
          method: 'POST',
          description: 'Replace {trackUri} with the URI of the track to play'
        }
      }
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Spotify API error:', error)
    res.status(500).json({
      error: error.message,
      authenticated: false,
      authUrl: `/api/spotify/auth`
    })
  }
}
