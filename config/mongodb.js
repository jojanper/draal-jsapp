/**
 * MongoDB startup.
 */

const chalk = require('chalk');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/draaljs-app';

function connect(mongoose, dbURI) {
    function connectWithRetry() {
        return mongoose.connect(dbURI, {server: {auto_reconnect: true}}, (err) => {
            if (err) {
                console.error(err);
                console.error('Failed to connect to mongo on startup - retrying in 5 sec.');
                setTimeout(connectWithRetry, 5000);
            }
        });
    }

    connectWithRetry();
}

function mongodbSetup(mongoose, done) {
    mongoose.Promise = global.Promise;

    connect(mongoose, dbURI);

    // CONNECTION EVENTS

    // When successfully connected
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to %s', dbURI);
        done();
    });

    // If the connection throws an error
    mongoose.connection.on('error', (err) => {
        console.error(err);
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
}

module.exports = {
    dbURI,
    config: mongodbSetup
};
