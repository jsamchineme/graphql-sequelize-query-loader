import { 
  FieldNode,
  SelectionNode,
  SelectionSetNode,
  StringValueNode, 
} from 'graphql';

import { 
  FindOptions,
  IncludeOptions,
  Model as SequelizeModel,
  Op,
} from 'sequelize';

import {
  IQueryLoader,
  ISequelizeOperators,
  IWhereConstraints,
  SelectedAttributes,
  SelectedIncludes,
} from './types';


/**
 * Dictionary of available query scope operators
 * and their equivalent sequelize operator
 */
const sequelizeOperators: ISequelizeOperators = {
  eq: Op.eq,
  gt: Op.gt,
  gte: Op.gte,
  like: Op.like,
  lt: Op.lt,
  lte: Op.lte,
  ne: Op.ne,
};


const queryLoader: IQueryLoader = {
  includeModels: {},

  /**
   * Initialise the queryLoader utility
   * 
   * @param options - configuration options used for the initializing utility
   * @param options.includeModels - object containing included Models as pairs of `modelName`: `SequelizeModel`
   */
  init({ includeModels }) {
    if(includeModels === undefined) {
      throw new Error('Please supply parameter property :includeModels. Check the docs');
    }
    this.includeModels = includeModels;
  },

  /**
   * Returns the options that should be supplied to
   * a Sequelize `Find` or `FindAll` method call
   * 
   * @remarks
   * A GraphQL Query with this structure
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
   * ```
   * @param model - model
   * @param info - the info meta property passed from graphql. 
   * It has a structure that we can parse or analyse, to determine the attributes to be selected from the database
   * as well as the associated models to be included using sequelize include
   * @returns the query options to be applied to the Find method call
   *
   */
  getFindOptions({ model, info }): object {
    const selections = (info.fieldNodes[0].selectionSet as SelectionSetNode).selections;
    const selectedAttributes = this.getSelectedAttributes({ model, selections });
    const queryIncludes = this.getSelectedIncludes({ model, selections });

    const findOptions: FindOptions = {
      attributes: selectedAttributes,
    };

    const selectionArguments = info.fieldNodes[0].arguments || [];
    const whereAttributes = this.turnArgsToWhere(selectionArguments);

    if (queryIncludes.length) {
      findOptions.include = queryIncludes;
    }
    if (Object.keys(whereAttributes).length) {
      findOptions.where = whereAttributes;
    }

    return findOptions;
  },

  /**
   * Return an array of all the includes to be carried out
   * based on the schema sent in the request from graphql
   * 
   * @param selections - an array of the selection nodes for each field in the schema.
   * @returns the array that should contain all model and association-model includes
   */
  prepareIncludes({ selections = [] }): SelectedIncludes {
    const includes: SelectedIncludes = [];
    const includedModelSelections: SelectionNode[] = 
      selections.filter((selection) => (selection as FieldNode).selectionSet !== undefined);

    const hasFieldWithSelectionSet = includedModelSelections !== undefined;

    includedModelSelections.forEach((item) => {
      const selection = item as FieldNode;
      const fieldName: string = selection.name.value;
      const includedModel: SequelizeModel | any = this.getIncludeModel(fieldName);
      const selectionSet = selection.selectionSet || { selections: undefined };

      const selectedAttributes: SelectedAttributes = this.getSelectedAttributes({ 
        model: includedModel,
        selections: selectionSet.selections
      });

      let queryIncludes : IncludeOptions[] = [];
      if (hasFieldWithSelectionSet) {
        const fieldSelectionSet = selection.selectionSet || { selections: undefined };
        const currentSelections = fieldSelectionSet.selections;
        queryIncludes = this.getSelectedIncludes({ model: includedModel, selections: currentSelections });
      }

      const selectionArguments = selection.arguments || [];
      const whereAttributes = this.turnArgsToWhere(selectionArguments);

      const includeOption: IncludeOptions = {
        as: fieldName,
        attributes: selectedAttributes,
        model: includedModel,
        required: false
      };

      if (Object.keys(whereAttributes).length) {
        includeOption.where = whereAttributes;
      }
      if (queryIncludes.length) {
        includeOption.include = queryIncludes;
      }

      includes.push(includeOption);
    });
    return includes;
  },

  /**
   * Return an array of all the includes to be carried out
   * based on the schema sent in the request from graphql
   * 
   * @remarks
   * This method is called `recursively` to prepare the included models
   * for all nodes with nested or associated resource(s)
   * 
   * @param model - a specific model that should be checked for selected includes
   * @param selections - an array of the selection nodes for each field in the schema.
   * @returns the array that should contain all model and association-model includes
   */
  getSelectedIncludes({ model, selections = [] }) {
    let includes: SelectedIncludes = [];
    const includedModelSections = selections.filter(item => (item as FieldNode).selectionSet !== undefined);

    /**
     * hasFieldWithSelectionSet is used to assert that the top level resource
     * in the selectionSet has a child field which is a model
     */
    const hasFieldWithSelectionSet = includedModelSections !== undefined;

    if (hasFieldWithSelectionSet) {
      includes = this.prepareIncludes({ model, selections });
    }
    return includes
  },

  getIncludeModel(modelKeyName: string) {
    return this.includeModels[modelKeyName];
  },

  getSelectedAttributes({ model, selections = [] }) {
    /**
     * Request schema can sometimes have fields that do not exist in the table for the Model requested.
     * Here, we get all model attributes and check the request schema for fields that exist as
     * attributes for that model.
     * Those are the attributes that should be passed to the sequelise "select" query
     */
  
    // Initialise the list of selected attributes
    const selectedAttributes: SelectedAttributes = [];
  
    // Get the field names for the model
    const modelAttributes = Object.keys((model).rawAttributes);
  
    selections.forEach((item) => {
      const selection = item as FieldNode;
      const fieldName = selection.name.value;
      const isModelAttribute = modelAttributes.find(attr => attr === fieldName);
      const hasSubSelection = selection.selectionSet !== undefined;
  
      if (isModelAttribute && !hasSubSelection) {
        selectedAttributes.push(fieldName);
      }
    });
  
    return selectedAttributes;
  },

  turnArgsToWhere(fieldArguments) {
    /**
     * With any of the included models, the query can have arguments,
     * Here we convert the arguments into a data structure which will
     * serve as the WHERE property to be supplied to the sequelize query
     */
  
    let whereConstraints: IWhereConstraints = {};
    if (fieldArguments.length) {
      whereConstraints = this.getWhereConstraints(fieldArguments) as IWhereConstraints;
    }
    return whereConstraints;
  },

  getWhereConstraints(fieldArguments) {
    const whereOption: IWhereConstraints = {};
    const scopeFieldArgument = fieldArguments.find(arg => arg.name.value === 'scope');

    if(scopeFieldArgument !== undefined) {
      const argumentValueNode = scopeFieldArgument.value as StringValueNode;
      const argumentString = argumentValueNode.value;
      /**
       * we split with `&&` because we can multiple constraints
       * for example we can have a field like
       * `id|like|%introduction% && published|eq|true`
       * 
       * This would be the case for a GraphQL query like this
       * ```js
       * articles(scope: "id|like|%introduction% && published|eq|true") {
       *   id
       *   body
       * }
       */
      const whereComparisons = argumentString.split('&&');
    
      whereComparisons.forEach((fieldConditionString) => {
        const splitString = this.getValidScopeString(fieldConditionString);
        const field = splitString[0].trim();
        const operation = splitString[1].trim();
        const value = splitString[2].trim();
        const sequelizeOperator = sequelizeOperators[operation];
        whereOption[field] = { [sequelizeOperator]: value };
      });
    }
    
    return whereOption;
  },

  /**
   * Validate the scope argument string to be sure
   * there are no errors.
   * @param splitString - scope string to be checked
   */
  getValidScopeString(fieldConditionString) {
    const splitString = fieldConditionString.split('|');
    if(splitString.length < 3) {
      throw Error(`Incorrect Parts supplied for scope: ${fieldConditionString}`);
    }
    const field = splitString[0].trim();
    const operation = splitString[1].trim();
    const value = splitString[2].trim();

    if(field === "" || operation === "" || value === "") {
      throw Error(`Incorrect Parts supplied for scope: ${fieldConditionString}`);      
    }
    return splitString;
  }
}

export = queryLoader;