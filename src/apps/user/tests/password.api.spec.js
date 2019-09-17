const sinon = require('sinon');

const UtilsLib = require('../../../core').utils;
const TasksLib = require('../../../tasks');

const credentials = { email: 'test-123456@test.com', password: '123456' };

const resetApi = '/api/auth/v1/password-reset';


describe('Password reset request', () => {
    const api = '/api/auth/v1/password-reset-request';

    it('fails for unknown email', done => {
        const email = 'unknown@test.com';
        testrunner(testapp).post(api).send({ email }).expect(400)
            .then(res => {
                expect(res.body.errors[0]).to.equal('Email unknown@test.com not found');
                done();
            });
    });

    it('fails for inactive user', done => {
        appTestHelper.createUser(credentials, user => {
            testrunner(testapp).post(api).send({ email: user.email }).expect(400)
                .then(res => {
                    expect(res.body.errors[0].length).to.equal(52);
                    done();
                });
        });
    });

    it('succeeds for active user', done => {
        appTestHelper.activateUser(credentials.email, user => {
            let resetToken;
            const spyCall = sinon.spy(TasksLib, 'sendPasswordResetEmail');

            // Password reset request must succeed
            testrunner(testapp).post(api).send({ email: user.email })
                .expect(200)
                .then(() => {
                    expect(spyCall.getCalls().length).to.be.equal(1);

                    // Get the token from spy as user token that is saved to DB is encrypted
                    [, resetToken] = spyCall.getCall(0).args;
                    const data = { email: credentials.email, token: resetToken, password: 'pw' };

                    // Password reset using requested token must succeed
                    return testrunner(testapp).post(resetApi).send(data).expect(200);
                })
                .then(() => appTestHelper.getUserByEmail(credentials.email))
                .then(user => {
                    // Set token to expired timestamp
                    user.pwResetExpires -= 2 * UtilsLib.getActivationThreshold();
                    return user.save();
                })
                .then(() => {
                    // Password reset must fail for expired token
                    const data = { email: credentials.email, token: resetToken, password: 'pw' };
                    return testrunner(testapp).post(resetApi).send(data).expect(400);
                })
                .then(res => {
                    expect(res.body.errors[0]).to.equal('Password reset expired, please re-reset the password');
                    user.pwResetExpires = Date.now() + UtilsLib.getActivationThreshold();
                    user.save().then(() => done());
                });
        });
    });

    it('email parameter is missing', done => {
        testrunner(testapp).post(api).send({ email: 'testtest.com' }).expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(1);
                expect(res.body.errors[0]).to.equal('Input parameter email: Not an email address');
                done();
            });
    });
});

describe('Password change using token', () => {
    it('fails for invalid token', done => {
        const data = { email: credentials.email, token: '123', password: 'pw' };
        testrunner(testapp).post(resetApi).send(data).expect(400)
            .then(res => {
                expect(res.body.errors[0]).to.equal('Invalid token');
                done();
            });
    });

    it('email and token parameters are missing', done => {
        testrunner(testapp).post(resetApi).send().expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(2);
                expect(res.body.errors[0]).to.equal('Input parameter email: Must be present');
                expect(res.body.errors[1]).to.equal('Input parameter token: Must be present');
                done();
            });
    });
});
