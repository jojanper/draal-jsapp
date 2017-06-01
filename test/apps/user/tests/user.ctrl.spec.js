const signIn = require('src/apps/user/ctrl')[2].fn;

const userDetails = {
    email: 'test-1@test.com',
    password: 'aa'
};

describe('User login', () => {
    it('reg.logIn fails', (done) => {
        const req = {
            body: userDetails,

            // GIVEN failure to login user
            logIn(user, cb) {
                cb('Failure');
            }
        };

        appTestHelper.addUser(userDetails, () => {
            // WHEN user logs in
            signIn(req, null, (err) => {
                // THEN expected error should be returned
                chai.expect(err).to.be.equal('Failure');
                done();
            });
        }, true);
    });
});
