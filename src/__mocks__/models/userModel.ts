import { Model } from "sequelize/types";

const userModel: Model | any = {
  rawAttributes: {
    firstname: {
      type: 'string'
    },
    id: {
      type: 'integer'
    },
    lastname: {
      type: 'string'
    },
  }
};

export default userModel;
