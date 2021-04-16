const typescriptRules = {
  '@typescript-eslint/member-delimiter-style': [
    'error',
    {
      multiline: {
        delimiter: 'none',
        requireLast: false,
      },
      singleline: {
        delimiter: 'semi',
        requireLast: false,
      },
    },
  ],
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
    },
  ],
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: false,
    },
  ],
  '@typescript-eslint/no-inferrable-types': [
    'error',
    {
      ignoreParameters: true,
    },
  ],
  '@typescript-eslint/no-empty-interface': [
    'error',
    {
      allowSingleExtends: true,
    },
  ],
}

const importRules = {
  'import/no-cycle': 'off',
  'import/prefer-default-export': 'off',
}

module.exports = {
  extends: ['airbnb-typescript/base', 'prettier'],
  plugins: ['prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-warning-comments': [2, { terms: ['fixme'], location: 'anywhere' }],
    'no-shadow': 'off',
    'no-plusplus': 'off',
    'consistent-return': 'off',
    'default-case': 'off',
    'spaced-comment': 'off',
    'no-prototype-builtins': 'off',
    'lines-between-class-members': 'off',
    'no-restricted-syntax': 'off',
    // ESLint bug https://github.com/prettier/prettier-eslint/issues/182
    'implicit-arrow-linebreak': 'off',
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    ...importRules,
    ...typescriptRules,
  },
}
