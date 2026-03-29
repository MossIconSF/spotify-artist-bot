import SpotifyWebApi from "spotify-web-api-node";

export const createSpotifyClient = () => {
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "https://spotify-artist-bot.onrender.com/auth/callback"
  });
};
