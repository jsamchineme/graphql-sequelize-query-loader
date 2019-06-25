import queryLoader from '../queryLoaderConfig';

export default {
  Query: {
    user: (parent, { id }, { models }, info) => {
      const { User } = models;
      // query options prepare attributes and associated model includes
      const queryOptions = queryLoader.getFindOptions({ model: User, info });

      const user = User.findByPk(id, queryOptions);
      return user;
    },
    users: (parent, args, { models }, info) => {
      const { User } = models;
      // query options prepare attributes and associated model includes
      const queryOptions = queryLoader.getFindOptions({ model: User, info });

      const users = User.findAll(queryOptions);
      return users;
    },
  },
  User: {
    articles: async (parent) => {
      const { articles } = parent;

      return articles;
    }
  },
};
