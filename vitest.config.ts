import { defineConfig, coverageConfigDefaults, defaultExclude } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        // The static HTML report (.vitest-ui/) is written only on request (`pnpm test:unit:report`), not on every run
        reporters: process.env.VITEST_HTML_REPORT === 'true'
            ? ['default', ['html', { outputDir: '.vitest-ui' }]]
            : ['default'],
        coverage: {
            // Vitest 4 removed `coverage.all`: without `include`, only the files that the tests load are reported
            include: ['packages/*/src/**/*.{ts,tsx}'],
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
