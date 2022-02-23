// const cb = require("copy-paste");
// try {
//     const cb = require("clipboardy");
// } catch {}
// const { default: cb } = await import('clipboardy');
// let cb = { readSync: () => {}, writeSync: () => {} };
// const cb = require("./clipboardy");
const cb = require("electron").clipboard;
// import("clipboardy/index.js").then(clipboardy => { cb = clipboardy.default; });
const fetch = require("cross-fetch");
const logger = require("./logger");

let last = "";
let listener;
let onURL = () => {};


// Get supported domains from github repo and parse them
let supportedDomains;
fetch("https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/supportedsites.md").then(res => res.text()).then(text => {
    let domainList = text.split("\n");
    domainList = domainList.filter(line => line.startsWith(" - **"));
    
    domainList = domainList.map(line => {
        return line.split("**")[1].split(":")[0];
    });
    
    supportedDomains = [...new Set(domainList)];
}).catch(e => {
    logger.error("domain list", String(e));
})


/**
 * Tests if url is a valid url and is supported.
 * @param {string} url The url to test.
 * @returns true if url is a valid url and is supported, false otherwise.
 */
function isValidUrl(url) {

    if (!url.match(/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/)) return false;

    // Get base domain from url
    let domain = url.split("/")[2];
    domain = domain.split(".")[domain.split(".").length - 2];
    // Check if domain is a supported domain
    // TODO: Handle experimental downloads?
    return supportedDomains.includes(domain);
}


/**
 * Start listening for copied urls
 */
function start() {
    if (listener) return logger.warn("listener already started");
    logger.info("started listener");
    
    // cb.copy("");
    cb.writeText("");
    
    listener = setInterval(async () => {
        // let val = await cb.paste();
        let val = cb.readText();
        if (val == last) return;
        last = val;
        
        // Check val
        if (!isValidUrl(val)) return logger.warn("invalid url: " + val);
        
        // call the user defined callback
        onURL(val);
        
        
    }, 500);
}

/**
 * Stop listening for copied urls
 */
function stop() {
    clearInterval(listener);
    listener = null;
    logger.info("stopped listener");
}


/**
 * Toggle the listener.
 * @returns {boolean} True if the listener is now running, false otherwise.
 */
function toggle() {
    if (listener) {
        stop();
    } else {
        start();
    }
    return !!listener;
}


module.exports = {
    start,
    stop,
    onURL: (cb) => {
        onURL = cb;
    },
    toggle,
    isValidUrl
}