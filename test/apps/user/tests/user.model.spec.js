const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const userCtrl = require('src/apps/user/ctrl');
const User = require('src/apps/user/models/user');

const userDetails = {
    email: 'test2@test.com',
    password: 'test'
};

function userMgrCreateUser() {
    describe('createUser', () => {
        it('save fails', (done) => {
            const errMsg = 'Error message';
            let userMock = sinon.mock(new User.model(userDetails));

            // GIVEN user save fails
            userMock.expects('save').chain('exec').rejects(errMsg);

            // WHEN creating user
            User.manager.createUser(userMock.object, null, err => {
                userMock.verify();
                userMock.restore();

                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);

                done();
            });
        });

        it('quering existing user fails', (done) => {
            const errMsg = 'Unable to query existing user';
            const user = new User.model(userDetails);
            let userMock = sinon.mock(User.model);

            // GIVEN user query fails
            userMock.expects('findOne').chain('exec').rejects(errMsg);

            // WHEN creating user
            User.manager.createUser(user, null, err => {
                userMock.restore();

                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);

                done();
            });
        });
    });
}

function userMgrFindLoginUser() {
    describe('findLoginUserUser', () => {
        it('password comparison fails', (done) => {
            const errMsg = 'Failed to compare';

            // GIVEN user password comparison fails
            let user = new User.model(userDetails);
            user.comparePassword = (password, cb) => {
                cb(errMsg, false);
            };

            let userMock = sinon.mock(User.model);
            userMock.expects('findOne').chain('exec').resolves(user);

            // WHEN querying login user
            User.manager.findLoginUser(user.email, user.password, null, err => {
                userMock.restore();

                // THEN it should return expected error
                chai.expect(err).to.be.equal(errMsg);

                done();
            });
        });

        it('login user query fails', (done) => {
            const errMsg = 'Failed to locate user';
            let user = new User.model(userDetails);

            // GIVEN user password comparison fails
            let userMock = sinon.mock(User.model);
            userMock.expects('findOne').chain('exec').rejects(errMsg);

            // WHEN querying login user
            User.manager.findLoginUser(user.email, user.password, null, err => {
                userMock.restore();

                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);

                done();
            });
        });
    });
}

describe('User manager', () => {
    userMgrCreateUser();
    userMgrFindLoginUser();
});

describe('User model', () => {
    it('model is updated', (done) => {
        // GIVEN user model
        let user = new User.model(userDetails);
        user.save().then(() => {
            const pw = user.password;

            // WHEN model field is updated
            user.active = true;
            user.save().then(() => {
                // THEN model password should remain the same
                chai.expect(user.password).to.be.equal(pw);

                done();
            });
        });
    });

    it('new password is saved', (done) => {
        // GIVEN user model
        let user = new User.model({email: 'new-user@test.com', password: '123'});
        user.save().then(() => {
            const pw = user.password;

            // WHEN password is updated
            user.password = 'pwd';
            user.save().then(() => {
                // THEN model password should change
                chai.expect(user.password).not.to.be.equal(pw);

                done();
            });
        });
    });
});
