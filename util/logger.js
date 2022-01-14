const moment = require("moment");
const log = console.log;



// Color functions using ANSI escape codes
// https://en.wikipedia.org/wiki/ANSI_escape_code
function clrCode(message, n) {
    return `\x1b[${n}m` + message + "\x1b[0m";
}
const red       = m => clrCode(m, 91);
const green     = m => clrCode(m, 92);
const yellow    = m => clrCode(m, 93);
const blue      = m => clrCode(m, 94);
const magenta   = m => clrCode(m, 95);
const grey      = m => clrCode(m, 90);



// Returns a formatted timestamp
const now = () => moment().format("YYYY-MM-DD HH:mm:ss");



// All exported functions
function log_(message) {
    log(grey(`[${now()}] `) + `LOG: ${message}`);
}

function info(message) {
    log(grey(`[${now()}] `) + blue("INFO: ") + message);
}

function error(errtype, message) {
    log(grey(`[${now()}] `) + red(`ERROR (${errtype}): `) + message);
}

function warn(message) {
    log(grey(`[${now()}] `) + yellow("WARN: ") + message);
}

function debug(message) {
    log(grey(`[${now()}] `) + green("DEBUG: ") + message);
}
function data(args) {
    log(grey(`[${now()}] `) + green("DEBUG-DATA: "));
    for (const [ key, value ] of Object.entries(args)) {
        process.stdout.write(magenta(`${key}: `));   
        log(value);
    }
}

// log_("Logger loaded");
// warn("This is a warning");
// error("This is an error");
// debug("This is a debug message");
// info("This is an info message");
// data({data: {
//     a: 1,
//     b: 2
// }});

module.exports = {
    error,
    info,
    warn,
    log: log_,
    debug,
    now,
    data
}