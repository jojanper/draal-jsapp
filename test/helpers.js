const User = require('src/apps/user/models/user');

global.chai = require('chai');
global.testapp = require('../app.js');
global.testrunner = require('supertest');

global.appTestHelper = {
    User: User,

    addUser: (details, cb, activate) => {
        const user = new User.model(details);
        if (activate) {
            user.active = true;
        }
        user.save().then(() => cb(user)).catch(err => { throw new Error(err); });
    },

    activateUser: (email, cb) => {
        User.manager.execute('findOne', {email: email}, (err, user) => {
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
