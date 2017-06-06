const bcrypt = require('bcrypt-nodejs');
const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const User = require('src/apps/user/models/user');

const UserModel = User.model;

const userDetails = {
    email: 'test2@test.com',
    password: 'test'
};

function userMgrCreateUser() {
    describe('createUser', () => {
        it('save fails', (done) => {
            const errMsg = 'Error message';
            const userMock = sinon.mock(new UserModel(userDetails));

            // GIVEN user save fails
            userMock.expects('save').chain('exec').rejects(errMsg);

            // WHEN creating user
            User.manager.createUser(userMock.object, null, (err) => {
                userMock.verify();
                userMock.restore();

                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);

                done();
            });
        });

        it('quering existing user fails', () => {
            const errMsg = 'Unable to query existing user';
            const user = new UserModel(userDetails);
            const userMock = sinon.mock(UserModel);

            // GIVEN user query fails
            userMock.expects('findOne').chain('exec').rejects(errMsg);

            return new Promise((resolve) => {
                // WHEN creating user
                User.manager.createUser(user, null, (err) => {
                    userMock.verify();
                    userMock.restore();
                    resolve(err);
                });
            })
            .then((err) => {
                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);
            })
            .catch((err) => { throw new Error(err); });
        });
    });
}

function userMgrFindLoginUser() {
    describe('findLoginUser', () => {
        it('password comparison fails', () => {
            const errMsg = 'Failed to compare';

            // GIVEN user password comparison fails
            const user = new UserModel(userDetails);
            user.comparePassword = () =>
                new Promise((resolve, reject) => {
                    reject(errMsg);
                });

            const userMock = sinon.mock(User.model);
            userMock.expects('findOne').chain('exec').resolves(user);

            return new Promise((resolve) => {
                // WHEN querying login user
                User.manager.findLoginUser(user.email, user.password, null, (err) => {
                    userMock.verify();
                    userMock.restore();
                    resolve(err);
                });
            })
            .then((err) => {
                // THEN it should return expected error
                chai.expect(err).to.be.equal(errMsg);
            })
            .catch((err) => { throw new Error(err); });
        });

        it('login user query fails', () => {
            const errMsg = 'Failed to locate user';
            const user = new UserModel(userDetails);

            // GIVEN user password comparison fails
            const userMock = sinon.mock(User.model);
            userMock.expects('findOne').chain('exec').rejects(errMsg);

            return new Promise((resolve) => {
                // WHEN querying login user
                User.manager.findLoginUser(user.email, user.password, null, (err) => {
                    userMock.verify();
                    userMock.restore();
                    resolve(err);
                });
            })
            .then((err) => {
                // THEN it should return expected error
                chai.expect(err.name).to.be.equal(errMsg);
            })
            .catch((err) => { throw new Error(err); });
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
        const user = new UserModel({email: 'one@test.com', password: 'pw'});
        user.save().then(() => {
            const pw = user.password;

            // WHEN model field is updated
            user.active = true;
            user.save().then(() => {
                // THEN model password should remain the same
                chai.expect(user.password).to.be.equal(pw);

                done();
            }).catch(err => done(err));
        }).catch(err => done(err));
    });

    it('new password is saved', (done) => {
        // GIVEN user model
        const user = new UserModel({email: 'new-user@test.com', password: '123'});
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

    it('password comparison fails', (done) => {
        const msg = 'Error';

        // GIVEN password comparison fails
        sinon.stub(bcrypt, 'compare').callsFake((pw1, pw2, cb) => {
            cb(msg, false);
        });

        // WHEN user passwords are compared
        const user = new UserModel({email: 'one@test.com', password: 'pw'});
        user.comparePassword('ab', 'ba').catch((err) => {
            // THEN it should return expect error
            chai.expect(err).to.be.equal(msg);
            bcrypt.compare.restore();
            done();
        });
    });
});
