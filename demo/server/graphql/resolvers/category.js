import queryLoader from '../queryLoaderConfig';

export default {
  Query: {
    categories: async (parent, args, { models }, info) => {
      const { Category } = models;
      const queryOptions = queryLoader.getFindOptions({ model: Category, info });

      const categories = await Category.findAll(queryOptions);
      return categories;
    },
    category: async (parent, { id }, { models }, info) => {
      const { Category } = models;
      const queryOptions = queryLoader.getFindOptions({ model: Category, info });

      const category = await Category.findByPk(id, queryOptions);
      return category;
    }
  },
  Category: {
    articles: async (parent) => {
      const { articles } = parent;
      return articles;
    }
  },
};
