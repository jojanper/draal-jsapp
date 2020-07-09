const io = require('socket.io-client');

const User = require('../src/apps/user/models/user');
const UserAccount = require('../src/apps/user/models/accountprofile');

const UserModel = User.model;

global.chai = require('chai');
global.testapp = require('../app.js').app;
global.testrunner = require('supertest');

global.expect = chai.expect;

global.appTestHelper = {
    User,

    getUserByEmail: email => User.manager.execute('findOne', { email }),

    getUserById: id => User.manager.execute('findOne', { user: id }),

    addUser: (details, cb, activate) => {
        const user = new UserModel(details);
        if (activate) {
            user.active = true;
        }
        user.save().then(() => cb(user)).catch(err => { throw new Error(err); });
    },

    createUser: (details, cb) => {
        const user = new UserModel(details);
        user.save().then(user => cb(user)).catch(() => cb());
    },

    activateUser: (email, cb) => {
        User.manager.execute('findOne', { email }, (err, user) => {
            user.active = true;
            if (err) {
                throw new Error(err);
            }
            user.save().then(() => cb(user));
        });
    },

    deactivateUser: (user, cb) => {
        user.active = false;
        user.save().then(() => cb(user));
    },

    getUserAccount: user => {
        const dbObj = UserAccount.manager.queryObj('findOne', { user: user.id });
        const query = dbObj.getQuery().populate('user');
        return dbObj.setQuery(query).exec();
    },

    getAccount: email => appTestHelper.getUserByEmail(email)
        .then(user => appTestHelper.getUserAccount(user)),

    promiseExec: promise => promise.then(data => [null, data]).catch(err => [err])
};

const port = process.env.PORT || '3000';
const serverUrl = `http://localhost:${port}`;

function socketClient(event, data) {
    const options = {
        transports: ['websocket'],
        'force new connection': true
    };

    return new Promise(resolve => {
        const client = io.connect(serverUrl, options);

        client.once('connect', () => {
            client.once(event, serverData => {
                resolve(Promise.resolve([serverData, () => {
                    client.disconnect();
                }]));
            });

            client.emit(event, data);
        });
    });
}

global.socketClient = socketClient;
