const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const express = require('express');

class Router {
    constructor(server, options = { path: '/routes' }) {
        this._app = null;
        this._server = server;
        this._options = options;
        this._routeModules = this._getRouteModules();
    }

    setApp(app) {
        this._app = app;

        return this;
    }

    getApp() {
        return this._app;
    }

    getRouteModules() {
        return this._routeModules;
    }

    async bindRoutes() {
        this.getRouteModules().forEach(route => this._server.bindRoute(route.handler(...[express.Router(), this._app])))
    }

    _getRouteModules() {
        const routesPath = path.join(__dirname, '..', this._options.path);

        try {
            const routeFiles = fs.readdirSync(routesPath);

            if (!Array.isArray(routeFiles) || !routeFiles.length) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error();
            }

            return routeFiles.map(function (file) {
                const ext = path.extname(file);
                const name = _.camelCase(file.replace(ext, ''));
                const handler = require(path.join(routesPath, file));

                return {name, handler};
            });
        } catch (err) {
            console.error('Routes folder can not read!\n', err);
            process.exit();
        }
    }
}

module.exports = Router;
