import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // We are getting an error on two files
        //  FAIL  packages/service/tests/matcher.test.ts [ packages/service/tests/matcher.test.ts ]
        //  FAIL  packages/service/tests/utils.test.ts [ packages/service/tests/utils.test.ts ]
        // Error: Module did not self-register: '/Users/wimselles/Git/wdio/visual-testing/node_modules/.pnpm/canvas@2.11.2/node_modules/canvas/build/Release/canvas.node'.
        // ❯ Object.<anonymous> node_modules/.pnpm/canvas@2.11.2/node_modules/canvas/lib/bindings.js:3:18
        // Src: https://github.com/vitest-dev/vitest/issues/740
        threads: false,
        include: ['./packages/**/(tests|src)/**/*.test.ts'],
        coverage: {
            thresholds: {
                lines: 56,
                statements: 56,
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
