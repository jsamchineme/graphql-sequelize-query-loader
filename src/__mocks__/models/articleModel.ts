import { Model } from "sequelize/types";

const articleModel: Model | any = {
  rawAttributes: {
    authorId: {
      type: 'string'
    },
    body: {
      type: 'string'
    },
    categoryId: {
      type: 'integer',
    },
    description: {
      type: 'string'
    },
    id: {
      type: 'integer'
    },
    slug: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
  }
};

export default articleModel;
