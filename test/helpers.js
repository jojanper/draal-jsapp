const User = require('src/apps/user/models/user');

const UserModel = User.model;

global.chai = require('chai');
global.testapp = require('../app.js');
global.testrunner = require('supertest');

global.appTestHelper = {
    User,

    getUserByEmail: email => User.manager.execute('findOne', {email}),

    getUserById: id => User.manager.execute('findOne', {user: id}),

    addUser: (details, cb, activate) => {
        const user = new UserModel(details);
        if (activate) {
            user.active = true;
        }
        user.save().then(() => cb(user)).catch((err) => { throw new Error(err); });
    },

    createUser: (details, cb) => {
        const user = new UserModel(details);
        user.save().then(() => cb()).catch(() => cb());
    },

    activateUser: (email, cb) => {
        User.manager.execute('findOne', {email}, (err, user) => {
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
    }
};
