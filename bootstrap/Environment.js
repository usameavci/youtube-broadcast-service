const _ = require('lodash');
const dotenv = require('dotenv');

class Environment {
    constructor(options = {}) {
        this._app = null;
        this._env = dotenv.config(options);
    }

    setApp(app) {
        this._app = app;

        return this;
    }

    getApp() {
        return this._app;
    }

    get(name) {
        if (!name) return null;

        return _.get(this._env.parsed, name);
    }

    getAll() {
        return this._env.parsed;
    }
}

module.exports = Environment;
