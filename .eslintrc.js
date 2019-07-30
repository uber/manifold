/* eslint-env node */
module.exports = {
  extends: [
    "plugin:react/recommended",
    "plugin:jest/recommended",
    "eslint-config-uber-universal-stage-3"
  ],
  env: {
    jest: true,
    node: true,
  },
  settings: {
    "react": {
      "version" : "16.6.1"
    }
  },
  plugins: [
    "eslint-plugin-react"
  ],
  rules: {
    "react/prop-types": 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-dynamic-require': 'off',
    'react/display-name': 'off',
  },
};
