const { spawn } = require('child_process');
const kill = require("tree-kill");
const fs = require('fs').promises;

const Converter = require('./conv.js');

const ARGNAMES = {
    quality: "--format",
    output: "--output"
}


// Downloader status diagram
//
// idle -> downloading/paused -> (converting) -> done
// |-> error
// |-> stopped


/** Events:
- start

- info
- progress
- converting

- pause
- resume
- stop

- error
- done
**/

// TODO:
// add conversion parameters:
// - bitrate
// - audio-only?, video-only?
// - framerate

// - simple options: quality with low/medium/high
// - advanced options, select by itag, format, resolution, etc.



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
        this.status = "idle";
        this.opts = opts;

        // base commandline arguments
        this.ytdlArgs = [
            url,
            "-j",                       // dump json metadata to stdout before downloading
            "--no-simulate",            // -j option enables simulation mode, but we want to download
            "--progress",               // show progress in quiet mode
            "--progress-template",      // print out progress

            // makes yt-dlp.exe output progress like this: "1024 256"
            "download:%(progress.total_bytes)s %(progress.downloaded_bytes)s",

            "-o",
            opts.output
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

        this._setupListeners();
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

    /**
     * Pauses the downloader.
     */
    pause() {
        // this.instance.stdin.pause();
        // this.instance.kill("SIGINT");
        kill(this.instance.pid);
        this.status = "paused";
        this._dispatchEvent("pause");
    }
    
    /**
     * Resumes the downloader.
     */
    resume() {
        this.status = "downloading";
        
        this._dispatchEvent("resume");
        this.instance = spawn(this.ytdlLoc, this.ytdlArgs);
        this._setupListeners();
    }
    
    /**
     * Stops the downloader.
     */
    stop() {
        // this.instance.stdin.pause();
        // this.instance.kill();
        kill(this.instance.pid);
        this.status = "stopped";
        this._dispatchEvent("stop");
    }


    // Sets up listeners for the ytdl process.
    _setupListeners() {

        const ytdl = this.instance;

        // hook up stdout/stderr callbacks
        ytdl.stdout.on("data", msg => this._onChildMessage.call(this, msg));
        ytdl.stderr.on("data", (e) => {
            if (String(e).includes("will be merged into mkv")) return this.wasMkvMerged = true;
            if (String(e).includes("WARNING")) return;
            this._dispatchEvent("error", String(e));
        });

        // spawn event
        ytdl.on("spawn", () => {
            this.status = "downloading";
            this._dispatchEvent("start");
        });
        
        // close event & conversion
        ytdl.on("close", code => {
            if (code != 0)
                return this._dispatchEvent("error", `YTDL exited with code ${code}.`);

            // Only convert if a specific format was requested.
            if (!this.opts.format) return;

            this._runConverter();
        });
    }


    // Callback that runs when the ytdl binary prints to stdout.
    _onChildMessage(data) {

        const msg = data.toString();
        if (this.info) {
            const [ total, downloaded ] = msg.replace(/[^\d ]/g, "").split(" ").map(Number);
            if (isNaN(total) || total == 0 || isNaN(downloaded) || downloaded > total) return;
            this._dispatchEvent("progress", {
                type: "download",
                total,
                done: downloaded,
                perc: downloaded / total * 100.0
            });
            return;
        }
        
        // First message is the json metadata
        try {
            const json = JSON.parse(msg);
            this.info = json;
            fs.writeFile("info.json", JSON.stringify(json, null, 4));
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

    _runConverter() {

        const { opts, info, wasMkvMerged } = this;


        let ext = wasMkvMerged ? "mkv" : info.ext;

        // Check if the output already is in correct format
        if (ext === opts.format) {
            this._dispatchEvent("done");
            return this.status = "done";
        }
        

        // Create current filename
        let currentFilename = info.filename;
        if (!currentFilename.endsWith(ext)) currentFilename += "." + ext;

        // Create new filename
        let filename = currentFilename;
        filename = filename.split(".").slice(0, -1).join(".") + "." + opts.format;

        console.log("Converting", currentFilename, "to", filename);
        let conv = new Converter(currentFilename, filename, {
            ffmpegLoc: opts.ffmpegLoc || "ffmpeg.exe",
            keepInput: false
        });

        conv.run();

        conv.on("start", () => {
            this.status = "converting";
            this._dispatchEvent("converting");
        });

        conv.on("progress", (total, done) => {
            this._dispatchEvent("progress", {
                type: "convert",
                total,
                done,
                perc: done / total * 100
            });
        })

        conv.on("done", () => {
            this.status = "done";
            this._dispatchEvent("done");
        });

        conv.on("error", (e) => {
            this.status = "error";
            this._dispatchEvent("error", String(e));
        });
    }
}

module.exports = Downloader;