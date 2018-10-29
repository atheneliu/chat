module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'eslint:recommended',
    'airbnb-base'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [
      2,
      'never'
    ],
    'comma-dangle': [
      2,
      'always-multiline'
    ],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never'
      }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        optionalDependencies: [
          'test/unit/index.js'
        ]
      }
    ],
    'global-require': 0,
    'indent': [
      2,
      2,
      {
        SwitchCase: 1
      }
    ],
    'no-alert': 0,
    'no-console': 0,
    'no-undef': 1,
    'no-confusing-arrow': 0,
    'id-length': 0,
    'consistent-return': 0,
    'class-methods-use-this': 0,
    'max-len': [
      2,
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false
      }
    ],
    'new-cap': [
      2,
      {
        capIsNewExceptions: [
          'express.Router',
          'Radium'
        ]
      }
    ],
    'no-param-reassign': [
      2,
      {
        props: false
      }
    ],
    'no-underscore-dangle': [
      2,
      {
        allow: [
          '__CLIENT__',
          '__SERVER__'
        ]
      }
    ],
    'no-plusplus': [
      2,
      {
        allowForLoopAfterthoughts: true
      }
    ],
    'no-new': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
