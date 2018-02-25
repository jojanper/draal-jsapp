const Base = require('../../../graphql/base');

const User = `
type User {
    id: ID!
    email: String,
    active: Boolean
}
extend type Query {
    user(id: ID): User
    users: [User]
}
`;

module.exports = () => [User, Base];
