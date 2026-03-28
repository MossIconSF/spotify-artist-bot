import express from "express";
import { getArtistSpotifyClient } from "./auth.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const client = await getArtistSpotifyClient();

    const [topTracks, topArtists, recent] = await Promise.all([
      client.getMyTopTracks({ limit: 10 }),
      client.getMyTopArtists({ limit: 10 }),
      client.getMyRecentlyPlayedTracks({ limit: 20 })
    ]);

    res.json({
      topTracks: topTracks.body.items,
      topArtists: topArtists.body.items,
      recent: recent.body.items
    });
  } catch (err) {
    console.error(err?.body || err);
    res.status(500).json({ error: "Failed to fetch artist summary" });
  }
});

router.get("/playlists", async (req, res) => {
  try {
    const client = await getArtistSpotifyClient();
    const playlists = await client.getUserPlaylists({ limit: 20 });
    res.json(playlists.body.items);
  } catch (err) {
    console.error(err?.body || err);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

export default router;