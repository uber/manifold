const {resolve} = require('path');
const ROOT = resolve(__dirname, '../..');
const getLocalModuleAliases = require(resolve(ROOT, 'alias.config.js'));
const externals = ['base/js/namespace', 'base/js/events', 'base/js/utils'];

module.exports = {
  mode: 'development',
  context: resolve(__dirname),
  entry: {
    app: [resolve('./src')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
        },
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      ...getLocalModuleAliases(),
    },
  },
  externals,
};
