const TEST_FILES = ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts']
const MODULE_NAMES = ['Account', 'Cashdesks', 'Cashier', 'Dashboard', 'Orders', 'Settings', 'Settlements', 'Users']
const MODULE_INTERNAL_SEGMENTS = ['components', 'hooks', 'lib', 'pages', 'ui']

function getModuleInternalPatterns(moduleNames) {
  return moduleNames.flatMap((moduleName) =>
    MODULE_INTERNAL_SEGMENTS.map((segment) => `@/modules/${moduleName}/${segment}/**`),
  )
}

function makeDeepImportRule(moduleNames, message) {
  return [
    'error',
    {
      patterns: [
        {
          group: getModuleInternalPatterns(moduleNames),
          message,
        },
      ],
    },
  ]
}

module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  rules: {
    ...require('eslint-plugin-react-hooks').configs.recommended.rules,
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  overrides: [
    {
      files: TEST_FILES,
      globals: {
        test: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    {
      files: ['src/app/**/*.{ts,tsx}'],
      excludedFiles: TEST_FILES,
      rules: {
        'no-restricted-imports': makeDeepImportRule(
          MODULE_NAMES,
          'App layer must import feature modules only through their public module APIs (`index.ts` or `api/index.ts`), not through internal pages/components/lib folders.',
        ),
      },
    },
    {
      files: ['src/core/**/*.{ts,tsx}'],
      excludedFiles: TEST_FILES,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/app/**'],
                message: 'Core layer must not depend on app layer.',
              },
              {
                group: ['@/modules/**'],
                message: 'Core layer must not depend on feature modules.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/shared/**/*.{ts,tsx}'],
      excludedFiles: TEST_FILES,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/app/**'],
                message: 'Shared layer must stay app-agnostic and must not import from app.',
              },
              {
                group: ['@/core/**'],
                message: 'Shared layer must stay core-agnostic.',
              },
              {
                group: ['@/modules/**'],
                message: 'Shared layer must not import feature modules.',
              },
            ],
          },
        ],
      },
    },
    ...MODULE_NAMES.map((moduleName) => ({
      files: [`src/modules/${moduleName}/**/*.{ts,tsx}`],
      excludedFiles: TEST_FILES,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/app/**'],
                message: 'Feature modules must not depend on app layer.',
              },
              {
                group: getModuleInternalPatterns(MODULE_NAMES.filter((name) => name !== moduleName)),
                message:
                  'Feature modules may import other modules only through their public module APIs (`index.ts` or `api/index.ts`). Deep imports into another module internal pages/components/lib are not allowed.',
              },
            ],
          },
        ],
      },
    })),
  ],
}
