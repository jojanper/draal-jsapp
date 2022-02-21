/**
 * MongoDB startup.
 */
const MongoStore = require('connect-mongo');

const { success, error } = require('../src/logger');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/draaljs-app';

const OPTIONS = {};

function connect(mongoose, uri, retry, waitDelay) {
    let retryCount = 0;

    function connectWithRetry() {
        return mongoose.connect(uri, OPTIONS, err => {
            if (err) {
                error(err);
                error('Failed to connect to MongoDB on startup - retrying in 5 sec.');
                if (retryCount < retry) {
                    retryCount += 1;
                    setTimeout(connectWithRetry, waitDelay);
                } else {
                    throw new Error('MongoDB connection failure, aborting.');
                }
            }
        });
    }

    connectWithRetry();
}

function mongodbSetup(mongoose, done, options = { retry: 5, waitDelay: 5000, uri: dbURI }) {
    mongoose.Promise = global.Promise;

    connect(mongoose, options.uri || dbURI, options.retry, options.waitDelay);

    // CONNECTION EVENTS

    // When successfully connected
    mongoose.connection.on('connected', () => {
        success(`Mongoose default connection open to ${dbURI}`);
        done();
    });

    // If the connection throws an error
    mongoose.connection.on('error', err => {
        error(err);
        error('✗ MongoDB connection error. Please make sure MongoDB is running.');
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
        success('Mongoose default connection disconnected');
    });
}

function mongoDbClose(mongoose) {
    return new Promise(resolve => {
        mongoose.connection.close(() => {
            success('Mongoose default connection disconnected through app termination');
            resolve();
        });
    });
}

function mongoStore() {
    return MongoStore.create({
        mongoUrl: dbURI,
        mongoOptions: OPTIONS
    });
}

module.exports = {
    dbURI,
    config: mongodbSetup,
    close: mongoDbClose,
    mongoStore
};
