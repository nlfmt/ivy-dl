const fs = require("fs");
const ytdl = require('ytdl-core');

// Try to download age restricted video...
let url = "https://www.youtube.com/watch?v=4-lk752FNto";

let stream = ytdl(url, {
    quality: "highestaudio"
});

var lastDowloaded = 0;
var lastTime = new Date();

stream.on("progress", (chunkLength, downloaded, total) => {
    let deltaTime = new Date() - lastTime;
    let deltaDownloaded = downloaded - lastDowloaded;
    let speed = (deltaDownloaded / 1024) / (deltaTime / 1000);
    console.log(`Downloading: ${downloaded} / ${total} [${Math.round((speed))} KB/s]`);
    lastTime = new Date();
    lastDowloaded = downloaded;
});

stream.pipe(fs.createWriteStream("video.mp3"));