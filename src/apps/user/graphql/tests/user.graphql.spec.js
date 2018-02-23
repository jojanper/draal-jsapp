const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const {
    resolvers: UserResolvers,
    schema: UserSchema
} = require('../index');
const { User } = require('../../models');
const Base = require('../../../../graphql/base');

const UserModel = User.model;

// Prepare testing schema
const schema = makeExecutableSchema({
    typeDefs: [
        Base,
        UserSchema
    ],
    resolvers: {
        Query: UserResolvers.Query
    }
});


describe('GraphQL User schema', () => {
    let userMock;

    const user = {
        id: '1',
        email: 'test@test.com'
    };

    beforeEach(() => {
        userMock = sinon.mock(UserModel);
    });

    afterEach(() => {
        userMock.verify();
        userMock.restore();
    });

    function verify(keys, refObj, targetObj) {
        keys.forEach((key) => {
            expect(refObj[key]).to.be.equal(targetObj[key]);
        });
    }

    it('supports users query', () => {
        // GIVEN users query data
        const query = '{users{id,email}}';

        userMock.expects('find').chain('exec').resolves([user]);

        // WHEN querying users
        return graphql(schema, query).then((results) => {
            // THEN it should return expected users
            const { users } = results.data;
            expect(users.length).to.be.equal(1);
            verify(Object.keys(user), user, users[0]);
        });
    });

    it('supports user query', () => {
        // GIVEN user query data
        const query = '{user(id: "1"){id,email}}';

        userMock.expects('findOne').chain('exec').resolves(user);

        // WHEN querying user
        return graphql(schema, query).then((result) => {
            // THEN it should return expected user
            const { user: userResponse } = result.data;
            verify(Object.keys(user), user, userResponse);
        }).catch((err) => { throw new Error(err); });
    });
});
