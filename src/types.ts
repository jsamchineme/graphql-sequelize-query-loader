import { ArgumentNode, GraphQLResolveInfo, SelectionNode } from 'graphql';
import { FindOptions, IncludeOptions, Model as SequelizeModel } from "sequelize/types";

/**
 * Object containing all loaded models
 * from sequelize
 * 
 * eg
 * ```js
 * {
 *   Article: SequelizeModel,
 *   Category: SequelizeModel,
 *   Comment: SequelizeModel,
 *   User: SequelizeModel,
 * }
 */
export interface IIncludeModels {
  [modelName: string]: SequelizeModel;
}

/**
 * model fields to be selected
 * 
 * Example
 * ```js
 *  ['id', 'firstname', 'lastname'],
 */
export type SelectedAttributes = string[];

/**
 * Array of include options
 * for all models to be included
 * 
 * Example
 * ```js
 * [
 *   {
 *     model: User,
 *     as: 'owner',
 *     attributes: ['firstname', 'lastname'],
 *     required: false,
 *   },
 *   {
 *     model: Comment,
 *     as: 'comments',
 *     attributes: ['id', 'content'],
 *     required: false,
 *   }
 * ]
 */
export type SelectedIncludes = IncludeOptions[];

/**
 * Object containing the selected fields and the 
 * where constraints applied on them
 * 
 * Example
 * ```js
 * { id: { [Symbol(gt)]: '5' } }
 */
export interface IWhereConstraints {
  [fieldName: string]: {
    [OperatorSymbol: string]: string
  }
}

export interface ISequelizeOperators {
  [operatorName: string]: symbol
}

export interface IQueryLoader {

  init: (object: { 
    includeModels: IIncludeModels,
  }) => void;

  includeModels: IIncludeModels;

  getFindOptions: (object: { 
    model: SequelizeModel, 
    info: GraphQLResolveInfo 
  }) => FindOptions;

  getSelectedAttributes: (object: { 
    model: SequelizeModel | any,
    selections: ReadonlyArray<SelectionNode> | undefined
  }) => SelectedAttributes;

  getSelectedIncludes: (object: { 
    model: SequelizeModel, 
    selections: ReadonlyArray<SelectionNode> | undefined
  }) => SelectedIncludes;

  prepareIncludes: (object: { 
    model: SequelizeModel,
    selections: ReadonlyArray<SelectionNode> | undefined
  }) => SelectedIncludes;

  getIncludeModel: (fieldName: string) => SequelizeModel

  turnArgsToWhere: (fieldArguments: ReadonlyArray<ArgumentNode>) => IWhereConstraints | {}

  getWhereConstraints: (fieldArguments: ReadonlyArray<ArgumentNode>) => IWhereConstraints | {}

  getValidScopeString: (fieldConditionString: string) => string[]
}
