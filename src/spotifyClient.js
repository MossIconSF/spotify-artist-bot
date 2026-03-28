import SpotifyWebApi from "spotify-web-api-node";

export const createSpotifyClient = () =>
  new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
  });

// Default client instance (used by artist.js)
const spotifyApi = createSpotifyClient();
export default spotifyApi;
