import { GraphQLResolveInfo } from 'graphql';
import { Op } from 'sequelize';
import getArticlesArgsInfoMock from '../__mocks__/getArticlesArgsInfo';
import getArticlesInfoMock from '../__mocks__/getArticlesInfo';
import getArticlesWithIncludesInfoMock from '../__mocks__/getArticlesWithIncludesInfo';
import getCategoryDeepInfoMock from '../__mocks__/getCategoryDeepInfo';
import getCategoryInfoMock from '../__mocks__/getCategoryInfo';
import articleModelMock from '../__mocks__/models/articleModel';
import commentModelMock from '../__mocks__/models/commentModel';
import userModelMock from '../__mocks__/models/userModel';
import queryLoader from '../index';
import { IWhereConstraints } from '../types';

const includeModels = {
  article: articleModelMock,
  articles: articleModelMock,
  category: userModelMock,
  comments: commentModelMock,
  owner: userModelMock,
};

describe('queryLoader', () => {
  describe('queryLoader.init()', () => {
    it('initialises loader with include models', () => {
      queryLoader.init({ includeModels });
      expect(queryLoader.includeModels.article).toEqual(articleModelMock);
      expect(typeof queryLoader === 'object').toBe(true);
    });

    it('throws an error when include models are not supplied', () => {
      try {
        (queryLoader as any).init({});
      } catch(error) {
        expect(error.message).toEqual('Please supply parameter property :includeModels. Check the docs');
      }
    });
  });

  describe('queryLoader.getSelectedAttributes()', () => {
    it('returns the selected attributes', () => {
      const info = getArticlesInfoMock as GraphQLResolveInfo
      const selectedAttributes = queryLoader.getSelectedAttributes({
        model: articleModelMock,
        selections: info.fieldNodes[0].selectionSet.selections
      });
      const expectedAttributes = ['id', 'title']

      expect(selectedAttributes).toEqual(expectedAttributes);
    });
  });

  describe('queryLoader.turnArgsToWhere()', () => {
    it('returns "undefined" when query lacks the "scope" argument', () => {
      const info = getArticlesInfoMock as GraphQLResolveInfo
      const whereConstraints = queryLoader.turnArgsToWhere(info.fieldNodes[0].arguments);
      const expectedWhereConstraints = {}
      expect(whereConstraints).toEqual(expectedWhereConstraints);
    });

    it('returns objects with properties corresponding to query when "scope" argument is provided', () => {
      const info = getArticlesArgsInfoMock as GraphQLResolveInfo
      const whereConstraints = queryLoader.turnArgsToWhere(info.fieldNodes[0].arguments);
      const expectedWhereConstraints: IWhereConstraints = {
        id: {
          [Op.gt]: '2'
        }
      }
      expect(whereConstraints).toEqual(expectedWhereConstraints);
    });
  });

  describe('queryLoader.getValidScopeString()', () => {
    it('throws error when incorrect parts are supplied', () => {
      let scopeString = 'id|gt| ';
      try {
        queryLoader.getValidScopeString(scopeString);
      } catch(error) {
        expect(error.message).toEqual(`Incorrect Parts supplied for scope: ${scopeString}`);
      }

      scopeString = 'id|gt';
      try {
        queryLoader.getValidScopeString(scopeString);
      } catch(error) {
        expect(error.message).toEqual(`Incorrect Parts supplied for scope: ${scopeString}`);
      }
    });

    it('returns appropriate array value when correct parts are supplied', () => {
      const scopeString = 'id|gt|1';
      expect(queryLoader.getValidScopeString(scopeString)).toEqual(['id', 'gt', '1']);
    });
  });

  describe('queryLoader.getSelectedIncludes()', () => {
    it('returns an empty array when query has no included models', () => {
      const info = getArticlesArgsInfoMock as GraphQLResolveInfo
      const includes = queryLoader.getSelectedIncludes({ 
        model: articleModelMock,
        selections: info.fieldNodes[0].selectionSet.selections
      });
      expect(includes).toEqual([]);
    });

    it('returns a non-empty array when query has an/some included model(s)', () => {
      const info = getArticlesWithIncludesInfoMock as GraphQLResolveInfo
      const includes = queryLoader.getSelectedIncludes({ 
        model: articleModelMock,
        selections: info.fieldNodes[0].selectionSet.selections
      });
      expect(includes.length).toEqual(2);
    });

    it('handles cases where included models next/include other related models', () => {
      const info = getCategoryInfoMock as GraphQLResolveInfo
      const includes = queryLoader.getSelectedIncludes({ 
        model: articleModelMock,
        selections: info.fieldNodes[0].selectionSet.selections
      });
      /**
       * structures expected
       * ```js
       * [{
       *   model: Article,
       *   as: 'articles',
       *   attributes: ['id', 'title'],
       *   required: false,
       *   include: [{
       *     model: User,
       *     as: 'owner',
       *     attributes: ['firstname', 'lastname'],
       *     required: false,
       *     include: []
       *   },
       *   {
       *     model: Comment,
       *     as: 'comments',
       *     attributes: ['id', 'body'],
       *     required: false,
       *     include: []
       *   }]
       * }]
       */
      expect(includes.length).toEqual(1);
      expect(includes[0].include.length).toEqual(2);
    });
  });

  describe('queryLoader.getFindOptions()', () => {
    it('returns object without "include" property, when graphql query lacks included selections', () => {
      const info = getArticlesInfoMock as GraphQLResolveInfo
      const options = queryLoader.getFindOptions({ 
        info,
        model: articleModelMock,
      });
      expect(options.include).toEqual(undefined);
    });

    it('returns object without "where" when graphql query lacks "scope" argument', () => {
      const info = getArticlesInfoMock as GraphQLResolveInfo
      const options = queryLoader.getFindOptions({ 
        info,
        model: articleModelMock,
      });
      expect(options.where).toBe(undefined);
    });

    it('returns object with "include" property, when graphql query has included selections', () => {
      const info = getArticlesWithIncludesInfoMock as GraphQLResolveInfo
      const options = queryLoader.getFindOptions({ 
        info,
        model: articleModelMock,
      });
      expect(options.include.length).toEqual(2);
    });

    it('returns object with "where" property, when graphql query has "scope" argument', () => {
      const info = getArticlesArgsInfoMock as GraphQLResolveInfo
      const options = queryLoader.getFindOptions({ 
        info,
        model: articleModelMock,
      });
      const expectedWhereConstraints: IWhereConstraints = {
        id: {
          [Op.gt]: '2'
        }
      };
      expect(options.where).toEqual(expectedWhereConstraints);
    });

    it('gets findOptions and whereConstraints for deeper shapes', () => {
      const info = getCategoryDeepInfoMock as GraphQLResolveInfo
      const options = queryLoader.getFindOptions({ 
        info,
        model: articleModelMock,
      });

      const expectedStructure = {
        attributes: ['id'],
        include: [{
          as: 'articles',
          attributes: ['id', 'title'],
          include: [{
            as: 'owner',
            attributes: ['firstname', 'lastname'],
            model: userModelMock,
            required: false,
          },
          {
            as: 'comments',
            attributes: ['id', 'body'],
            model: commentModelMock,
            required: false,
          }],
          model: articleModelMock,
          required: false,
          where: {
            body: {
              [Op.like]: '%dummy%'
            },
            id: {
              [Op.gt]: '2'
            },
          },
        }]
      }
    
      expect(options).toEqual(expectedStructure);
    });
  });
});