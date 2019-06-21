# GraphQL-Sequelize Query Mapper
[![codecov](https://codecov.io/gh/jsamchineme/graphql-sequelize-query-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/jsamchineme/graphql-sequelize-query-loader)
[![Build Status](https://travis-ci.com/jsamchineme/graphql-sequelize-query-loader.svg?branch=master)](https://travis-ci.com/jsamchineme/graphql-sequelize-query-loader)
[![codebeat badge](https://codebeat.co/badges/0c5b767b-a1e4-4f4f-9feb-5911690d1077)](https://codebeat.co/projects/github-com-jsamchineme-graphql-sequelize-query-loader-master)
[![License](https://badgen.net/github/license/jsamchineme/graphql-sequelize-query-loader)](https://github.com/jsamchineme/graphql-sequelize-query-loader/blob/master/LICENCE)

This utility tool inspects the structure of a GraphQL Query and converts it to query parameters that Sequelize understands, to facilitate eagerloading of associated resources.

# Overview
Essentially, the tool expects that all sequelize models have set on them the appropriate associations to all related resources. Then, when given a GraphQL query, it parses the info object made available as a parameter in GraphQL Query Resolvers, producing an object which includes ONLY the selected resources and with ONLY the specified attributes. This solves for the `N + 1` problem with database querying, as well as the issue of `over-fetching` of table attributes in result sets.