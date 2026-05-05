const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['dist/**', 'node_modules/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    plugins: { import: importPlugin },
    rules: {
      'no-undef': 'off',
      'import/no-unresolved': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  prettier,
];
