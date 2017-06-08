const celery = require('node-celery');

let client = null;

const dbURI = process.env.CELERY_BROKER_URL || 'amqp://guest:guest@localhost:5672//';

function celerySetup(done) {
    if (!process.env.CELERY_ON) {
        return;
    }

    client = celery.createClient({
        CELERY_BROKER_URL: dbURI,
        CELERY_RESULT_BACKEND: 'amqp://'
    });

    client.on('error', (err) => {
        console.error(err);
        console.log('Celery connection error');
    });

    client.once('connect', () => {
        console.log('Celery connection open to %s', dbURI);
        done();
    });
}

function celeryClose() {
    return new Promise((resolve) => {
        if (client) {
            console.log('Celery default connection disconnected through app termination');
            client.end();
        }
        resolve();
    });
}

module.exports = celerySetup;

exports = module.exports;

exports.client = client;

exports.close = celeryClose;
