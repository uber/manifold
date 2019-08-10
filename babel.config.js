/* global module */
module.exports = {
  plugins: ['@babel/plugin-proposal-class-properties'],
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '3',
      },
    ],
    '@babel/preset-flow',
  ],
  env: {
    test: {
      presets: [['@babel/preset-env'], '@babel/preset-react'],
    },
  },
};
