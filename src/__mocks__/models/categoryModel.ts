import { Model } from "sequelize/types";

const categoryModel: Model | any = {
  rawAttributes: {
    id: {
      type: 'integer'
    },
    name: {
      type: 'string'
    },
  }
};

export default categoryModel;
