const spawn = require('child_process').spawn;

class StreamService {
    _processFFmpeg = null;

    constructor(server, app) {
        this.checkFFmpeg();
        this.bindSocketEvents();
    }

    setRTMPUrl(url) {
        this._rtmpUrl = url;

        return this;
    }

    bindSocketEvents() {
        this._io.on('connection', socket => {
            socket.emit('message', 'Hello from mediarecorder-to-rtmp server!');
            socket.emit('message', 'Please set rtmp destination before start streaming.');

            socket.on('start', (...args) => this.startEventHandler.bind(this).call(this, ...[socket, ...args]));
            socket.on('stop', (...args) => this.stopEventHandler.bind(this).call(this, ...[socket, ...args]));
            socket.on('error', (...args) => this.errorEventHandler.bind(this).call(this, ...[socket, ...args]));
            socket.on('binarystream', (...args) => this.binaryStreamEventHandler.bind(this).call(this, ...[socket, ...args]));
            socket.on('disconnect', (...args) => this.stopEventHandler.bind(this).call(this, ...[socket, ...args]));
        });
    }

    binaryStreamEventHandler(socket, data) {
        try {
            if (!this._processFFmpeg) {
                this._io.emit('fatal', 'rtmp not set yet.');

                this._processFFmpeg.stdin.end();
                this._processFFmpeg.kill('SIGINT');

                return;
            }

            this._processFFmpeg.stdin.write(data)
        } catch (e) {

        }
    }

    startEventHandler(socket) {
        const processFFmpeg = this.createFFmpeg();

        processFFmpeg.on('error', e => {
            console.log('[FFmpeg PROCESS] ERROR:', e);
            socket.emit('fatal', 'ffmpeg error!' + e);
            socket.disconnect();
        });

        processFFmpeg.on('exit', e => {
            console.log('[FFmpeg PROCESS] EXIT:', e);
            socket.emit('fatal', 'ffmpeg exit!' + e);
            socket.disconnect();
        });

        this._processFFmpeg = processFFmpeg;
    }

    stopEventHandler() {
        if (this._processFFmpeg) {
            try {
                this._processFFmpeg.stdin.end();
                this._processFFmpeg.kill('SIGINT');
            } catch (e) {
                console.warn('[FFmpeg PROCESS] Killing attempt failed!');
            }
        }

        this._processFFmpeg = false;
    }

    errorEventHandler(e) {
        console.log('[SOCKET] ERROR:', e);
    }

    checkFFmpeg() {
        spawn('ffmpeg', ['-h']).on('error', () => {
            console.error("FFmpeg not found in system cli; please install FFmpeg properly or make a softlink to ./!");
            process.exit(-1);
        });
    }

    createFFmpeg() {
        const options = [
            '-i', '-',
            '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency',
            '-c:a', 'aac', '-ar', '44100', '-b:a', '64k',
            '-y', '-use_wallclock_as_timestamps', '1', '-async', '1',
            '-bufsize', '1000', '-f', 'flv',
            this._rtmpUrl
        ];

        return spawn('ffmpeg', options);
    }
}

module.exports = StreamService;





