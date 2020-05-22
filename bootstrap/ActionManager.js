const fs = require('fs');
const _ = require('lodash');
const path = require('path');

class ActionManager {
    constructor(socket, path = 'actions') {
        this._app = null;
        this._path = path;
        this._socket = socket;

        this._actionItems = this._getActionItems();
    }

    setApp(app) {
        this._app = app;

        return this;
    }

    getApp() {
        return this._app;
    }

    async bindActions() {
        this._socket.getIO().on('connection', socket =>
            this.getActions().forEach(action =>
                socket.on(action.name, (...args) =>
                    action.handler(...[this._app, this._socket, socket, ...args])
                )
            )
        );
    }

    getActions() {
        return this._actionItems;
    }

    getAction(name) {
        return this.getActions().filter(action => action.name === name);
    }

    addAction(name, handler) {
        if (!name || !handler) throw new Error(`"name" and "handler" parameters must be set!`);

        return this.getActions().push({name, handler: handler});
    }

    _getActionItems() {
        const actionsPath = path.join(__dirname, '..', this._path);

        try {
            const actionFiles = fs.readdirSync(actionsPath);

            if (!Array.isArray(actionFiles) || !actionFiles.length) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error();
            }

            return actionFiles.map(function (file) {
                const ext = path.extname(file);
                const name = _.camelCase(file.replace(ext, ''));
                const handler = require(path.join(actionsPath, file));

                return {name, handler};
            });
        } catch (err) {
            console.error('Actions folder can not read!');
            process.exit();
        }
    }
}

module.exports = ActionManager;
