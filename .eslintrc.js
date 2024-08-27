module.exports = {
  root: true,
  extends: ['standard'],
  globals: {
    IS_DEVELOPMENT: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true
  },
  rules: {
    'no-new': 0
  }
}
