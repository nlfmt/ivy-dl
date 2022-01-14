const Ytdl = require("./ytdl");
const Conv = require("./conv");

const os = require("os");

const logger = require("./logger");
const listener = require("./listener");
const { Pause } = require("@material-ui/icons");

var ipc;
var window;



// TODO:
// Save the download in the electron part, only give updates to the javascript, so we can implement a
// load function here that maybe only loads a part of the downloads
// implement sorting! (Object.values())
// function loadDownloads(sortType, maxElements, from) {};


// Handle option changes
let downloadOptions = {
    output: `${os.homedir()}/Downloads`,
    
    quality: "best", // TODO best, good, medium, low, worst, custom
    audio: "best", // individual quality only valid when quality=custom
    video: "best",
    
    autoconvert: true,
    format: "mp4",
    ytdlLoc: "../ext/yt-dlp.exe",
}




// TODO: get default settings from settings tab
let downloaders = [];
let downloads = {};

function newDownload(url, opts) {

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
    
    dl.on("start", () => window.webContents.send(`status:${url}`, "start"));
    dl.on("pause", () => window.webContents.send(`status:${url}`, "pause"));
    dl.on("resume", () => window.webContents.send(`status:${url}`, "resume"));
    dl.on("converting", () => window.webContents.send(`status:${url}`, "converting"));
    dl.on("stop", () => {
        downloaders.splice(downloaders.indexOf(dl), 1);
        window.webContents.send(`status:${url}`, "stop");
    });
    dl.on("done", () => {
        downloaders.splice(downloaders.indexOf(dl), 1);
        window.webContents.send(`status:${url}`, "done");
    });
    
    dl.on("progress", (progress) => {
        window.webContents.send(`status:${url}`, "progress", progress);
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

            likes: i.like_count,
            dislikes: i.dislike_count,
            views: i.view_count,

            duration: i.duration,
            
            uploader: i.uploader,
            uploaderUrl: i.uploader_url,

            filesize: i.filesize || i.filesize_approx,
            format: opts.format,


            // TODO: file size, formats?
            
        }
        
        window.webContents.send(`info:${url}`, download);
        
        downloads[`${date} ${url}`] = download;
    })

    dl.on("error", err => {
        logger.error("ytdl error", err);
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


function init(_window, _ipc) {
    logger.info("Initializing download manager");

    window = _window;
    ipc = _ipc;

    // Download Settings change
    ipc.on("settings:download", (e, opts) => {
        Object.assign(downloadOptions, opts);
    });

    // toggle the listener
    ipc.on("listener:toggle", () => listener.toggle());

    // download a video
    ipc.on("download:new", (event, url, opts) => {
        if (!opts) opts = downloadOptions;
        logger.data(opts);
        newDownload(url, opts);
    });

    ipc.on("download:pause", (_, url) => pause(url));
    ipc.on("download:resume", (_, url) => resume(url));
    ipc.on("download:stop", (_, url) => stop(url));

    ipc.on("downlads:load", () => {
        window.send("downloads:load", downloads);
    });
}


module.exports = {
    init,
    newDownload
}