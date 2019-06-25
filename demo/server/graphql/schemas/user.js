import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]
  }

  type User {
    id: ID!
    userId: ID
    firstname: String
    lastname: String
    username: String!
    articles(id: ID, scope: String): [Article!]!
  }

  extend type Mutation {
    createUser(
      firstname: String
      lastname: String
      username: String
    ): User!
  }
`;
