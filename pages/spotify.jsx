import { useState, useEffect } from 'react'

export default function SpotifyPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/spotify')
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        setError(result)
      }
    } catch (err) {
      setError({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action, trackUri = null) => {
    try {
      const url = trackUri
        ? `/api/spotify?action=${action}&trackUri=${encodeURIComponent(trackUri)}`
        : `/api/spotify?action=${action}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        // Refresh data to show updated state
        fetchData()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const authenticateWithSpotify = async () => {
    try {
      const response = await fetch('/api/spotify/auth')
      const result = await response.json()

      if (response.ok) {
        window.location.href = result.authUrl
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Spotify Integration</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Spotify Integration</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error && error.authUrl) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Spotify Integration</h1>
        <p>{error.error}</p>
        <button
          onClick={authenticateWithSpotify}
          style={{ padding: '10px 20px', background: '#1db954', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Authenticate with Spotify
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Spotify Integration</h1>
        <pre style={{ color: 'red' }}>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Spotify Integration</h1>
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Spotify Integration</h1>

      {/* Controls Section */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Controls</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {data.currentlyPlaying?.is_playing && (
            <button
              onClick={() => handleAction('pause')}
              style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ⏸️ Pause Current Track
            </button>
          )}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Use the API endpoints below to play specific tracks
          </div>
        </div>
      </div>

      {/* Currently Playing */}
      {data.currentlyPlaying && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '4px', border: '1px solid rgba(40, 167, 69, 0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Currently Playing</h2>
          {data.currentlyPlaying.item ? (
            <div>
              <strong>{data.currentlyPlaying.item.name}</strong> by {data.currentlyPlaying.item.artists.map(a => a.name).join(', ')}
              <br />
              <small>Album: {data.currentlyPlaying.item.album.name}</small>
              <br />
              <small>Status: {data.currentlyPlaying.is_playing ? '▶️ Playing' : '⏸️ Paused'}</small>
            </div>
          ) : (
            <div>No track currently playing</div>
          )}
        </div>
      )}

      {/* Top 10 Tracks */}
      {data.topTracks?.items && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Top 10 Tracks</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {data.topTracks.items.map((track, index) => (
              <div key={track.id} style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <strong>{index + 1}. {track.name}</strong>
                  <br />
                  <small>{track.artists.map(a => a.name).join(', ')} • {track.album.name}</small>
                </div>
                <button
                  onClick={() => handleAction('play', track.uri)}
                  style={{
                    padding: '6px 12px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ▶️ Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Followed Artists */}
      {data.followedArtists?.artists?.items && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(23, 162, 184, 0.1)', borderRadius: '4px', border: '1px solid rgba(23, 162, 184, 0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Followed Artists ({data.followedArtists.artists.items.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {data.followedArtists.artists.items.map((artist) => (
              <div key={artist.id} style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <strong>{artist.name}</strong>
                <br />
                <small>Followers: {artist.followers.total.toLocaleString()}</small>
                {artist.genres && artist.genres.length > 0 && (
                  <>
                    <br />
                    <small>Genres: {artist.genres.slice(0, 2).join(', ')}</small>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON Response */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Pretty Print JSON Response</h2>
        <pre style={{
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px',
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
