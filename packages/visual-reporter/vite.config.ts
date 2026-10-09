import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const baseName = process.env.GITHUB_PAGES || ''

export default defineConfig({
    plugins: [
        reactRouter(),
        tsconfigPaths(),
    ],
    ...(baseName && { base: baseName }),
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
})
