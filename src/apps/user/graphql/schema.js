const Base = require('../../../graphql/base');

const User = `
type User {
    id: ID!
    firstname: String
    lastname: String
    email: String
}
extend type Query {
    user(id: ID): User
    users: [User]
}
`;

module.exports = () => [User, Base];
