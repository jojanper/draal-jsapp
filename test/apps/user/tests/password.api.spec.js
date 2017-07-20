const sinon = require('sinon');

const UtilsLib = require('src/utils');
const TasksLib = require('src/tasks');

const credentials = {email: 'test-123456@test.com', password: '123456'};

describe('Password reset request', () => {
    const api = '/api/auth/password-reset-request';

    it('fails for unknown email', (done) => {
        const email = 'unknown@test.com';
        testrunner(testapp).post(api).send({email}).expect(400)
            .then((res) => {
                expect(res.body.errors[0]).to.equal('Email unknown@test.com not found');
                done();
            });
    });

    it('fails for inactive user', (done) => {
        appTestHelper.createUser(credentials, (user) => {
            testrunner(testapp).post(api).send({email: user.email}).expect(400)
                .then((res) => {
                    expect(res.body.errors[0].length).to.equal(52);
                    done();
                });
        });
    });

    it('succeeds for active user', (done) => {
        appTestHelper.activateUser(credentials.email, (user) => {
            const spyCall = sinon.spy(TasksLib, 'sendPasswordResetEmail');

            testrunner(testapp).post(api).send({email: user.email}).expect(200)
            .then(() => {
                expect(spyCall.getCalls().length).to.be.equal(1);
                done();
            });
        });
    });
});

describe('Password change using token', () => {
    const api = '/api/auth/password-reset';

    it('fails for invalid token', (done) => {
        const data = {email: credentials.email, token: '123', password: 'pw'};
        testrunner(testapp).post(api).send(data).expect(400)
            .then((res) => {
                expect(res.body.errors[0]).to.equal('Invalid token');
                done();
            });
    });

    it('fails for expired token', (done) => {
        appTestHelper.getUserByEmail(credentials.email).then((user) => {
            user.pwResetExpires -= 2 * UtilsLib.getActivationThreshold();
            user.save().then((user) => {
                const data = {email: credentials.email, token: user.pwResetToken, password: 'pw'};
                testrunner(testapp).post(api).send(data).expect(400)
                    .then((res) => {
                        expect(res.body.errors[0].length).to.equal(52);
                        user.pwResetExpires = Date.now() + UtilsLib.getActivationThreshold();
                        user.save().then(() => done());
                    });
            });
        });
    });

    it('succeeds with valid data', (done) => {
        appTestHelper.getUserByEmail(credentials.email).then((user) => {
            const data = {email: credentials.email, token: user.pwResetToken, password: 'pw'};
            testrunner(testapp).post(api).send(data).expect(200, done);
        });
    });
});
