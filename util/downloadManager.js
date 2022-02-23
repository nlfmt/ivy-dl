const Ytdl = require("./ytdl");

const os = require("os");
const fs = require("fs");

const logger = require("./logger");
const listener = require("./listener");

var ipc;
var window;



// TODO:
// Save the download in the electron part, only give updates to the javascript, so we can implement a
// load function here that maybe only loads a part of the downloads
// implement sorting! (Object.values())
// function loadDownloads(sortType, maxElements, from) {};


// Handle option changes
let downloadOptions = {
    path: `${os.homedir()}/Downloads/IvyDl Videos`,
    
    quality: "best", // TODO best, good, medium, low, worst, custom
    audio: "best", // individual quality only valid when quality=custom
    video: "best",
    
    autoconvert: true,
    format: "mp4",
    ytdlLoc: "./ext/yt-dlp.exe",
}



// TODO: get default settings from settings tab
let downloaders = [];
let downloads = {};

function setStatus(url, status) {
    for (const dl of Object.values(downloads)) {
        if (dl.url != url) continue;
        dl.status = status;
    }
    window.webContents.send(`status:${url}`, status);
}

function dispatchTotalProgress() {

    if (downloaders.length == 0) return window.webContents.send("progress:total", {
        done: 0,
        total: 0,
        perc: 0
    });

    let done = 0;
    let total = 0;
    for (const dl of downloaders) {
        if (!dl.progress) continue;
        done += dl.progress.done;
        total += dl.progress.total;
    }

    window.webContents.send("progress:total", {
        done,
        total,
        perc: (done / total) * 100
    });
}

function newDownload(url, opts) {

    if (!listener.isValidUrl(url)) return logger.warn("Invalid url: " + url);

    logger.info(`Downloading ${url}`);
    
    const date = new Date();
    const dl = new Ytdl(url, opts);

    downloaders.push(dl);

    // TODO: What to send to ui when download start but no info present
     window.webContents.send("download:new", {
        url,
        opts,
        info: {}
    });
    
    dl.on("start", () => setStatus(url, "start"));
    dl.on("pause", () => setStatus(url, "pause"));
    dl.on("resume", () => setStatus(url, "resume"));
    dl.on("converting", () => setStatus(url, "converting"));
    dl.on("stop", () => {
        downloaders.splice(downloaders.indexOf(dl), 1);
        setStatus(url, "stop");
        dispatchTotalProgress();
    });
    dl.on("done", () => {
        downloaders.splice(downloaders.indexOf(dl), 1);
        setStatus(url, "done");
        dispatchTotalProgress();
    });
    
    dl.on("progress", (progress) => {
        window.webContents.send(`progress:${url}`, progress);
        dl.progress = progress;
        dispatchTotalProgress();
    });
    
    // TODO: download structure? all info top level or in separate dict? how much info, RENAME OR NOT?
    dl.on("info", (i) => {
        
        const download = {
            url,
            date,
            opts,
            
            status: "initializing",
            
            title: i.title,
            thumbnail: i.thumbnail,
            description: i.description,
            
            likes: i.like_count,
            dislikes: i.dislike_count,
            views: i.view_count,
            resolution: i.resolution,

            website: i.extractor_key,
            duration: i.duration,
            
            
            uploader: i.uploader,
            uploaderUrl: i.uploader_url,
            
            size: i.filesize || i.filesize_approx,
            format: opts.format,
            
            
            // TODO: file size, formats?
            
        }
        
        window.webContents.send(`info:${url}`, download);
        
        downloads[`${date} ${url}`] = download;
    })
    
    dl.on("error", err => {
        logger.error("ytdl error", err);
        setStatus(url, "error");
        downloaders.splice(downloaders.indexOf(dl), 1);
    })

}

function pause(url) {
    const dl = downloaders.find(d => d.url == url);
    dl.pause();
}
function resume(url) {
    const dl = downloaders.find(d => d.url == url);
    dl.resume();
}
// TODO: make ytdl stop the converter aswell
function stop(url) {
    const dl = downloaders.find(d => d.url == url);
    dl.stop();
}


function cacheDownloads() {
    fs.writeFileSync("./downloads.json", JSON.stringify(downloads));
}

function init(_window, _ipc) {

    window = _window;
    ipc = _ipc;

    // Load downloads
    if (fs.existsSync("./downloads.json")) {
        downloads = JSON.parse(fs.readFileSync("./downloads.json"));
    }

    // Download Settings change
    ipc.on("settings:download", (e, opts) => {
        Object.assign(downloadOptions, opts);
    });

    // toggle the listener
    ipc.on("listener:toggle", () => listener.toggle());
    listener.onURL(url => {
        newDownload(url, downloadOptions);
    });

    // download a video
    ipc.on("download:new", (event, url, opts) => {
        if (!opts) opts = downloadOptions;
        newDownload(url, opts);
    });

    ipc.on("download:pause", (_, url) => pause(url));
    ipc.on("download:resume", (_, url) => resume(url));
    ipc.on("download:stop", (_, url) => stop(url));

    ipc.on("downloads:load", () => {
        window.send("downloads:load", Object.values(downloads));
    });
}


module.exports = {
    init,
    newDownload,
    cacheDownloads
}