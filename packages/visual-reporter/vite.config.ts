import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

const baseName = process.env.GITHUB_PAGES || ''

export default defineConfig({
    plugins: [
        reactRouter(),
    ],
    resolve: {
        // The "~/*" paths of tsconfig.json
        tsconfigPaths: true,
    },
    ...(baseName && { base: baseName }),
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
})
