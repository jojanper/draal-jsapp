const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const userCtrl = require('src/apps/user/ctrl');
const User = require('src/apps/user/models/user');

function userMgr() {
    describe('createUser', () => {
        it('save fails', (done) => {
            const errMsg = 'Error message';

            // GIVEN user save fails
            let userMock = sinon.mock(new User.model({
                email: 'test2@test.com',
                password: 'test'
            }));
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
    });
}

describe('User manager methods', () => {
    userMgr();
});
