const User = require('src/apps/user/models/user');
const signIn = require('src/apps/user/ctrl')[1].fn;

function addUser(details, cb) {
    const user = new User.model(details);
    user.save().then(() => cb(user)).catch(err => { throw new Error(err); });
}

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

        addUser(userDetails, (user) => {
            // WHEN user logs in
            signIn(req, null, err => {
                // THEN expected error should be returned
                chai.expect(err).to.be.equal('Failure');
                done();
            })
        });
    });
});
