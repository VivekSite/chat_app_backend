const prettier = require('prettier')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser
    },
    plugins: {
      prettier,
      typescriptEslint
    },
    rules: {
      'indent': ['error', 2],
      'no-unused-vars': 'warn'
    },
    ignores: ['node_modules', '**/.*', 'src/**/*.d.ts', 'dist']
  }
]
