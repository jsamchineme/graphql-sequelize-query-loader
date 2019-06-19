import sequelise, { Sequelize, Model } from 'sequelize';
import { GraphQLResolveInfo } from 'graphql';

const { Op } = sequelise;

/**
 * Dictionary of available query scope operators
 * and their equivalent sequelize operator
 */
const sequelizeOperators = {
  eq: Op.eq,
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte,
  ne: Op.ne,
  like: Op.like,
};


export default class DataInclude {
  /**
   * 
   * @param options - options
   * @param options.includeModels - the dictionary of includes to the sequelize models they use
   */
  static init({ includeModels }) {
    DataInclude.includeModels = includeModels;
  }

  /**
   *
   * @param {Object} models - Object mapping of all loaded Sequelize Models
   * @param {SequelizeModel} model - model
   * @param {Object} info - the info meta property passed from graphql. It has
   * a structure that we can parse or analyse, to determine the attributes to be selected from the database
   * as well as the associated models to be included using sequelize include
   * @returns {Object} - the query options to be applied
   *
   * ******************************************************
   *
   * A GraphQL Query with this structure
   * >>>>>
   * ```js
   * categories {
   *   name
   *   articles(scope: "id|gt|2") {
   *     id
   *     title
   *     owner {
   *       id
   *       lastname
   *     }
   *     comments {
   *       id
   *       body
   *     }
   *   }
   * }
   * ```
   * is converted to a queryOptions object, in this structure
   * forming ONE SINGLE QUERY that will be executed against the database
   * with sequelize
   * <<<<<
   * ```js
   * {
   *   attributes: ['name'],
   *   include: [{
   *     model: Article,
   *     as: 'articles',
   *     attributes: ['id', 'title'],
   *     required: false,
   *     where: {
   *       id: {
   *         [Symbol(gt)]: '2'
   *       }
   *     },
   *     include: [{
   *       model: User,
   *       as: 'owner',
   *       attributes: ['id', 'lastname'],
   *       required: false,
   *       include: []
   *     },
   *     {
   *       model: Comment,
   *       as: 'comments',
   *       attributes: ['id', 'body'],
   *       required: false,
   *       include: []
   *     }]
   *   }]
   * }
   */
  static getQueryOptions(models: any, model: Model, info: GraphQLResolveInfo) {
    const { selections } = info.fieldNodes[0].selectionSet;
    const selectedAttributes = DataInclude.getSelectedAttributes(model, selections);
    const queryIncludes = DataInclude.getSelectedIncludes(models, model, selections);

    const queryOptions = {
      attributes: selectedAttributes,
    };

    if (queryIncludes) {
      queryOptions.include = queryIncludes;
    }

    return queryOptions;
  }

  /**
   *
   * @param {Object} models - models
   * @param {SequelizeModel} model - model
   * @param {Array} selections - selections
   * @returns {Array} - array
   */
  static prepareIncludes(models, model, selections) {
    const includes = [];
    const includedModelSections = selections.filter(selection => selection.selectionSet !== undefined);
    const hasFieldWithSelectionSet = includedModelSections !== undefined;

    includedModelSections.forEach((selection) => {
      const fieldName = selection.name.value;
      const includedModel = DataInclude.getIncludeModel(models, fieldName);
      const selectedAttributes = DataInclude.getSelectedAttributes(includedModel, selection.selectionSet.selections);

      let queryIncludes;
      if (hasFieldWithSelectionSet) {
        const currentSelections = selection.selectionSet.selections;
        queryIncludes = DataInclude.getSelectedIncludes(models, includedModel, currentSelections);
      }

      const whereAttributes = DataInclude.turnArgsToWhere(selection.arguments);

      const includeOption = {
        model: includedModel,
        as: fieldName,
        attributes: selectedAttributes,
        required: false
      };

      if (whereAttributes) {
        includeOption.where = whereAttributes;
      }
      if (queryIncludes) {
        includeOption.include = queryIncludes;
      }

      includes.push(includeOption);
    });
    return includes;
  }

  /**
   * Return an array of all the includes to be carried out
   * based on the schema sent in the request from graphql
   * @param {Object} models - the Sequelize Models Object that contains all defined Models
   * @param {SequelizeModel} model - a specific model that should be checked for selected includes
   * @param {Array} selections - an array of the fields in the schema.
   * Contains objects {name, selectionSet, ...}
   * @returns {Array} - the array that should contain all model and association-model includes
   */
  static getSelectedIncludes(models, model, selections) {
    let includes = [];
    const includedModelSections = selections.filter(item => item.selectionSet !== undefined);

    /**
     * hasFieldWithSelectionSet is used to assert that the top level resource
     * in the selectionSet has a child field which is a model
     */
    const hasFieldWithSelectionSet = includedModelSections !== undefined;

    if (hasFieldWithSelectionSet) {
      includes = DataInclude.prepareIncludes(models, model, selections);
    }
    return includes;
  }

  static getIncludeModel(models, includeKeyName) {
    return DataInclude.includeModels[includeKeyName];
  }

  static getSelectedAttributes(model, selections) {
    /**
     * Request schema can sometimes have fields that do not exist in the table for the Model requested.
     * Here, we get all model attributes and check the request schema for fields that exist as
     * attributes for that model.
     * Those are the attributes that should be passed to the sequelise "select" query
     */
  
    // Initialise the list of selected attributes
    const selectedAttributes = [];
  
    // Get the field names for the model
    const modelAttributes = Object.keys(model.rawAttributes);
  
    selections.forEach((selection) => {
      const fieldName = selection.name.value;
      const isModelAttribute = modelAttributes.find(item => item === fieldName);
      const hasSubSelection = selection.selectionSet !== undefined;
  
      if (isModelAttribute && !hasSubSelection) {
        selectedAttributes.push(fieldName);
      }
    });
  
    return selectedAttributes;
  }

  static turnArgsToWhere(fieldArguments) {
    /**
     * With any of the included models, the query can have arguments,
     * Here we convert the arguments into a data structure which will
     * serve as the WHERE property to be supplied to the sequelize query
     */
  
    let whereConstraints;
  
    if (fieldArguments.length) {
      whereConstraints = {};
      whereConstraints = DataInclude.getWhereConstraints(fieldArguments);
    }
  
    return whereConstraints;
  }

  static getWhereConstraints = (args) => {
    const whereOption = {};
    const whereArgument = args.find(arg => arg.name.value === 'scope');
    const argumentString = whereArgument.value.value;
    const whereComparisons = argumentString.split('&&');
  
    whereComparisons.forEach((fieldConditionString) => {
      const constraint = fieldConditionString.split('|');
      const field = constraint[0].trim();
      const operation = constraint[1].trim();
      const value = constraint[2].trim();
      const sequelizeOperator = sequelizeOperators[operation];
  
      whereOption[field] = { [sequelizeOperator]: value };
    });
  
    // console.log({ whereOption });
    return whereOption;
  };
}
