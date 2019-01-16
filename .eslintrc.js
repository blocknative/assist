module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: ['airbnb/base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-mutable-exports': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'import/named': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-shadow': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    'import/no-cycle': 'off'
  }
}
