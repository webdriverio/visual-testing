import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const baseName = process.env.GITHUB_PAGES || ''

export default defineConfig({
    plugins: [
        remix({
            ...(baseName && { basename: baseName }),
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
            ssr: false,
        }),
        tsconfigPaths(),
    ],
    ...(baseName && { base: baseName }),
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
})
