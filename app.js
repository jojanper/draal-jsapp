const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const dotenv = require('dotenv');
const chalk = require('chalk');
const debug = require('debug')('draal-jsapp:server');
const socketIo = require('socket.io');

const mongoLib = require('./config/mongodb');
const celeryClient = require('./config/celery');
const appLogic = require('./src/app');
const appPassportConfig = require('./config/passport');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// Load environment variables (API keys etc).
dotenv.load({path: process.env.SECRETS_PATH || '.env.secrets'});

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

    getApp() {
        return this.app;
    }

    createApp() {
        this.app.set('port', WebApplication.port);

        this.setupView();
        this.setupParsers();
        this.setupDb();
        this.setupAuth();
        this.setupAppLogic();

        return this;
    }

    setupView() {
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupParsers() {
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(cookieParser());
    }

    setupDb() {
        this.app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: process.env.SESSION_SECRET,
            store: new MongoStore({
                url: mongoLib.dbURI,
                autoReconnect: true,
                clear_interval: 3600
            })
        }));
    }

    setupAuth() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        appPassportConfig(passport);
    }

    setupAppLogic() {
        appLogic(this.app);
    }

    /**
     * Bind and listen for connections on the specified host and port.
     */
    listen() {
        this.server = this.app.listen(WebApplication.port, () => {
            console.log('%s App is running at http://localhost:%d in %s mode',
                chalk.green('✓'), this.app.get('port'), this.app.get('env'));
            console.log('  Press CTRL-C to stop\n');
        });

        /**
         * Event listener for HTTP server "listening" event.
         */
        const onListening = () => {
            const addr = this.server.address();
            const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
            debug(`Listening on ${bind}`);
        };

        /**
         * Event listener for HTTP server "error" event.
         */
        const onError = (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const port = WebApplication.port;
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
        this.io = socketIo(this.server);
    }

    /**
     * Listen client socket connections.
     */
    listenSocket() {
        this.io.on('connect', (socket) => {
            console.log('Connected client on port %s.', this.app.get('port'));

            socket.on('message', (message) => {
                console.log('[server](message): %s', JSON.stringify(message));
                this.io.emit('message', message);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
}

const app = new WebApplication().createApp();

// Setup up tasks handler
const celerySetup = () => {
    celeryClient.connect(() => {
        /**
         * Listen on provided port, on all network interfaces.
         */
        app.listen();
        app.createSocket();
        app.listenSocket();
    });
};

/**
 * Set up MongoDB, application starts to listen the desired port after a successful
 * connection has been made.
 */
mongoLib.config(mongoose, celerySetup);

// If the Node process ends, close open connections
process.on('SIGINT', () => {
    mongoLib.close(mongoose)
        .then(() => celeryClient.close())
        .then(() => process.exit(0));
});

module.exports = app.getApp();
