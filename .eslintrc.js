module.exports = {
    plugins: ['wdio', 'jasmine'],
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'prettier',
        'plugin:wdio/recommended',
        'plugin:jasmine/recommended',
    ],
    env: {
        node: true,
        es6: true,
        jasmine: true,
    },
    globals: {
        chromeBrowserOne: true,
        chromeBrowserTwo: true,
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2016,
        requireConfigFile: false,
        sourceType: 'module',
    },
    rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        indent: [2, 4],

        'import/no-unresolved': [2, { commonjs: true, amd: true }],
        'import/named': 2,
        'import/namespace': 2,
        'import/default': 2,
        'import/export': 2,
        'wdio/no-pause': 'off',
    },
}
