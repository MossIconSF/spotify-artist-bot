import express from "express";
import { createSpotifyClient } from "../spotifyClient.js";

const router = express.Router();
const scopes = [
  "user-read-email",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative"
  "user-follow-read"
];

const spotifyApi = createSpotifyClient();

// demo in-memory store – replace with DB if you go production
let tokensByUser = {};

router.get("/login", (req, res) => {
  const state = "artist-bot-state";
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    tokensByUser["demo-artist"] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    };

    res.send("Authenticated with Spotify. Try /artist/summary");
  } catch (err) {
    console.error(err?.body || err);
    res.status(400).send("Error authenticating with Spotify");
  }
});

export const getArtistSpotifyClient = async () => {
  const tokens = tokensByUser["demo-artist"];
  if (!tokens) throw new Error("Artist not authenticated yet");

  const client = createSpotifyClient();
  client.setAccessToken(tokens.accessToken);
  client.setRefreshToken(tokens.refreshToken);

  if (Date.now() > tokens.expiresAt - 60_000) {
    const data = await client.refreshAccessToken();
    const { access_token, expires_in } = data.body;
    tokens.accessToken = access_token;
    tokens.expiresAt = Date.now() + expires_in * 1000;
    client.setAccessToken(access_token);
  }

  return client;
};

export default router;
