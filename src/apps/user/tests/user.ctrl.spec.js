const SignIn = require('../ctrl')[2].cls;

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
            SignIn.apiEntry(SignIn)(req, null, (err) => {
                // THEN expected error should be returned
                expect(err).to.be.equal('Failure');
                done();
            });
        }, true);
    });
});
