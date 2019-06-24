import queryLoader from '../queryLoaderConfig';


export default {
  Query: {
    articles: async (parent, args, { models }, info) => {
      const { Article } = models;
      // query options prepare attributes and associated model includes
      const queryOptions = queryLoader.getFindOptions({ model: Article, info });

      const articles = await Article.findAll(queryOptions);
      return articles;
    },
    article: async (parent, { id }, { models }, info) => {
      const { Article } = models;
      // query options prepare attributes and associated model includes
      const queryOptions = queryLoader.getFindOptions({ model: Article, info });

      const article = await Article.findByPk(id, queryOptions);
      return article;
    },
  },
  Article: {
    owner: (parent) => {
      const { owner } = parent;
      return owner;
    },
    category: (parent) => {
      const { category } = parent;
      return category;
    },
    comments: (parent) => {
      const { comments } = parent;
      return comments;
    }
  },
};
