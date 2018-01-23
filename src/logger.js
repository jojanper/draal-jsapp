/**
 * Logging module for the application.
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');


// 50 MB
const maxsize = 50 * 1024 * 1024;

const prefix = process.env.DRAALJS_LOGGER_PREFIX || 'logs';
const logPrefix = path.join(__dirname, '..', prefix);

// Make sure the log folder exists
if (!fs.existsSync(logPrefix)) {
    fs.mkdirSync(logPrefix);
}

const transports = [];

// Console logger not used in production
if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston.transports.Console());
}

//
// Write to all logs with level `debug` and below to `combined.log`
// Write all logs error (and below) to `error.log`.
//
transports.push(
    new winston.transports.File({
        filename: path.join(logPrefix, 'error.log'),
        level: 'error',
        maxsize
    })
);
transports.push(
    new winston.transports.File({
        filename: path.join(logPrefix, 'debug.log'),
        maxsize
    })
);

const formatter = info =>
`{"timestamp": "${info.timestamp}", "level": "${info.level}", "message": "${info.message}"}`;

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
