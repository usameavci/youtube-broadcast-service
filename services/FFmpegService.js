const base64id = require('base64id');
const spawn = require('child_process').spawn;
const debug = require('debug')('app:FFmpegService');

class FFmpegService {
    constructor(broadcastId, liveStreamId, rtmpUrl) {
        this._id = base64id.generateId();
        this._broadcastId = broadcastId;
        this._liveStreamId = liveStreamId;
        this._rtmpUrl = rtmpUrl;
        this._processFFmpeg = null;
    }

    getId() {
        return this._id;
    }

    getBroadcastId() {
        return this._broadcastId;
    }

    getLiveStreamId() {
        return this._liveStreamId;
    }

    getRTMPUrl() {
        return this._rtmpUrl;
    }

    create() {
        const options = [
            '-i', '-',
            '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency',
            '-c:a', 'aac', '-ar', '44100', '-b:a', '64k',
            '-y', '-use_wallclock_as_timestamps', '1', '-async', '1',
            '-bufsize', '1000', '-f', 'flv', this._rtmpUrl
        ];

        this._processFFmpeg = spawn('ffmpeg', options)
            .on('error', e => {
                debug('Error occured in process ffmpeg:', e);
                this._processFFmpeg = this.create();
            })
            .on('exit', e => {
                debug('Process ffmpeg is exited, restarting..');
                this._processFFmpeg = this.create();
            });

        return this;
    }

    send(data) {
        if (!this._processFFmpeg || !this._processFFmpeg.stdin) {
            return;
        }

        this._processFFmpeg.stdin.write(data);
    }

    kill() {
        if (!this._processFFmpeg) return;

        try {
            this._processFFmpeg.stdin.end();
            this._processFFmpeg.kill('SIGINT');
        } catch (e) {
            debug('Killing attempt failed!');
        }

        this._processFFmpeg = false;
    }
}

class FFmpegManager {
    constructor() {
        this._processes = [];
    }

    create({ broadcastId, liveStreamId, rtmpUrl }) {
        if (!rtmpUrl) return;

        let item = this.getByBroadcastId(broadcastId) ||
            this.getByLiveStreanId(liveStreamId) ||
            this.getByRTMPUrl(rtmpUrl);

        if (item) {
            return item;
        }

        const service = new FFmpegService(broadcastId, liveStreamId, rtmpUrl);
        item = service.create();

        this._processes.push(item);

        return item;
    }

    getAll() {
        return this._processes;
    }

    getById(id) {
        const arr = this._processes.filter(process => process.getId() === id);

        return arr.length ? arr[0] : null;
    }

    getByBroadcastId(broadcastId) {
        const arr = this._processes.filter(process => process.getBroadcastId() === broadcastId);

        return arr.length ? arr[0] : null;
    }

    getByLiveStreanId(liveStreamId) {
        const arr = this._processes.filter(process => process.getLiveStreamId() === liveStreamId);

        return arr.length ? arr[0] : null;
    }

    getByRTMPUrl(rtmpUrl) {
        const arr = this._processes.filter(service => service.getRTMPUrl() === rtmpUrl);

        return arr.length ? arr[0] : null;
    }
}

module.exports.FFmpegService = FFmpegService;
module.exports.FFmpegManager = FFmpegManager;
