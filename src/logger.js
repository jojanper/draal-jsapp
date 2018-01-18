const winston = require('winston');
const path = require('path');

const formatter = info =>
    `{timestamp: ${info.timestamp}, level: ${info.level}, message: ${info.message}}`;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.printf(formatter)
    ),
    timestamp: true,
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.Console({
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error2.log'),
            level: 'error',
            timestamp: true
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined2.log'),
            timestamp: true
        })
    ]
});

module.exports = logger;
