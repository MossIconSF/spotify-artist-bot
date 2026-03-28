const express = require('express');
const router = express.Router();
const spotifyApi = require('../spotifyClient');

/**
 * GET /artist/summary
 * Existing generic summary route (kept for reference / testing)
 */
router.get('/summary', async (req, res) => {
  try {
    const [topArtists, topTracks, recentlyPlayed] = await Promise.all([
      spotifyApi.getMyTopArtists({ limit: 10 }),
      spotifyApi.getMyTopTracks({ limit: 10 }),
      spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 })
    ]);

    res.json({
      topArtists: topArtists.body.items,
      topTracks: topTracks.body.items,
      recentlyPlayed: recentlyPlayed.body.items
    });
  } catch (err) {
    console.error('Error in /artist/summary:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /artist/playlists
 * Existing playlists route (kept for reference / testing)
 */
router.get('/playlists', async (req, res) => {
  try {
    const playlists = await spotifyApi.getUserPlaylists({ limit: 50 });
    res.json(playlists.body.items);
  } catch (err) {
    console.error('Error in /artist/playlists:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * YOUR ARTIST ID
 * 4OTgA6WkMDc6zYL0mRQpWl
 */
const MY_ARTIST_ID = '4OTgA6WkMDc6zYL0mRQpWl';

/**
 * GET /artist/my-dashboard
 * Core dashboard for YOU as the artist.
 * Returns:
 *  - artist profile
 *  - top tracks
 *  - albums & singles
 *  - related artists
 */
router.get('/my-dashboard', async (req, res) => {
  try {
    const [artist, topTracks, albums, related] = await Promise.all([
      spotifyApi.getArtist(MY_ARTIST_ID),
      spotifyApi.getArtistTopTracks(MY_ARTIST_ID, 'US'),
      spotifyApi.getArtistAlbums(MY_ARTIST_ID, {
        include_groups: 'album,single',
        limit: 50
      }),
      spotifyApi.getArtistRelatedArtists(MY_ARTIST_ID)
    ]);

    res.json({
      artist: artist.body,
      topTracks: topTracks.body.tracks,
      albums: albums.body.items,
      relatedArtists: related.body.artists
    });
  } catch (err) {
    console.error('Error in /artist/my-dashboard:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /artist/my-audio-features
 * Audio features for your top tracks:
 *  - danceability, energy, tempo, valence, etc.
 */
router.get('/my-audio-features', async (req, res) => {
  try {
    const topTracks = await spotifyApi.getArtistTopTracks(MY_ARTIST_ID, 'US');
    const tracks = topTracks.body.tracks || [];
    const trackIds = tracks.map(t => t.id);

    if (trackIds.length === 0) {
      return res.json({ tracks: [], audioFeatures: [] });
    }

    const features = await spotifyApi.getAudioFeaturesForTracks(trackIds);

    res.json({
      tracks,
      audioFeatures: features.body.audio_features
    });
  } catch (err) {
    console.error('Error in /artist/my-audio-features:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /artist/my-releases
 * Your albums & singles sorted by release date (newest first).
 */
router.get('/my-releases', async (req, res) => {
  try {
    const albums = await spotifyApi.getArtistAlbums(MY_ARTIST_ID, {
      include_groups: 'album,single,appears_on,compilation',
      limit: 50
    });

    const items = (albums.body.items || []).sort((a, b) => {
      return new Date(b.release_date) - new Date(a.release_date);
    });

    res.json(items);
  } catch (err) {
    console.error('Error in /artist/my-releases:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
