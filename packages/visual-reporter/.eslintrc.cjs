/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        commonjs: true,
        es6: true,
    },
    ignorePatterns: ['!**/.server', '!**/.client'],

    // Base config
    extends: ['eslint:recommended'],

    overrides: [
    // React
        {
            files: ['**/*.{js,jsx,ts,tsx}'],
            plugins: ['react', 'jsx-a11y'],
            extends: [
                'plugin:react/recommended',
                'plugin:react/jsx-runtime',
                'plugin:react-hooks/recommended',
                'plugin:jsx-a11y/recommended',
            ],
            settings: {
                react: {
                    version: 'detect',
                },
                formComponents: ['Form'],
                linkComponents: [
                    { name: 'Link', linkAttribute: 'to' },
                    { name: 'NavLink', linkAttribute: 'to' },
                ],
                'import/resolver': {
                    typescript: {},
                },
            },
        },

        // Typescript
        {
            files: ['**/*.{ts,tsx}'],
            plugins: ['@typescript-eslint', 'import'],
            parser: '@typescript-eslint/parser',
            settings: {
                'import/internal-regex': '^~/',
                'import/resolver': {
                    node: {
                        extensions: ['.ts', '.tsx'],
                    },
                    typescript: {
                        alwaysTryTypes: true,
                    },
                },
            },
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:import/recommended',
                'plugin:import/typescript',
            ],
            rules: {
                // Enforce max line length
                'max-len': ['error', {
                    code: 140,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true
                }],
                // Enforce no extra blank lines between const declarations
                'no-multiple-empty-lines': ['error', {
                    max: 1,
                    maxEOF: 1,
                    maxBOF: 0
                }],
                // Enforce consistent spacing around operators
                'operator-linebreak': ['error', 'before'],
                // Enforce consistent object formatting
                'object-curly-spacing': ['error', 'always'],
                // Enforce consistent object property formatting
                'object-property-newline': ['error', {
                    allowAllPropertiesOnSameLine: true
                }],
                // Enforce consistent spacing in object literals
                'object-curly-newline': ['error', {
                    ObjectExpression: {
                        multiline: true,
                        minProperties: 2
                    },
                    ObjectPattern: {
                        multiline: true,
                        minProperties: 2
                    }
                }]
            }
        },

        // Node
        {
            files: ['.eslintrc.cjs'],
            env: {
                node: true,
            },
        },
    ],
}
