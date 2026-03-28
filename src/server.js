import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
const artistRoutes = require("./routes/artist.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    `<h1>Spotify Artist Bot</h1>
     <p><a href="/auth/login">Login with Spotify</a></p>
     <p>After login, try <code>/artist/summary</code> or <code>/artist/playlists</code>.</p>`
  );
});

app.use("/auth", authRoutes);
app.use("/artist", artistRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
