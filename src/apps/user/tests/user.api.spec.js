/* eslint-disable no-unused-expressions */
const sinon = require('sinon');
const { format } = require('util');

const TasksLib = require('../../../tasks');
const AccountProfile = require('../models/accountprofile');

const credentials = {email: 'test@test.com', password: '123456'};

describe('User registration', () => {
    const api = '/api/auth/v1/signup';
    const activationApi = '/api/auth/v1/activate/%s';

    it('signup email is already reserved', () => {
        const account = {email: 'test-reserved@test.com', password: '123456'};

        return new Promise((resolve, reject) => {
            appTestHelper.createUser(account, () => {
                testrunner(testapp).post(api).send(account).expect(400)
                    .end((err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    });
            });
        }).then((res) => {
            const msg = 'Account with test-reserved@test.com email address already exists';
            expect(res.body.errors[0]).to.equal(msg);
        }).catch((err) => { throw new Error(err); });
    });

    it('signup succeeds', () => {
        const spyCall = sinon.spy(TasksLib, 'sendRegistrationEmail');

        // GIVEN user
        // WHEN user sign-up is performed
        // THEN it should succeed
        return new Promise((resolve, reject) => {
            testrunner(testapp).post(api).send(credentials).expect(200)
                .end(() => {
                    // AND activation key exists for the user
                    appTestHelper.getUserByEmail(credentials.email).then((user) => {
                        AccountProfile.manager.execute('findOne', {user: user.id}).then((profile) => {
                            resolve(profile);
                        });
                    }).catch(err => reject(err));
                });
        }).then((profile) => {
            expect(profile.activationKey.length).to.be.equal(64);
            expect(spyCall.getCalls().length).to.be.equal(1);
        }).catch((err) => { throw new Error(err); });
    });

    it('invalid account activation key is used', (done) => {
        const url = format(activationApi, '1233');
        testrunner(testapp).post(url).send().expect(404)
            .end((err, res) => {
                expect(res.body.errors[0]).to.be.equal('Invalid account activation key');
                done();
            });
    });

    function activate(userEmail, statusCode, cb) {
        appTestHelper.getAccount(userEmail).then((account) => {
            const url = format(activationApi, account.activationKey);
            testrunner(testapp).post(url).send().expect(statusCode)
                .end((err, res) => {
                    cb(err, res);
                });
        }).catch((err) => { throw new Error(err); });
    }

    it('account is activated', (done) => {
        // GIVEN registered user
        // WHEN account is activated
        // THEN it should succeed
        activate(credentials.email, 200, (err) => {
            appTestHelper.getAccount(credentials.email)
                .then((account) => {
                    // THEN user status should be active
                    expect(account.user.active).to.be.true;

                    // AND account status should be activated
                    expect(account.isActivated()).to.be.true;

                    done(err);
                });
        });
    });

    it('account activated multiple times', (done) => {
        // GIVEN already activated user
        // WHEN account is again activated
        // THEN it should fail
        activate(credentials.email, 400, (err, res) => {
            // AND error message is available
            expect(res.body.errors[0]).to.equal('Account already activated');
            done(err);
        });
    });

    it('account activation expired', (done) => {
        appTestHelper.getAccount(credentials.email)
            // GIVEN expired activation key
            .then(account => account.setExpired().save())
            .then(() => {
                // WHEN account is activated
                // THEN it should fail
                activate(credentials.email, 400, (err, res) => {
                    // AND error message is available
                    expect(res.body.errors[0]).to.equal('Activation expired, please re-register');
                    done(err);
                });
            });
    });

    it('late account activation', (done) => {
        appTestHelper.getAccount(credentials.email)
            .then(account => account.setExpired().save())
            .then((account) => {
                // GIVEN too much time has passed since account creation
                const date = new Date(account.user.createdAt);
                const delta = 1e3 * 24 * 3600 * 8;
                date.setTime(date.getTime() - delta); // Account created 8 days ago
                account.user.createdAt = date.toISOString();
                return account.user.save();
            })
            .then(() => {
                // WHEN account is activated
                // THEN it should fail
                activate(credentials.email, 400, (err, res) => {
                    // AND error message is available
                    expect(res.body.errors[0]).to.equal('Activation expired, please re-register');
                    done(err);
                });
            });
    });

    it('email parameter is missing', (done) => {
        testrunner(testapp).post(api).send({email: 'testtest.com', password: '123456'}).expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(1);
                expect(res.body.errors[0]).to.equal('Input parameter email: Not an email address');
                done();
            });
    });

    it('password parameter is missing', (done) => {
        testrunner(testapp).post(api).send({email: 'test@test.com'}).expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(1);
                expect(res.body.errors[0]).to.equal('Input parameter password: Must be present');
                done();
            });
    });

    it('email and password parameters are missing', (done) => {
        testrunner(testapp).post(api).send().expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(2);
                expect(res.body.errors[0]).to.equal('Input parameter email: Must be present');
                expect(res.body.errors[1]).to.equal('Input parameter password: Must be present');
                done();
            });
    });

    it('email is invalid and and password parameter is missing', (done) => {
        testrunner(testapp).post(api).send({email: 'testcom'}).expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(2);
                expect(res.body.errors[0]).to.equal('Input parameter email: Not an email address');
                expect(res.body.errors[1]).to.equal('Input parameter password: Must be present');
                done();
            });
    });
});

