import queryLoader from 'graphql-sequelize-query-loader';
import models from '../models';

/**
 * dictionary of what sequelize models respectively match the named resources
 * captured on the graphql schema
 */
const includeModels = {
  articles: models.Article,
  article: models.Article,
  owner: models.User,
  category: models.category,
  comments: models.Comment,
  me: models.User
};

queryLoader.init({ includeModels });


export default queryLoader;
