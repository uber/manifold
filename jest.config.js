// @flow
/* global module */
const packageAliases = require('./alias.config')();

// ensure sub-directories of these packages can also be resolved
// e.g. `@uber/mivis-common/utils` will map to `<rootDir>/packages/mlvis-common/src/utils`
// instead of `<rootDir>/packages/mlvis-common/src`
const aliasMapper = Object.keys(packageAliases).reduce((acc, key) => {
  acc[`^${key}(.*)$`] = `${packageAliases[key]}$1`;
  return acc;
}, {});

module.exports = {
  collectCoverageFrom: ['packages/**/*.js'],
  coveragePathIgnorePatterns: ['__fixtures__', 'stories'],
  moduleNameMapper: aliasMapper,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'src/(?:.+?)/__tests__/',
    '.cache',
  ],
  // jest defaults to browser environment which raises errors in tfjs during testing
  // https://github.com/tensorflow/tfjs/issues/540#issuecomment-408716995
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(gatsby)/)'],
};
