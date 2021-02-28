/**
 * Logging module for the application.
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const tempDirectory = require('temp-dir');

// 50 MB
const maxsize = 50 * 1024 * 1024;

console.log(`Logger prefix path: ${process.env.APP_LOGGER_PREFIX}`);
const logPrefix = process.env.APP_LOGGER_PREFIX || path.join(tempDirectory, 'app-logs');

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
console.log(`Logger file creation state: ${process.env.APP_LOGGER_DISABLE_FILES}`);
if (process.env.APP_LOGGER_DISABLE_FILES !== 0) {
    transports.push(new winston.transports.File({
        filename: path.join(logPrefix, 'app-error.log'),
        level: 'error',
        maxsize
    }));
    transports.push(new winston.transports.File({
        filename: path.join(logPrefix, 'app-debug.log'),
        maxsize
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

logger.debug(`Logs folder: ${logPrefix}`);

// Multiple loggers may be available for different feature area
module.exports = {
    logger
};
