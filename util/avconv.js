const { spawn } = require("child_process");

class Converter {
  
  constructor(input, output, opts) {
    this.ffmpegLoc = opts.ffmpegLoc || "ffmpeg.exe";
    
    this.ffmpegArgs = [
      "-i", 
      input,
      output
    ]
    
    this.instance = spawn(this.ffmpegLoc, this.ffmpegArgs);
  }
}