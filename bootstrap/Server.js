const http = require('http');
const express = require('express');
const debug = require('debug')('app:server');
const debugError = require('debug')('app:server:error');

class Server {
    constructor(host = '127.0.0.1', port = 4000) {
        this._app = null;

        this._host = host;
        this._port = port;
        this._server = express();
        this._httpServer = http.createServer(this._server);
    }

    setApp(app) {
        this._app = app;

        return this;
    }

    getApp() {
        return this._app;
    }

    start() {
        this._httpServer.listen(this._port, this._host);
        this._httpServer.on('error', this._onError.bind(this));
        this._httpServer.on('listening', this._onListening.bind(this));
    }

    getServer() {
        return this._server;
    }

    getHttpServer() {
        return this._httpServer;
    }

    bindRoute(handler) {
        if (!handler) return;

        this._server.use(handler);
    }

    _onError(error) {
        const bind = typeof this._port === 'string' ? `Pipe ${this._port}` : `Port ${this._port}`;

        if (error.syscall !== 'listen') {
            debugError(error.message || error);
            return process.exit(1);
        }

        if (error.code === 'EACCES') {
            debugError(`${bind} requires elevated privileges`);
            return process.exit(1);
        }

        if (error.code === 'EADDRINUSE') {
            debugError(`${bind} is already in use`);
            return process.exit(1);
        }

        debugError(error.message || error);
        return process.exit(1);
    }

    _onListening() {
        const addr = this._httpServer.address();
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${this._port}`;

        debug(`Listening on ${bind}`);
    }
}

module.exports = Server;
