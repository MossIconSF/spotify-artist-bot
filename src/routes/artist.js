import express from "express";
import { getArtistSpotifyClient } from "./auth.js";

const router = express.Router();

/**
 * ARTIST SUMMARY — works for artist accounts
 */
router.get("/summary", async (req, res) => {
  try {
    const spotifyApi = await getArtistSpotifyClient();

    const me = await spotifyApi.getMe();
    const artistId = me.body.id;

    const artist = await spotifyApi.getArtist(artistId);
    const topTracks = await spotifyApi.getArtistTopTracks(artistId, "US");
    const albums = await spotifyApi.getArtistAlbums(artistId, { limit: 10 });
    const related = await spotifyApi.getArtistRelatedArtists(artistId);

    res.json({
      artist: artist.body,
      topTracks: topTracks.body.tracks,
      albums: albums.body.items,
      relatedArtists: related.body.artists
    });

  } catch (err) {
    console.error("Error in /artist/summary:", err);
    res.status(500).json({
      error: err.message || "Unknown error",
      details: err.body || err
    });
  }
});

/**
 * ARTIST RELEASES
 */
router.get("/my-releases", async (req, res) => {
  try {
    const spotifyApi = await getArtistSpotifyClient();
    const me = await spotifyApi.getMe();
    const artistId = me.body.id;

    const albums = await spotifyApi.getArtistAlbums(artistId, { limit: 20 });

    res.json(albums.body.items);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.body || err });
  }
});

/**
 * ARTIST TOP TRACKS
 */
router.get("/my-top-tracks", async (req, res) => {
  try {
    const spotifyApi = await getArtistSpotifyClient();
    const me = await spotifyApi.getMe();
    const artistId = me.body.id;

    const topTracks = await spotifyApi.getArtistTopTracks(artistId, "US");

    res.json(topTracks.body.tracks);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.body || err });
  }
});

/**
 * ARTIST RELATED ARTISTS
 */
router.get("/related", async (req, res) => {
  try {
    const spotifyApi = await getArtistSpotifyClient();
    const me = await spotifyApi.getMe();
    const artistId = me.body.id;

    const related = await spotifyApi.getArtistRelatedArtists(artistId);

    res.json(related.body.artists);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.body || err });
  }
});

export default router;
