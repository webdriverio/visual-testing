import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.test.ts'],
        coverage: {
            enabled: true,
            thresholds: {
                lines: 42,
                statements: 42,
                functions: 50,
                branches: 73
            }
        },
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist', '.idea', '.git', '.cache',
            '**/node_modules/**',
        ]
    }
})
