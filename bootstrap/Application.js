const _ = require('lodash');
const debug = require('debug')('app:bootstrap:Application');

const Server = require('./Server');
const Socket = require('./Socket');
const Router = require('./Router');
const Environment = require('./Environment');
const ActionManager = require('./ActionManager');
const checkFFmpegIsInstalled = require('../helpers/check-ffmpeg-is-installed');

class Application {
    constructor() {
        this._server = null;
        this._socket = null;
        this._environment = null;
        this._actionManager = null;
        this._services = {};

        const environment = new Environment();
        environment.setApp(this);
        this.setEnvironment(environment);
    }

    setEnvironment(environment) {
        this._environment = environment;
    }

    getEnvironment() {
        return this._environment;
    }

    setServer(server) {
        this._server = server;
    }

    getServer() {
        return this._server;
    }

    setSocket(socket) {
        this._socket = socket;
    }

    getSocket() {
        return this._socket;
    }

    setRouter(router) {
        this._router = router;
    }

    getRouter() {
        return this._router;
    }

    setActionManager(actionManager) {
        this._actionManager = actionManager;
    }

    getActionManager() {
        return this._actionManager;
    }

    async bootstrap() {
        if (!checkFFmpegIsInstalled()) {
            debug('FFmpeg is not installed! Please check the following link for installation: https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg');
            process.exit(1);
        }

        const env = this.getEnvironment();
        const server = new Server(env.get('SERVER_HOST'), env.get('SERVER_PORT'));
        server.setApp(this);

        const router = new Router(server);
        router.setApp(this);

        const socket = new Socket(server);
        socket.setApp(this);

        const actionManager = new ActionManager(socket);
        actionManager.setApp(this);

        this.setServer(server);
        this.setSocket(socket);
        this.setRouter(router);
        this.setActionManager(actionManager);

        await router.bindRoutes();
        await actionManager.bindActions();
    }

    async start() {
        await this.bootstrap();

        this.getServer().start();
    }

    registerService(name, service) {
        if (!name || !service) this;

        _.set(this._services, name, service(this))

        return this;
    }

    getService(name) {
        return _.get(this._services, name);
    }
}

module.exports = new Application();
