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
 * }
 */

const getArticlesArgsInfo: GraphQLResolveInfo | any = {
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
          alias: undefined,
          arguments: [],
          directives: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'id',
          },
          selectionSet: undefined,
        },
        {
          alias: undefined,
          arguments: [],
          directives: [],
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'title',
          },
          selectionSet: undefined,
        }
      ],
    },
  }],
};

export default getArticlesArgsInfo;

