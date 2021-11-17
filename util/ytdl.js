const { spawn } = require('child_process');
const fs = require('fs').promises;

const ARGNAMES = {
    quality: "--format",
    output: "--output"
}


/** A wrapper around yt-dlp.exe to allow easy monitoring. */
class Downloader {

    /**
     * 
     * @param {String} url The youtube url of the video to download.
     * @param {Object} opts Options for the downloader.
     * @param {String} opts.output The output file name.
     * @param {String} opts.format The format to download.
     * @param {String} opts.quality The quality to download.
     * @param {String} opts.ytdlLoc The location of yt-dlp.exe.
     * @param {String} opts.ytdlArgs A List of arguments to pass to yt-dlp.exe.
     * 
     * @returns {Promise<Downloader>} A new Downloader instance.
     */
    constructor(url, opts) {
        
        this.listeners = {};

        // base commandline arguments
        this.ytdlArgs = [
            url,
            "-j",                       // dump json metadata to stdout before downloading
            "--no-simulate",            // -j option enables simulation mode, but we want to download
            "--progress",               // show progress in quiet mode
            "--progress-template",      // print out progress

            // makes yt-dlp.exe output progress like this: "1024 256"
            "download:%(progress.total_bytes)s %(progress.downloaded_bytes)s"
        ]

        // add custom arguments
        for (const [argName, value] of Object.entries(opts)) {
            if (!(argName in ARGNAMES)) continue;
            this.ytdlArgs.push(ARGNAMES[argName], value);
        }

        // Add experimental args
        if (opts.ytdlArgs)
            this.ytdlArgs.push(...opts.ytdlArgs);
        

        // Custom ytdl location
        this.ytdlLoc = opts.ytdlLoc || "yt-dlp.exe";
        fs.access(this.ytdlLoc).catch(() => {
            throw new Error(`Can't find YTDL binary at "${ytdlLoc}".`)
        });

        // spawn the process
        this.instance = spawn(this.ytdlLoc, this.ytdlArgs);
        
        // Hook up stdout/stderr callbacks
        this.instance.stdout.on("data", msg => this._onChildMessage.call(this, msg));
        this.instance.stderr.on("data", (e) => {
            this._dispatchEvent("error", String(e));
        });

        this.instance.on("close", code => {
            if (code != 0) {
                this._dispatchEvent("error", `YTDL exited with code ${code}.`);
            }
            if (!opts.format) return;
            let filename = info.filename;
            if (filename.endsWith(opts.format)) return;
            this.converter = new Converter(info.filename, )
        });
    }


    /**
     * Sets up a event listener
     * @param {String} eventName The name of the event, can be info, progress, error.
     * @param {Function} callback The function to execute when the event is dispatched.
     */
    on(eventName, callback) {
        this.listeners[eventName] = callback;
    }
    

    /**
     * Removes an event listener
     * @param {String} eventName The name of the event, can be info, progress, error.
     */
    off(eventName) {
        this.listeners[eventName] = null;
    }


    // Callback that runs when the ytdl binary prints to stdout.
    _onChildMessage(data) {

        const msg = data.toString();
        if (this.info) {
            const [ total, downloaded ] = msg.replace(/[^\d ]/g, "").split(" ").map(Number);
            if (isNaN(total) || total == 0 || isNaN(downloaded) || downloaded > total) return;
            this._dispatchEvent("progress", total, downloaded);
            return;
        }
        
        // First message is the json metadata
        try {
            const json = JSON.parse(msg);
            this.info = json;
            this._dispatchEvent("info", json);
        } catch {
            // ignore
        }
    }
    
    // Calls the callback for the given event, if it exists.
    _dispatchEvent(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName](...args);
        }
    }
}

module.exports = Downloader;