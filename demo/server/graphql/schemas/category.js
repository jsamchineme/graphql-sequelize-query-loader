import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    category(id: ID!): Category!
    categories: [Category!]!
  }

  type Category {
    id: ID!
    name: String
    createdAt: String
    updatedAt: String
    articles(scope: String): [Article!]!
  }

  extend type Mutation {
    createCategory(
      name: String!
    ): Category!

    deleteCategory(id: ID!): Boolean!
  }
`;
