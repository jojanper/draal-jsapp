/* eslint-disable no-unused-expressions */

const format = require('util').format;

const AccountProfile = require('src/apps/user/models/accountprofile');

const credentials = {email: 'test@test.com', password: '123456'};

describe('User registration', () => {
    const api = '/api/auth/signup';
    const activationApi = '/api/auth/activate/%s';

    it('signup succeeds', (done) => {
        // GIVEN user
        // WHEN user sign-up is performed
        // THEN it should succeed
        testrunner(testapp).post(api).send(credentials).expect(200)
            .end((err) => {
                // AND activation key exists for the user
                appTestHelper.getUserByEmail(credentials.email).then((user) => {
                    AccountProfile.manager.execute('findOne', {user: user.id}).then((profile) => {
                        chai.expect(profile.activation_key.length).to.be.equal(3);
                        done(err);
                    });
                }).catch(err => done(err));
            });
    });

    it('signup email is already reserved', (done) => {
        appTestHelper.createUser(credentials, () => {
            testrunner(testapp).post(api).send(credentials).expect(400)
                .end((err, res) => {
                    console.trace('HEP');
                    console.log(err.name);
                    console.log(res);
                    chai.expect(res.body.errors[0]).to.equal('Account with test@test.com email address already exists');
                    done(err);
                });
        });
    });

    it('invalid account activation key is used', (done) => {
        const url = format(activationApi, '1233');
        testrunner(testapp).post(url).send().expect(404)
            .end((err, res) => {
                chai.expect(res.body.errors[0]).to.be.equal('Invalid account activation key');
                done();
            });
    });

    it('account is activated', (done) => {
        const url = format(activationApi, '123');
        testrunner(testapp).post(url).send().expect(200)
            .end((err) => {
                appTestHelper.getUserByEmail(credentials.email).then((user) => {
                    chai.expect(user.active).to.be.true;
                    done(err);
                });
            });
    });
});

describe('User authentication', () => {
    const api = '/api/auth/login';
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
            .end((err) => {
                done(err);
            });
    });

    it('invalid email is entered', (done) => {
        testrunner(testapp).post(api).send({email: 'test_@test.com', password: '123456'})
           .expect(400)
           .end((err, res) => {
               chai.expect(res.body.errors[0]).to.equal(errText);
               done(err);
           });
    });

    it('invalid password is entered', (done) => {
        testrunner(testapp).post(api).send({email: 'test@test.com', password: '12345d6'})
           .expect(400)
           .end((err, res) => {
               chai.expect(res.body.errors[0]).to.equal(errText);
               done(err);
           });
    });
});

describe('User authentication', () => {
    const api = '/api/auth/logout';

    it('logout fails', (done) => {
        // GIVEN user is not logged in
        // WHEN logging out
        // THEN it should fail
        testrunner(testapp).post(api).send().expect(401)
            .end((err) => {
                done(err);
            });
    });

    it('logout succeeds', (done) => {
        const app = testrunner.agent(testapp);

        // GIVEN user has logged in
        // GIVEN active user
        appTestHelper.activateUser(credentials.email, (user) => {
            app.post('/api/auth/login').send(credentials).expect(200).end(() => {
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
