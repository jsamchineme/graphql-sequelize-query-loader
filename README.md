# graphql-sequelize-query-loader

Convert GraphQL Query to query options for Sequelize models facilitating eagerloading of associated resources.

[![codecov](https://codecov.io/gh/jsamchineme/graphql-sequelize-query-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/jsamchineme/graphql-sequelize-query-loader)
[![Build Status](https://travis-ci.com/jsamchineme/graphql-sequelize-query-loader.svg?branch=master)](https://travis-ci.com/jsamchineme/graphql-sequelize-query-loader)
[![codebeat badge](https://codebeat.co/badges/0c5b767b-a1e4-4f4f-9feb-5911690d1077)](https://codebeat.co/projects/github-com-jsamchineme-graphql-sequelize-query-loader-master)
[![License](https://badgen.net/github/license/jsamchineme/graphql-sequelize-query-loader)](https://github.com/jsamchineme/graphql-sequelize-query-loader/blob/master/LICENCE)

### Overview
Essentially, the tool expects that all sequelize models have set on them the appropriate associations to all related resources. Then, when given a GraphQL query, it parses the info object made available as a parameter in GraphQL Query Resolvers, producing an object which includes ONLY the selected resources and with ONLY the specified attributes. 
<br>
This solves for the `N + 1` problem with database querying, as well as the issue of `over-fetching` of table attributes in result sets.

## Installation
`$ npm install --save graphql-sequelize-query-loader`

## Pre-requisites
In order to use the helper to eagerload related entities, you need to have setup the associations on the Sequelize Models.

## Features
- maps the selected fields (in all models found in a GraphQL query) to the `attributes` option for Sequelize `Model.Find
- maps included models found in the GraphQL query to `include` option properties
- converts `scope` argument in GraphQL query and turns them to `where` option properties

## Usage
```js
import queryLoader from 'graphql-sequelize-query-loader';
import models from 'path/to/sequelize/models';

/**
 * dictionary of what sequelize models respectively match the named resources
 * captured on the graphql schema
 */
const includeModels = {
  articles: models.Article,
  article: models.Article,
  owner: models.User,
  category: models.category,
  comments: models.Comment,
};

/* 
 * Initiliase the loader with "includeModels", 
 * a map of all models referenced in GraphQL with their respective Sequelize Model
 */
queryLoader.init({ includeModels });

/**
 * GraphQL
 */
Query: {
  articles: async (parent, args, { models }, info) => {
    const { Article } = models;
    const queryOptions = queryLoader.getFindOptions({ model: Article, info });
    const articles = await Article.findAll(queryOptions);
    return articles;
  },
},
```

## Examples
You can find examples in the [demo](https://github.com/jsamchineme/graphql-sequelize-query-loader/tree/add-example-project/demo) directory. 
It contains migrations, models and seeds setup for testing out the app. 
<br> It also contains graphql schemas and resolvers with examples of how the `queryLoader` utility is used

## Testing the Demo
On the [git repo](https://github.com/jsamchineme/graphql-sequelize-query-loader/tree/add-example-project/demo) 
You can quickly test the demo and play with the code using `Gitpod`.
<br>Gitpod is a full blown IDE created on the fly from a git repository.
<br>It allows us to test a github project with just the browser.
Learn [more about gitpod](https://www.gitpod.io/) OR [install the chrome extension](https://chrome.google.com/webstore/detail/gitpod-online-ide/dodmmooeoklaejobgleioelladacbeki)

- clone the repo, if you want to test locally
- check into the `demo` directory. `$cd demo`
- environment should be set to `development`. This is already setup in the package.json scripts <br>
- setup `DATABASE_URL`: You can use this database created with elephantsql. <br>
  `postgres://cigjzbzt:krzc-48qlH4hfj0HM5Oid_rfxN9uLbuf@raja.db.elephantsql.com:5432/cigjzbzt`
- `npm install`
- run migrations and seeds - `npm run db:seed` (optional): This will create tables and seed them with dummy data. If you are testing the project locally, you will definitely need to this the first time, but if you are testing it online with gitpod, the database has already been migrated and seeded, so you don't have to do this step.
- Start the development server: `npm start`

## Unit Tests

`npm test`
<br><br>
You can find the test cases in the [`/src/__tests__`](https://github.com/jsamchineme/graphql-sequelize-query-loader/blob/add-example-project/src/__tests__/queryLoader.spec.ts) directory
<br><br>

## Scope Argument

This allows us to query models and return records matching certain conditions. 
Currently, we support a small set of Sequelize operators with the `scope` argument

### Usage

In a GraphQL query, provide `scope` argument with the following pattern
`field|operator|value`

Example
```js
articles(scope: 'title|like|%graphql%') {
  id
  title
}
```

### Supported Scope Operators 
eq, gt, gte, like, lt, lte, ne

<br>

## Author
Samuel Osuh @jsamchineme
