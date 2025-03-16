import { defineConfig, coverageConfigDefaults, defaultExclude } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        reporters: ['default', ['html', { outputFile: '.vitest-ui/index.html' }]],
        coverage: {
            thresholds: {
                lines: 50,
                statements: 50,
                functions: 50,
                branches: 50
            },
            exclude: [
                ...coverageConfigDefaults.exclude,
                // Types
                '**/types.ts',
                '**/*.interfaces.ts',
                // Ignored folder
                '**/resemble/**',
                '**/dist/**',
                // Others
                'packages/visual-reporter/', // Need to improve visual reporter tests
            ]
        },
        exclude: {
            ...defaultExclude
        }
    }
})
