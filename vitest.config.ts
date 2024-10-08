import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        coverage: {
            thresholds: {
                lines: 50,
                statements: 50,
                functions: 50,
                branches: 50
            },
            exclude: [
                'packages/service/src/types.ts',
                'packages/visual-reporter/',
                'packages/visual-remix-reporter/',
                '.eslintrc.cjs',
                'tests/**',
                '**/*.interfaces.ts',
                '**/storybookTypes.ts',
                '**/apps/**',
                '**/dist/**',
                '**/resemble/**',
                'eslint.config.cjs',
                'vitest.config.ts',
                '.tmp/**',
            ]
        },
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist',
            '.idea',
            '.git',
            '.cache',
            '**/node_modules/**',
        ]
    }
})
