const Downloader = require("./util/ytdl");

const dl = new Downloader("https://www.youtube.com/watch?v=UP2XoGfhJ1Y",{
    ytdlLoc: "./ext/yt-dlp.exe",
    quality: "bestaudio+bestvideo",
    format: "mp4"
});

dl.on("info", info => {
    console.log("Got Metadata:", info.title, info.uploader);
});

dl.on("progress", (total, downloaded) => {
    const percentage = Math.round((downloaded / total) * 100);
    process.stdout.write(`\rDownloaded ${downloaded}B of ${total}B (${percentage}%)`);
});

dl.on("error", (e) => console.log("Downloader Error:", e));