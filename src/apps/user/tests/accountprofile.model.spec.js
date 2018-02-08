const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const User = require('../models/user');
const AccountProfile = require('../models/accountprofile');

const UserModel = User.model;
const AccountModel = AccountProfile.model;

const userDetails = {
    email: 'test-account@test.com',
    password: 'test'
};


describe('activateUser', () => {
    it('save fails', () => {
        const errMsg = 'Save failed';
        const user = new UserModel(userDetails);
        const account = new AccountModel({user, activationKey: '123'});
        const userMock = sinon.mock(user);

        const accountMock = sinon.mock(AccountModel);
        accountMock.expects('findOne').chain('populate').chain('exec').resolves(account);

        // GIVEN user save fails
        userMock.expects('save').chain('exec').rejects(errMsg);

        return new Promise((resolve) => {
            // WHEN creating user
            AccountProfile.manager.activateUser('123').catch((err) => {
                userMock.verify();
                userMock.restore();

                accountMock.verify();
                accountMock.restore();

                resolve(err);
            });
        }).then((err) => {
            // THEN it should return expected error
            expect(err.name).to.be.equal(errMsg);
        }).catch((err) => { throw new Error(err); });
    });
});

describe('AccountProfile model', () => {
    it('supports getStatuses method', () => {
        expect(AccountModel.getStatuses()).to.have.keys(['active', 'activated', 'expired']);
    });

    it('supports toObject', () => {
        const user = new UserModel(userDetails);
        const account = new AccountModel({user, activationKey: '123'});

        const data = account.toObject();
        expect(Object.keys(data).length).equal(4);
        expect(data).to.have.keys(['activationKey', 'status', 'id', 'user']);
    });
});
