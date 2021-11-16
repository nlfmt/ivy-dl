const fs = require("fs");
const ytdl = require('ytdl-core');

// Try to download age restricted video...
let url = "https://www.youtube.com/watch?v=A7n8pHO3w_k&t=45s";

let stream = ytdl(url, {
    quality: "highestaudio+highestvideo"
});

stream.pipe(fs.createWriteStream("video.mp4"));