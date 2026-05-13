import express from "express";
import { createSpotifyClient } from "../spotifyClient.js";

const router = express.Router();

// -------------------------------
// TEMPORARY TOKEN STORAGE
// (Works on Render free tier)
// -------------------------------
let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = null;

// -------------------------------
// LOGIN — Redirect user to Spotify
// -------------------------------
router.get("/login", (req, res) => {
  const spotifyApi = createSpotifyClient();

  const scopes = [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played"
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state123");
  res.redirect(authorizeURL);
});

// -------------------------------
// CALLBACK — Spotify redirects here
// -------------------------------
router.get("/callback", async (req, res) => {
  const spotifyApi = createSpotifyClient();
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    accessToken = data.body.access_token;
    refreshToken = data.body.refresh_token;
    tokenExpiresAt = Date.now() + data.body.expires_in * 1000;

    res.send("Authentication successful. You can now use /artist routes.");
  } catch (err) {
    console.error("Error in /auth/callback:", err);
    res.status(500).send("Authentication failed");
  }
});

// -------------------------------
// TOKEN REFRESH HELPER
// -------------------------------
const refreshAccessToken = async () => {
  if (!refreshToken) throw new Error("No refresh token available");

  const spotifyApi = createSpotifyClient();
  spotifyApi.setRefreshToken(refreshToken);

  try {
    const data = await spotifyApi.refreshAccessToken();

    accessToken = data.body.access_token;
    tokenExpiresAt = Date.now() + data.body.expires_in * 1000;

    return accessToken;
  } catch (err) {
    console.error("Error refreshing access token:", err);
    throw err;
  }
};

// -------------------------------
// PROVIDE AUTHENTICATED CLIENT
// -------------------------------
export const getArtistSpotifyClient = async () => {
  if (!accessToken) {
    throw new Error("Artist not authenticated yet");
  }

  // Refresh token if expired
  if (Date.now() > tokenExpiresAt) {
    await refreshAccessToken();
  }

  const spotifyApi = createSpotifyClient();
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  return spotifyApi;
};

export default router;
