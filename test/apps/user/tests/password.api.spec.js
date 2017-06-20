const credentials = {email: 'test-123456@test.com', password: '123456'};

describe('Password reset request', () => {
    const api = '/api/auth/password-reset-request';

    it('fails for unknown email', (done) => {
        const email = 'unknown@test.com';
        testrunner(testapp).post(api).send({email}).expect(400)
            .then((res) => {
                chai.expect(res.body.errors[0]).to.equal('Email unknown@test.com not found');
                done();
            });
    });

    it('fails for inactive user', (done) => {
        appTestHelper.createUser(credentials, (user) => {
            testrunner(testapp).post(api).send({email: user.email}).expect(400)
                .then((res) => {
                    chai.expect(res.body.errors[0].length).to.equal(52);
                    done();
                });
        });
    });

    it('succeeds for active user', (done) => {
        appTestHelper.activateUser(credentials.email, (user) => {
            testrunner(testapp).post(api).send({email: user.email}).expect(200, done);
        });
    });
});
