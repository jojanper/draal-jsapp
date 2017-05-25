const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const userCtrl = require('src/apps/user/ctrl');
const User = require('src/apps/user/models/user');

const userDetails = {
    email: 'test2@test.com',
    password: 'test'
};

function userMgr() {
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

describe('User manager methods', () => {
    userMgr();
});
