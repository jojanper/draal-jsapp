const celery = require('node-celery');

const dbURI = process.env.CELERY_BROKER_URL || 'amqp://guest:guest@localhost:5672//';

class CeleryClient {
    constructor() {
        this.client = null;
    }

    connect(done) {
        if (!process.env.CELERY_ON) {
            done();
            return;
        }

        this.client = celery.createClient({
            CELERY_BROKER_URL: dbURI,
            CELERY_RESULT_BACKEND: 'amqp://'
        });

        this.client.on('error', (err) => {
            console.log('Celery connection error');
            console.error(err);
        });

        this.client.once('connect', () => {
            console.log('Celery connection open to %s', dbURI);
            done(this.client);
        });
    }

    close() {
        return new Promise((resolve) => {
            if (this.client) {
                console.log('Celery default connection disconnected through app termination');
                this.client.end();
            }
            resolve();
        });
    }

    callTask(args) {
        return (this.client) ? this.client.call(...args) : null;
    }
}

const client = new CeleryClient();

module.exports = client;
