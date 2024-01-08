import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        coverage: {
            thresholds: {
                lines: 57,
                statements: 57,
                functions: 74,
                branches: 86
            },
            exclude: [
                'packages/service/src/types.ts',
                '.eslintrc.cjs',
                'tests/**',
                '**/*.interfaces.ts',
            ]
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
