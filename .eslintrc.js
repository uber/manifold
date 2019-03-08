/* eslint-env node */
module.exports = {
  extends: [require.resolve('eslint-config-fusion')],
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-dynamic-require': 'off',
    'react/display-name': 'off',
  },
};
