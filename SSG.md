# Spotify Integration Setup Guide

This guide will help you set up **public Spotify API integration** for your personal website. Anyone can access and control Spotify playback without needing to log in to your website.

## Prerequisites

1. A Spotify Developer account
2. A registered Spotify application
3. Environment variables configured

## Step 1: Create a Spotify Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in the app details:
   - **App name**: Your Website Name + "Integration" (e.g., "My Portfolio Spotify Integration")
   - **App description**: "Spotify integration for personal website"
   - **Redirect URI**: `http://localhost:3000/api/spotify/callback` (for development)
4. Note down your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Development (.env file)

Add the following to your `.env` file in the project root:

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID="your-spotify-client-id-here"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret-here"
SPOTIFY_REDIRECT_URI="http://localhost:3000/api/spotify/callback"
```

### Production (.env.production file)

Copy the template and configure for production:

```bash
cp config/production-template.env .env.production
```

Edit `.env.production` and update the Spotify variables:

```env
SPOTIFY_CLIENT_ID="your-production-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-production-spotify-client-secret"
SPOTIFY_REDIRECT_URI="https://yourdomain.com/api/spotify/callback"
```

**Important**: Use different Spotify applications for development and production with their respective redirect URIs.

## Step 3: Update Spotify App Settings

For production, update your Spotify app's redirect URI:

1. Go back to your Spotify app in the developer dashboard
2. Add the production redirect URI: `https://yourdomain.com/api/spotify/callback`
3. Save the changes

## Step 4: Database Migration

The database schema has been updated to include Spotify token fields. If you haven't run the migration yet:

```bash
npm run db:push
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate directly to `/spotify` (no login required)

3. Click "Authenticate with Spotify" and follow the OAuth flow

4. Once authenticated, you'll see your:
   - Top 10 tracks
   - Currently playing song
   - Followed artists
   - Playback controls

**Note**: Anyone visiting `/spotify` can authenticate with their own Spotify account and control their own playback.

## API Endpoints

### GET /api/spotify
Returns comprehensive Spotify data including top tracks, currently playing, and followed artists.

**Response Format:**
```json
{
  "topTracks": {
    "items": [...],
    "total": 50,
    "limit": 10,
    "offset": 0
  },
  "currentlyPlaying": {
    "is_playing": true,
    "progress_ms": 45000,
    "item": {...},
    "device": {...}
  },
  "followedArtists": {
    "artists": {
      "items": [...],
      "total": 25,
      "limit": 50,
      "offset": 0
    }
  },
  "controls": {
    "pause": {
      "url": "/api/spotify?action=pause",
      "method": "POST"
    },
    "play": {
      "url": "/api/spotify?action=play&trackUri={trackUri}",
      "method": "POST",
      "description": "Replace {trackUri} with the URI of the track to play"
    }
  }
}
```

### POST /api/spotify?action=pause
Pauses the currently playing track.

### POST /api/spotify?action=play&trackUri={uri}
Starts playing a specific track by URI.

### GET /api/spotify/auth
Returns the Spotify OAuth authorization URL for authentication.

### GET /api/spotify/callback
Handles the OAuth callback and stores tokens.

## Features

- **Top Tracks**: Shows your top 10 most played tracks (short_term)
- **Now Playing**: Displays current playback status and track info
- **Followed Artists**: Lists all artists you follow
- **Playback Control**: Pause current track or start playing any top track
- **Auto Token Refresh**: Automatically refreshes expired Spotify tokens
- **Secure Storage**: Tokens stored securely in the database

## Troubleshooting

### "No Spotify access token found" Error
- User needs to authenticate with Spotify first
- Click "Authenticate with Spotify" button on the /spotify page

### "Invalid redirect URI" Error
- Check that your redirect URI in Spotify app settings matches the SPOTIFY_REDIRECT_URI environment variable
- For development: `http://localhost:3000/api/spotify/callback`
- For production: `https://yourdomain.com/api/spotify/callback`

### Token Expiration Issues
- Tokens are automatically refreshed when needed
- If issues persist, re-authenticate with Spotify

### API Rate Limiting
- Spotify API has rate limits; the integration handles this gracefully
- If you hit limits, wait a few minutes before retrying

## Security Notes

- Spotify tokens are stored in HttpOnly, Secure cookies for the current session
- OAuth flow uses standard Spotify OAuth for security
- Tokens are automatically refreshed before expiration
- **Public access**: No website authentication required
- Each visitor authenticates with their own Spotify account
- All API calls are made server-side to protect client secrets
