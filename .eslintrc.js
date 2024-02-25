module.exports = {
  root: true,
  extends: ['standard'],
  globals: {
    IS_DEVELOPMENT: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 13
  },
  rules: {
    'no-new': 0
  }
}
