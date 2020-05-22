const spawn = require('child_process').spawnSync;

const checkFFmpegIsInstalled = () => !spawn('ffmpeg', ['-h']).error;

module.exports = checkFFmpegIsInstalled;
