/**
 * Application server setup.
 */
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const compression = require('compression');
const open = require('open');

let { SECRETS_PATH, HOST } = process.env;

if (!HOST) {
    HOST = 'http://localhost';
}

// Set explicitly production mode if executed under pkg
if (process.pkg) {
    process.env.NODE_ENV = 'production';
    SECRETS_PATH = path.join(__dirname, '.env.pkg');
}

const isProduction = (process.env.NODE_ENV === 'production');

// Load environment variables (API keys etc).
const secretsFile = (isProduction) ? '.env.secrets' : '.env.test.secrets';
const secretsFilePath = path.join(__dirname, secretsFile);
dotenv.config({ path: SECRETS_PATH || secretsFilePath });

const draaljs = require('./src');
const {
    logger, colorize, success, COLORCODES
} = require('./src/logger');
const draaljsConfig = require('./config');
const { retry } = require('./src/core').utils;

const maxAge = parseInt(process.env.SESSION_EXPIRATION, 10);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * The actual web application.
 */
class WebApplication {
    /**
     * Get port from environment.
     */
    static get port() {
        return normalizePort(process.env.PORT || '0');
    }

    constructor() {
        // HTTP server object
        this._server = null;

        // Socket server
        this.io = null;

        // Express application
        this.app = express();
    }

    get server() {
        return this._server;
    }

    /**
     * Return Express application.
     */
    getApp() {
        return this.app;
    }

    /**
     * Return used application port.
     */
    get appPort() {
        return this.server.address().port;
    }

    /**
     * Get application parameter.
     */
    getParam(param) {
        return this.app.get(param);
    }

    /**
     * Create and setup the Express application.
     */
    createApp() {
        this.app.set('port', WebApplication.port);

        this._setupPlugins();
        this._setupParsers();
        this._setupAuth();
        this._setupAppLogic();

        return this;
    }

    /**
     * Set up application plugins.
     */
    _setupPlugins() {
        // See https://www.twilio.com/blog/2017/11/securing-your-express-app.html
        this.app.use(helmet());

        // Morgan logging
        if (process.env.MORGAN_FORMAT && process.env.NODE_ENV !== 'test') {
            this.app.use(morgan(process.env.MORGAN_FORMAT || 'dev', {
                stream: {
                    write: msg => logger.info(msg.trim())
                }
            }));
        }

        // Compress content in production setup
        if (process.env.ENABLE_COMPRESSION) {
            this.app.use(compression());
        }

        // Set up static media serving, if needed
        if (!isProduction || process.env.ENABLE_STATIC_MEDIA) {
            const postfixPath = process.env.STATIC_MEDIA_POSTFIX_FOLDER || '';
            this.app.use(express.static(path.join(__dirname, 'public', postfixPath), {
                maxAge: '30d'
            }));
        }

        this.app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            cookie: { maxAge },
            store: draaljsConfig.mongo.mongoStore()
        }));
    }

    /**
     * Set up HTTP request parsers.
     */
    _setupParsers() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    /**
     * Set up authentication.
     */
    _setupAuth() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        draaljsConfig.passport(passport);
    }

    /**
     * Set up application business logic.
     */
    _setupAppLogic() {
        draaljs.bootstrap(this.app);
    }

    /**
     * Bind and listen for connections on the specified host and port.
     */
    listen() {
        this._server = this.app.listen(WebApplication.port);

        /**
         * Event listener for HTTP server "listening" event.
         */
        const onListening = () => {
            const addr = this.server.address();
            const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
            success(`Listening on ${bind}`);
        };

        /**
         * Event listener for HTTP server "error" event.
         */
        const onError = error => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const port = this.appPort;
            const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

            // Handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    logger.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;

                case 'EADDRINUSE':
                    logger.error(`${bind} is already in use`);
                    process.exit(1);
                    break;

                default:
                    throw error;
            }
        };

        this.server.on('error', onError);
        this.server.on('listening', onListening);
    }

    /**
     * Create socket server for the application.
     */
    createSocket() {
        this.io = socketIo(this.server);
    }

    /**
     * Listen socket connections from clients.
     */
    listenSocket() {
        this.io.on('connection', socket => {
            logger.debug(`Connected client on port ${this.app.get('port')}`);
            draaljs.socket(this.io, socket);
        });
    }
}

// Create application
const app = new WebApplication().createApp();

// HTTP server handle will be available once it's ready -> return Promise
const server = timeout => retry(timeout, () => app.server);

// Setup up backend tasks handler
const celerySetup = () => {
    draaljsConfig.celery.connect(() => {
        // Start application
        app.listen();

        const url = `${HOST}:${app.appPort}`;

        if (!isProduction) {
            const icon = colorize('✓', COLORCODES.FgGreen);
            const msg = `${icon} App is running at ${url} in ${app.getParam('env')} mode`;

            console.log(msg);
            console.log('  Press CTRL-C to stop\n');
        }

        app.createSocket();
        app.listenSocket();

        // Open browser for the user, otherwise user does not know the
        // port where the server is running.
        if (process.pkg && !process.env.DISABLE_BROWSER_OPEN) {
            open(url);
        }
    });
};

/**
 * Set up MongoDB and then Celery client, the application starts to listen
 * the desired port after successful connections have been made.
 */
draaljsConfig.mongo.config(mongoose, celerySetup);

// If the Node process ends, close open connections
process.on('SIGINT', () => {
    draaljsConfig.mongo.close(mongoose)
        .then(() => draaljsConfig.celery.close())
        .then(() => process.exit(0));
});

module.exports = {
    app: app.getApp(),
    server,
};
