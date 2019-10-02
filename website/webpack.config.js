// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ROOT = resolve(__dirname, '..');
const NODE_MODULES = resolve(ROOT, 'node_modules');
const packageAliases = require(resolve(ROOT, 'alias.config'));

const COMMON_CONFIG = {
  entry: ['./src/main'],
  output: {
    path: resolve(__dirname, 'build'),
    filename: 'bundle.js',
    // publicPath: '/',
  },

  resolve: {
    alias: {
      react: resolve(NODE_MODULES, 'react'),
      'styled-components': resolve(NODE_MODULES, 'styled-components'),
      // Imports the manifold library from the src directory in this repo
      ...packageAliases(),
    },
  },

  module: {
    rules: [
      {
        // Compile ES2015 using bable
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
        },
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              module: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')],
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
      {
        test: /\.(eot|svg|ico|ttf|woff|woff2|gif|jpe?g|png)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(svg|ico|gif|jpe?g|png)$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },

  // node: {
  //   fs: 'empty',
  // },

  // // to support browser history api and remove the '#' sign
  // devServer: {
  //   historyApiFallback: true,
  // },

  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN']),
    new HtmlWebpackPlugin({title: 'manifold demo'}),
  ],
};

const addDevConfig = config => {
  config.module.rules.push({
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre',
    exclude: [/node_modules/],
  });

  return Object.assign(config, {
    devtool: 'source-maps',

    // plugins: config.plugins.concat([
    //   new webpack.HotModuleReplacementPlugin(),
    //   new webpack.NoEmitOnErrorsPlugin(),
    // ]),
  });
};

const addProdConfig = config => {
  return Object.assign(config, {
    output: {
      path: resolve(__dirname, './dist'),
      filename: 'bundle.js',
    },
  });
};

module.exports = env => {
  env = env || {};

  let config = COMMON_CONFIG;

  if (env.local) {
    config = addDevConfig(config);
  }

  if (env.prod) {
    config = addProdConfig(config);
  }

  return config;
};
