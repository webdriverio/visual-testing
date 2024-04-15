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
                '.eslintrc.cjs',
                'tests/**',
                '**/*.interfaces.ts',
                '**/storybookTypes.ts'
            ]
        },
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist', '.idea', '.git', '.cache',
            '**/node_modules/**',
        ],
        // We're hitting this error https://github.com/vitest-dev/vitest/issues/740, which results in the following error:
        // Error: Module did not self-register: '/Users/Git/wdio/visual-testing/node_modules/.pnpm/canvas@2.11.2/node_modules/canvas/build/Release/canvas.node'.
        // Setting the threads to 1 will prevent this error from happening
        // It slows down the tests, but it's better than having them fail
        poolOptions: {
            threads: {
                minThreads: 0,
                maxThreads: 1,
            }
        }
    }
})
