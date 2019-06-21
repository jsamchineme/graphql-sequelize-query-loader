import {
  GraphQLResolveInfo
} from 'graphql';

/**
 * A mock of the structure of the info object produced when a query
 * like this is sent from graphql
 * ```js
 * articles(scope: "id|gt|2") {
 *   id
 *   title
 *   owner {
 *     firstname
 *     lastname
 *   }
 *   comments {
 *     id
 *     body
 *   }
 * }
 */

const getArticlesWithIncludesInfo: GraphQLResolveInfo | any = {
  fieldName: 'articles',
  fieldNodes: [{
    alias: undefined,
    arguments: [{
      kind: 'Argument',
      name: {
        kind: 'Name',
        value: 'scope',
      },
      value: {
        block: false,
        kind: 'StringValue',
        value: 'id|gt|2',
      },
    }],
    directives: [],
    kind: 'Field',
    selectionSet: {
      kind: 'SelectionSet',
      selections: [{
          arguments: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'id',
          },
          selectionSet: undefined,
        },
        {
          arguments: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'title',
          },
          selectionSet: undefined,
        },
        {
          arguments: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'owner',
          },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [{
                arguments: [],
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'firstname',
                },
                selectionSet: undefined,
              },
              {
                arguments: [],
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'lastname',
                },
                selectionSet: undefined,
              }
            ],
          },
        },
        {
          arguments: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'comments',
          },
          selectionSet: {
            kind: 'SelectionSet',
            selections: [{
                arguments: [],
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'id',
                },
                selectionSet: undefined,
              },
              {
                arguments: [],
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'body',
                },
                selectionSet: undefined,
              }
            ],
          },
        }
      ],
    },
  }],
};

export default getArticlesWithIncludesInfo;