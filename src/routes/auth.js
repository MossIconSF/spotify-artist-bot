import express from "express";
import { createSpotifyClient } from "../spotifyClient.js";

const router = express.Router();

const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-follow-read",
  "user-read-recently-played",
  "user-top-read"
];

let tokensByUser = {};

router.get("/login", (req, res) => {
  const state = "artist-bot-state";
  const spotifyApi = createSpotifyClient();
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const spotifyApi = createSpotifyClient();
    const data = await spotifyApi.authorizationCodeGrant(code);

    const { access_token, refresh_token, expires_in } = data.body;

    tokensByUser["demo-artist"] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    };

    console.log("Stored tokens:", tokensByUser["demo-artist"]);

    res.send("Authenticated with Spotify. Try /artist/summary");
  } catch (err) {
    console.error("Auth error:", err?.body || err);
    res.status(400).send("Error authenticating with Spotify");
  }
});

export const getArtistSpotifyClient = async () => {
  const tokens = tokensByUser["demo-artist"];
  console.log("Loaded tokens:", tokens);

  if (!tokens) throw new Error("Artist not authenticated yet");

  const client = createSpotifyClient();
  client.setAccessToken(tokens.accessToken);
  client.setRefreshToken(tokens.refreshToken);

  console.log("Client access token set:", client.getAccessToken());

  if (Date.now() > tokens.expiresAt - 60_000) {
    const data = await client.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    tokens.accessToken = access_token;
    tokens.expiresAt = Date.now() + expires_in * 1000;

    client.setAccessToken(access_token);

    console.log("Refreshed access token:", access_token);
  }

  return client;
};

export default router;
