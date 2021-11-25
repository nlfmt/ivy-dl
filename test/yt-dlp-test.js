const { spawn } = require('child_process');

// const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const url = 'https://www.youtube.com/watch?v=UP2XoGfhJ1Y';

let ytdl = spawn("..\\ext\\yt-dlp.exe", [
    url,
    "-j",                       // dump json metadata to stdout before downloading
    "--no-simulate",            // actually download video, as -j option enables simulation mode
    "--progress",               // show progress in quiet mode
    "--progress-template",      // print out progress
    "download:%(progress.total_bytes)s-%(progress.downloaded_bytes)s"
], {
    shell: false,
    // detached: true
});


ytdl.stdout.on('data', (data) => {

    const msg = data.toString();
    if (!msg) return;

    if (!msg.startsWith('{')) {
        console.log(msg);
    } else {
        console.log("got json");
        console.log(JSON.parse(msg).title);
    }
});


ytdl.stderr.on("data", d => console.error(String(d)));

setTimeout(() => {
    console.log("kill");
    // ytdl.stdin.pause()
    ytdl.kill("SIGINT");
}, 5000);
