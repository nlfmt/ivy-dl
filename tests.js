const Downloader = require("./util/ytdl");

const dl = new Downloader("https://www.youtube.com/watch?v=JPEUmoMZeyY",{
    ytdlLoc: "./ext/yt-dlp.exe",
    ffmpegLoc: "./ext/ffmpeg.exe",
    quality: "bestaudio+worstvideo",
    format: "mp4",
    output: "testvideo"
});

dl.on("start", () => console.log("start"));
dl.on("pause", () => console.log("pause"));
dl.on("resume", () => console.log("resume"));
dl.on("stop", () => console.log("stop"));
dl.on("converting", () => console.log("converting"));
dl.on("done", () => console.log("done"));

dl.on("info", info => {
    console.log("Got Metadata:", info.title, info.uploader);
});

dl.on("progress", ({type, total, done, perc}) => {
    const percentage = Math.round(perc);
    if (type == "download")
        process.stdout.write(`\rDownloading.. ${done}B of ${total}B (${percentage}%)`);
    else
        process.stdout.write(`\rConverting.. ${done}s of ${total}s (${percentage}%)`);
});

dl.on("error", (e) => console.log("Downloader Error:", e));