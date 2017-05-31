const credentials = {email: 'test@test.com', password: '123456'};

describe('User registration', () => {
    const api = '/api/auth/signup';

    it('signup succeeds', (done) => {
        testrunner(testapp).post(api).send(credentials).expect(200).end((err, res) => {
            done(err);
        });
    });

    it('signup email is already reservevd', (done) => {
        testrunner(testapp).post(api).send(credentials).expect(400).end((err, res) => {
            chai.expect(res.body.errors[0]).to.equal('Account with test@test.com email address already exists');
            done(err);
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
        testrunner(testapp).post(api).send(credentials).expect(200).end((err, res) => {
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
        testrunner(testapp).post(api).send().expect(401).end((err, res) => {
            done(err);
        });
    });

    it('logout succeeds', (done) => {
        const app = testrunner.agent(testapp);

        // GIVEN user has logged in
        // GIVEN active user
        appTestHelper.activateUser(credentials.email, (user) => {
            app.post('/api/auth/login').send(credentials).expect(200).end((err, res) => {
                // WHEN logging out
                // THEN it should succeed
                app.post(api).send().expect(200).end((err, res) => {
                    appTestHelper.deactivateUser(user, () => {
                        done(err);
                    });
                });
            });
        });
    });
});
