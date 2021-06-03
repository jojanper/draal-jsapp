/**
 * Logging module for the application.
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const os = require('os');

const COLORCODES = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',

    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',

    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m'
};

// 50 MB
const MAXLOGSIZE = 50 * 1024 * 1024;

const logPrefix = process.env.APP_LOGGER_PREFIX || path.join(os.tmpdir(), 'app-logs');

// Make sure the log folder exists
if (!fs.existsSync(logPrefix)) {
    fs.mkdirSync(logPrefix);
}

const transports = [];

const formatter = info => `{"timestamp": "${info.timestamp}", "level": "${info.level}", "message": "${info.message}"}`;

// Console logger not used in production
if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json(),
            winston.format.timestamp(),
            winston.format.printf(formatter)
        )
    }));
}

//
// Write to all logs with level `debug` and below to `app-debug.log`
// Write all logs error (and below) to `app-error.log`.
//
if (process.env.APP_LOGGER_DISABLE_FILES !== 0) {
    transports.push(new winston.transports.File({
        filename: path.join(logPrefix, 'app-error.log'),
        level: 'error',
        maxsize: MAXLOGSIZE
    }));
    transports.push(new winston.transports.File({
        filename: path.join(logPrefix, 'app-debug.log'),
        maxsize: MAXLOGSIZE
    }));
}

// Main logger
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.printf(formatter)
    ),
    timestamp: true,
    transports
});

function colorize(msg, code) {
    const intMsg = `${code}${msg}${COLORCODES.Reset}`;
    logger.debug(intMsg);
}

function success(msg) {
    colorize(msg, COLORCODES.FgGreen);
}

function info(msg) {
    colorize(msg, COLORCODES.FgYellow);
}

function error(msg) {
    colorize(msg, COLORCODES.FgRed);
}

success(`Logger file creation state: ${process.env.APP_LOGGER_DISABLE_FILES}`);
success(`Logs folder: ${logPrefix}, env prefix: ${process.env.APP_LOGGER_PREFIX}`);

// Multiple loggers may be available for different feature area
module.exports = {
    logger,
    success,
    error,
    info,
    colorize: (msg, code) => `${code}${msg}${COLORCODES.Reset}`,
    COLORCODES
};
