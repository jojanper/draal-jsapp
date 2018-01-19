const winston = require('winston');
const path = require('path');
const fs = require('fs');

const formatter = info =>
    `{"timestamp": "${info.timestamp}", "level": "${info.level}", "message": "${info.message}"}`;

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
        level: 'error'
    })
);
transports.push(
    new winston.transports.File({
        filename: path.join(logPrefix, 'debug.log')
    })
);

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.printf(formatter)
    ),
    timestamp: true,
    transports: transports
});

module.exports = {
    logger
}
