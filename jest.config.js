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
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/*.js'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['__fixtures__', 'stories', '__tests__'],
  coverageReporters: ['cobertura', 'text', 'html'],
  moduleNameMapper: aliasMapper,
  modulePathIgnorePatterns: ['/dist/'],
  testMatch: ['**/*.(spec|test).js', '**/*-(spec|test).js', '**/test/*.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '__fixtures__',
    'stories',
    '.cache',
  ],
  // jest defaults to browser environment which raises errors in tfjs during testing
  // https://github.com/tensorflow/tfjs/issues/540#issuecomment-408716995
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(gatsby|apache-arrow)/)'],
  setupTestFrameworkScriptFile: './utils/setupTests.js',
};
