const io = require('socket.io');

class Socket {
    constructor(server, options = { path: '/_' }) {
        this._app = null;
        this._io = io(server.getHttpServer(), options);
    }

    setApp(app) {
        this._app = app;

        return this;
    }

    getApp() {
        return this._app;
    }

    getIO() {
        return this._io;
    }
}

module.exports = Socket;
