import { Model } from "sequelize/types";

const commentModel: Model | any = {
  rawAttributes: {
    articleId: {
      type: 'integer'
    },
    body: {
      type: 'string'
    },
    id: {
      type: 'integer'
    },
  }
};

export default commentModel;