describe('User authentication', () => {
    const api = '/api/auth/v1/login';
    const errText = 'Invalid credentials';

    beforeEach((done) => {
        appTestHelper.activateUser(credentials.email, (user) => {
            done();
            this.user = user;
        });
    });

    afterEach((done) => {
        appTestHelper.deactivateUser(this.user, () => {
            done();
        });
    });

    it('login succeeds', (done) => {
        // GIVEN active user
        // WHEN user does login
        // THEN it should succeed
        testrunner(testapp).post(api).send(credentials).expect(200)
            .end((err, res) => {
                expect(res.body.messages.length).to.equal(1);
                expect(res.body.messages[0]).to.equal('Sign-in successful');
                expect(Object.keys(res.body.data)).to.have.all.members(['email', 'created', 'updated', 'expires']);
                done(err);
            });
    });

    it('invalid email is entered', (done) => {
        testrunner(testapp).post(api).send({email: 'test_@test.com', password: '123456'})
            .expect(400)
            .end((err, res) => {
                expect(res.body.errors[0]).to.equal(errText);
                done(err);
            });
    });

    it('invalid password is entered', (done) => {
        testrunner(testapp).post(api).send({email: 'test@test.com', password: '12345d6'})
            .expect(400)
            .end((err, res) => {
                expect(res.body.errors[0]).to.equal(errText);
                done(err);
            });
    });

    it('email and password parameters are missing', (done) => {
        testrunner(testapp).post(api).send({}).expect(400)
            .end((err, res) => {
                expect(res.body.errors.length).to.equal(2);
                expect(res.body.errors[0]).to.equal('Input parameter email: Must be present');
                expect(res.body.errors[1]).to.equal('Input parameter password: Must be present');
                done();
            });
    });
});

describe('User logout', () => {
    const api = '/api/auth/logout';

    it('logout fails', (done) => {
        // GIVEN user is not logged in
        // WHEN logging out
        // THEN it should fail
        testrunner(testapp).post(api).send().expect(401, done);
    });

    it('logout succeeds', (done) => {
        const app = testrunner.agent(testapp);

        // GIVEN user has logged in
        // GIVEN active user
        appTestHelper.activateUser(credentials.email, (user) => {
            app.post('/api/auth/v1/login').send(credentials).expect(200).end(() => {
                // WHEN logging out
                // THEN it should succeed
                app.post(api).send().expect(200).end((err) => {
                    appTestHelper.deactivateUser(user, () => {
                        done(err);
                    });
                });
            });
        });
    });
});
