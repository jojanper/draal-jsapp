/* eslint-disable no-unused-expressions */
const bcrypt = require('bcrypt');
const sinon = require('sinon');

const { hashify } = require('../utils');

describe('utils.hash', () => {
    it('hash creation fails', () => {
        const errMsg = new Error('Error message');

        // Hash for given string is set to fail
        sinon.stub(bcrypt, 'hash').callsFake((p1, p2, cb) => {
            cb(errMsg, null);
        });

        // Error must be present when hashing string
        return hashify('test')
            .catch(err => {
                bcrypt.hash.restore();
                expect(err.name).to.be.equal(errMsg.name);
            });
    });
});
