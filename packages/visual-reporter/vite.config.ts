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
    // Relative paths, so the report works in any folder of a static host (S3, CI artifacts, GitHub Pages) (#985)
    base: baseName || './',
    build: {
        // The browsers of Vite 5's 'modules' target, which Vite 7 removed: the report is often opened in another
        // browser than the one under test. The Vite 8 default ('baseline-widely-available') needs Chrome/Edge 111+,
        // Firefox 114+ and Safari 16.4+
        target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
})
