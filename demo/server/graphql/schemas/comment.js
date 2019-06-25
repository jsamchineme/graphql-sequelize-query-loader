import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    comment(id: ID!): Comment!
    comments(scope: String): [Comment!]!
  }

  type Comment {
    id: ID!
    name: String
    userId: String
    articleId: Int
    body: String
    owner: User
    createdAt: String
    updatedAt: String
    articles: [Article!]
  }

  extend type Mutation {
    createComment(
      articleId: Int!
      body: String!
    ): Comment!

    deleteComment(id: ID!): Boolean!
  }
`;
