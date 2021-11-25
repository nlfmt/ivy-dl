const { spawn } = require("child_process");
const fs = require("fs");


/** Wrapper around ffmpeg, to make conversions simple. */
class Converter {
    /**
     *
     * @param {String} input the input file
     * @param {String} output the output file
     * @param {Object} opts Any additional options
     * @param {String} opts.ffmpegLoc The path to ffmpeg
     * @param {String} opts.keepInput Whether to keep the input file after conversion.
     * 
     */
    constructor(input, output, opts) {

        this.input = input;
        this.output = output;

        this.listeners = {};
        this.status = "idle";

        this.keepInput = "keepInput" in opts ? opts.keepInput : true;

        this.ffmpegLoc = opts.ffmpegLoc || "ffmpeg.exe";
        this.ffmpegArgs = ["-y", "-stats", "-i", this.input, output];
    }

    /**
     * Starts the conversion.
     */
    run(callback) {
        this.instance = spawn(this.ffmpegLoc, this.ffmpegArgs);
        this._setupListeners(callback || (() => {}));

        return new Promise((resolve, reject) => {
            this.instance.on("error", reject);
            this.instance.on("close", resolve);
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

    /**
     * Stop the converter.
     */
    stop() {
        this.instance.kill();
        this.status = "stopped";
        this._dispatchEvent("stop");
    }

    _setupListeners(callback) {
        this.instance.on("spawn", () => {
            this._dispatchEvent("start");
            this.status = "running";
        });
        // this.instance.stdout.on("data", msg => this._onChildMessage.call(this, msg));
        this.instance.stderr.on("data", msg => this._onChildMessage.call(this, msg));
        this.instance.on("error", (e) => {
            this._dispatchEvent("error", String(e));
            this.status = "error";
        });
        this.instance.on("close", () => {
            if (!this.keepInput) fs.unlinkSync(this.input);
            this._dispatchEvent("done");
            this.status = "done";
            callback();
        });
    }

    _onChildMessage(msg) {
        msg = msg?.toString();
        if (!msg) return;

        // parse initial info message
        if (!this.duration && msg.includes("Duration:")) {
            try {
                let videoLength = msg.split("Duration: ")[1].split(",")[0];
                this.duration = parseDuration(videoLength);
                return;

            } catch {
                return;
            }
        }

        // parse progress
        try {
            let timePassed = parseDuration(msg.split(" ").find(p => p.startsWith("time=")).split("=")[1]);
            this._dispatchEvent("progress", this.duration, timePassed);

        } catch {}
        
    }
    
    // Calls the callback for the given event, if it exists.
    _dispatchEvent(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName](...args);
        }
    }
}

/**
 * Convert a duration string to a number of seconds.
 * @param {String} duration A duration string in the format "hh:mm:ss.ms"
 * @returns the duration in seconds
 */
function parseDuration(duration) {
    const parts = duration.split(":").map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

module.exports = Converter;