const typeDefinitions = `
type User {
  id: ID!
  firstname: String
  lastname: String
  email: String
}
# The schema allows the following queries:
type RootQuery {
  user(id: ID): User
  users: [User]
}
# We need to tell the server which types represent the root query.
# We call them RootQuery and RootMutation by convention.
schema {
  query: RootQuery
}
`;

module.exports = typeDefinitions;
