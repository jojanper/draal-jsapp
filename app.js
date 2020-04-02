/**
 * Application server setup.
 */
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const dotenv = require('dotenv');
const chalk = require('chalk');
const socketIo = require('socket.io');

const isProduction = (process.env.NODE_ENV === 'production');

// Load environment variables (API keys etc).
const secretsFile = (isProduction) ? '.env.secrets' : '.env.test.secrets';
dotenv.config({ path: process.env.SECRETS_PATH || secretsFile });

const draaljs = require('./src');
const draaljsConfig = require('./config');

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
        return normalizePort(process.env.PORT || '3000');
    }

    constructor() {
        // HTTP server object
        this.server = null;

        // Socket server
        this.io = null;

        // Express application
        this.app = express();
    }

    /**
     * Return Express application.
     */
    getApp() {
        return this.app;
    }

    /**
     * Create and setup the Express application.
     */
    createApp() {
        this.app.set('port', WebApplication.port);

        this._setupPlugins();
        this._setupView();
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

        if (!isProduction) {
            this.app.use(morgan('dev'));
        }

        this.app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            cookie: { maxAge },
            store: new MongoStore({
                url: draaljsConfig.mongo.dbURI,
                autoReconnect: true
            })
        }));
    }

    /**
     * Set up views for the application.
     */
    _setupView() {
        if (!isProduction || process.env.ENABLE_STATIC_MEDIA) {
            this.app.use(express.static(path.join(__dirname, 'public')));
        }

        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');
    }

    /**
     * Set up HTTP request parsers.
     */
    _setupParsers() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
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
        this.server = this.app.listen(WebApplication.port, () => {
            console.log(
                '%s App is running at http://localhost:%d in %s mode',
                chalk.green('✓'), this.app.get('port'), this.app.get('env')
            );
            console.log('  Press CTRL-C to stop\n');
        });

        /**
         * Event listener for HTTP server "listening" event.
         */
        const onListening = () => {
            const addr = this.server.address();
            const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
            draaljs.logger.debug(`Listening on ${bind}`);
        };

        /**
         * Event listener for HTTP server "error" event.
         */
        const onError = error => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const { port } = WebApplication.port;
            const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

            // Handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;

                case 'EADDRINUSE':
                    console.error(`${bind} is already in use`);
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
        this.io = socketIo.listen(this.server);
    }

    /**
     * Listen socket connections from clients.
     */
    listenSocket() {
        this.io.sockets.on('connection', socket => {
            draaljs.logger.debug(`Connected client on port ${this.app.get('port')}`);
            draaljs.socket(this.io, socket);
        });
    }
}

// Create application
const app = new WebApplication().createApp();

// Setup up backend tasks handler
const celerySetup = () => {
    draaljsConfig.celery.connect(() => {
        // Application is now ready.
        app.listen();
        app.createSocket();
        app.listenSocket();
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

module.exports = app.getApp();
