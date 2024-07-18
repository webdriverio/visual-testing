module.exports = [
    {
        ignores: [
            '**/resemble.jimp.cjs',
            '**/lib/resemble/*',
            '*/*.d.ts',
            '**/dist/*'
        ]
    },
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            ecmaVersion: 2020,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            'unicorn': require('eslint-plugin-unicorn'),
            'import': require('eslint-plugin-import')
        },
        rules: {
            'quotes': ['error', 'single', { avoidEscape: true }],
            'camelcase': ['error', { properties: 'never' }],
            'semi': ['error', 'never'],
            'indent': ['error', 4],
            'eqeqeq': ['error', 'always'],
            'prefer-const': 'error',
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
            'array-bracket-spacing': ['error', 'never'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'comma-spacing': ['error', { before: false, after: true }],
            'no-lonely-if': 'error',
            'dot-notation': 'error',
            'no-else-return': 'error',
            'no-tabs': 'error',
            'no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
            'no-var': 'error',
            'unicode-bom': ['error', 'never'],
            'curly': ['error', 'all'],
            'object-curly-spacing': ['error', 'always'],
            'keyword-spacing': ['error'],
            'require-atomic-updates': 'off',
            'linebreak-style': ['error', 'unix'],
            'unicorn/prefer-node-protocol': ['error'],
            'import/extensions': ['error', 'ignorePackages'],
            'no-restricted-syntax': ['error', 'IfStatement > ExpressionStatement > AssignmentExpression'],
            'unicorn/prefer-ternary': 'error',

            // TypeScript-specific rules
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            'no-undef': 'off',
            'no-redeclare': 'off'
        }
    },
    {
        files: ['**/*.test.ts'],
        rules: {
            'dot-notation': 'off'
        }
    }
]
