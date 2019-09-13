const {resolve} = require('path');

const ROOT = resolve(__dirname, '../../..');
const JUPYTER_MODULES = resolve(__dirname, '../../jupyter-modules');

const AliasConfig = require(resolve(ROOT, 'alias.config.js')).AliasConfig;
const getLocalModuleAliases = AliasConfig();
const getJupyterModuleAliases = AliasConfig(JUPYTER_MODULES);

const externals = [
  '@jupyter-widgets/base',
  'base/js/namespace',
  'base/js/events',
  'base/js/utils',
];

module.exports = [
  {
    mode: 'development',
    entry: {
      app: [resolve('./src/index.js')],
    },
    devtool: 'source-maps',
    output: {
      path: resolve('../mlvis/static'),
      filename: 'index.js',
      libraryTarget: 'umd',
    },
    resolve: {
      extensions: ['.js'],
      alias: {
        // resolving deck.gl version conflict issue:
        // deck.gl does not allow different versions of deck.gl instances
        // running at the same time. So these settings corece all packages
        // to use the same deck.gl instance
        '@deck.gl': resolve(ROOT, 'node_modules', '@deck.gl'),
        '@luma.gl': resolve(ROOT, 'node_modules', '@luma.gl'),
        ...getJupyterModuleAliases(),
        ...getLocalModuleAliases(),
      },
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
    externals,
  },
  {
    mode: 'development',
    entry: {
      app: [resolve('./src/extension.js')],
    },
    output: {
      path: resolve('../mlvis/static'),
      filename: 'extension.js',
      libraryTarget: 'umd',
    },
    resolve: {
      extensions: ['.js'],
    },
  },
];
