import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    article(id: ID!): Article!
    articles(scope: String): [Article!]!
  }

  type Article {
    id: ID!
    body: String
    title: String
    slug: String
    description: String
    authorId: String
    categoryId: Int!
    owner: User!
    category: Category!
    comments(scope: String): [Comment!]!
  }

  extend type Mutation {
    createArticle(
      title: String!
      description: String!
      body: String!
      categoryId: Int!
    ): Article!
    
    deleteArticle(id: ID!): Boolean!
  }
`;
