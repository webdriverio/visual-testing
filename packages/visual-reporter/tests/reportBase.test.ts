import { describe, it, expect } from 'vitest'
import { getReportBasename, makeManifestPathsAbsolute } from '../app/utils/reportBase.js'
import type { RouterManifest } from '../app/utils/reportBase.js'

describe('reportBase (#985)', () => {
    describe('getReportBasename', () => {
        it.each([
            ['/', '/'],
            ['/index.html', '/index.html'],
            ['/reports/run-1/', '/reports/run-1'],
            ['/reports/run-1/index.html', '/reports/run-1/index.html'],
            ['', '/'],
        ])('should use the path of the page %j as the base name %j', (pathname, basename) => {
            expect(getReportBasename(pathname)).toBe(basename)
        })
    })

    describe('makeManifestPathsAbsolute', () => {
        const createManifest = (): RouterManifest => ({
            entry: { module: './assets/entry.client.js', imports: ['./assets/react-dom.js'] },
            routes: {
                root: { module: './assets/root.js', imports: ['./assets/jsx-runtime.js'], css: ['./assets/globals.css'] },
                'routes/_index': { module: './assets/_index.js', css: ['./assets/_index.css'] },
            },
            url: './assets/manifest.js',
        })

        it('should make the relative paths absolute to the page in a folder of a static host', () => {
            const manifest = createManifest()

            makeManifestPathsAbsolute(manifest, 'https://bucket.s3.amazonaws.com/reports/run-1/index.html?X-Amz-Signature=abc')

            const base = 'https://bucket.s3.amazonaws.com/reports/run-1/assets'
            expect(manifest).toEqual({
                entry: { module: `${base}/entry.client.js`, imports: [`${base}/react-dom.js`] },
                routes: {
                    root: { module: `${base}/root.js`, imports: [`${base}/jsx-runtime.js`], css: [`${base}/globals.css`] },
                    'routes/_index': { module: `${base}/_index.js`, css: [`${base}/_index.css`] },
                },
                url: `${base}/manifest.js`,
            })
        })

        it('should use the folder of a directory URL', () => {
            const manifest = createManifest()

            makeManifestPathsAbsolute(manifest, 'https://example.com/reports/run-1/')

            expect(manifest.routes?.['routes/_index']?.module).toBe('https://example.com/reports/run-1/assets/_index.js')
        })

        it('should not change absolute paths, for example of a GITHUB_PAGES build', () => {
            const manifest: RouterManifest = { routes: { root: { module: '/visual-testing/assets/root.js' } } }

            makeManifestPathsAbsolute(manifest, 'https://example.com/visual-testing/index.html')

            expect(manifest.routes?.root?.module).toBe('/visual-testing/assets/root.js')
        })

        it('should accept a manifest without some fields', () => {
            const manifest: RouterManifest = { routes: { root: undefined, other: {} } }

            expect(() => makeManifestPathsAbsolute(manifest, 'https://example.com/')).not.toThrow()
            expect(manifest).toEqual({ routes: { root: undefined, other: {} } })
        })
    })
})
