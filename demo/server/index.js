import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import schema from './graphql/schemas';
import resolvers from './graphql/resolvers';
import models from './models';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const start = async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
      models,
    }
  });

  server.applyMiddleware({ app, path: '/graphql' });

  const port = 8001;
  app.listen({ port }, () => {
    console.log(`🚀 Apollo Server on http://localhost:${port}${server.graphqlPath}`);
  });
};

start();
