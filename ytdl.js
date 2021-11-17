const { spawn } = require('child_process');
const fs = require('fs').promises;


/**
 * Tests if a file exists
 * @param {String} path
 * @returns {boolean} true if file exists false otherwise
 */
function exists(path) {
    return fs.access(path).then(() => true).catch(() => false);
}

const ARGNAMES = {
    quality: "--quality",
    output: "--output",
    format: "--format"
}


/** A wrapper around yt-dlp.exe to allow easy monitoring. */
class DLInstance {

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
     * @returns {Promise<DLInstance>} A new instance of DLInstance.
     */
    async constructor(url, opts) {
        
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
            if (!argName in ARGNAMES) continue;
            this.ytdlArgs.push(ARGNAMES[argName], value);
        }

        // Add experimental args
        if (opts.ytdlArgs)
            this.ytdlArgs.push(...opts.ytdlArgs);
        
        // Custom ytdl location
        this.ytdlLoc = opts.ytdlLoc || "yt-dlp.exe";
        if (! await exists(this.ytdlLoc)) throw new Error(`Can't find YTDL binary at "${ytdlLoc}".`);

        // spawn the process
        this.instance = spawn(this.ytdlLoc, this.ytdlArgs);
        
        // Hook up stdout callback
        this.instance.stdout.on("data", this._dataCallback);
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
    _dataCallback(data) {

        const msg = data.toString();

        if (this.receivedInfo) {
            const [ total, downloaded ] = msg.split(" ");
            this._dispatchEvent("progress", total, downloaded);
            return;
        }
        
        // First message is the json metadata
        try {
            const json = JSON.parse(msg);
            this._receivedInfo = true;
            this._dispatchEvent("info", json);
        } catch {
            throw new Error("JSON info wasn't the first thing sent.");
        }
    }
    
    // Calls the callback for the given event, if it exists.
    _dispatchEvent(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName](...args);
        }
    }
}