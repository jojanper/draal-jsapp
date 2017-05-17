describe('User registration', () => {
    it('signup succeeds', (done) => {
        testrunner(testapp)
            .post('/api/auth/signup')
            .send({email: 'test@test.com', password: '123456'})
            .expect(200)
            .end((err, res) => { done(err); });
    });

    it('signup email is already reservevd', (done) => {
        testrunner(testapp)
            .post('/api/auth/signup')
            .send({email: 'test@test.com', password: '123456'})
            .expect(400)
            .end((err, res) => {
                chai.expect(res.body.errors[0]).to.equal('Account with test@test.com email address already exists');
                done(err);
            });
    });
});
