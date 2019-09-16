/**
 * Business logic for real-time communications.
 */
const { logger } = require('./logger');

const realtimeSetup = (io, socket) => {
    socket.on('message', message => {
        logger.debug(`[server](message): ${JSON.stringify(message)}`);
        io.sockets.emit('message', message);
    });

    socket.on('disconnect', () => {
        logger.debug('Client disconnected');
    });
};

module.exports = realtimeSetup;
