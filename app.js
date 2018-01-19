const express = require('express');
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

const isProduction = (process.env.NODE_ENV === 'production') ? true : false;

// Load environment variables (API keys etc).
const secretsFile = (isProduction) ? '.env.secrets' : '.env.test.secrets';
dotenv.load({path: process.env.SECRETS_PATH || secretsFile});

const mongoLib = require('./config/mongodb');
const celeryClient = require('./config/celery');
const appLogic = require('./src/app');
const appPassportConfig = require('./config/passport');
const logger = require('./src/logger').logger;

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

        this._setupView();
        this._setupParsers();
        this._setupDb();
        this._setupAuth();
        this._setupAppLogic();

        return this;
    }

    _setupView() {
        if (!isProduction) {
            this.app.use(morgan('dev'));
        }

        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    _setupParsers() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(cookieParser());
    }

    _setupDb() {
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

    _setupAuth() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        appPassportConfig(passport);
    }

    _setupAppLogic() {
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
            logger.debug(`Listening on ${bind}`);
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
     * Listen socket connections from clients.
     */
    listenSocket() {
        this.io.on('connect', (socket) => {
            console.log('Connected client on port %s.', this.app.get('port'));

            socket.on('message', (message) => {
                console.log('[server](message): %s', JSON.stringify(message));
                this.io.sockets.emit('message', message);
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
        // Application is now ready.
        app.listen();
        app.createSocket();
        app.listenSocket();
    });
};

/**
 * Set up MongoDB and then Celery client, application starts to listen
 * the desired port after successful connections have been made.
 */
mongoLib.config(mongoose, celerySetup);

// If the Node process ends, close open connections
process.on('SIGINT', () => {
    mongoLib.close(mongoose)
        .then(() => celeryClient.close())
        .then(() => process.exit(0));
});

module.exports = app.getApp();
