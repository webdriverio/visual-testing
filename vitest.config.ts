import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        coverage: {
            thresholds: {
                lines: 10,
                statements: 10,
                functions: 10,
                branches: 10
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
