import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, rmSync, statSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { browser, expect } from '@wdio/globals'

/**
 * The report of @wdio/visual-reporter must work in any folder of a static host, for example an AWS S3 bucket (#985).
 * The spec makes a report of the demo data with the CLI of the built reporter (`pnpm build`), and serves it like S3:
 * files by path, no fallback to index.html, in a sub-folder. Every request that is not found is a failure.
 */
const reportFolder = join(process.cwd(), '.tmp/visual-reporter-e2e')
const reportRoot = join(reportFolder, 'report')
const mount = '/reports/run-1/'
const contentTypes: Record<string, string> = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
}

/**
 * Get the file of the report for a decoded request path, or '' when the path is not in the report folder (also with
 * `..` segments)
 */
function getReportFile(path: string | null): string {
    if (!path?.startsWith(mount)) {
        return ''
    }
    const file = resolve(reportRoot, path.slice(mount.length))

    return file === reportRoot || file.startsWith(`${reportRoot}${sep}`) ? file : ''
}

/**
 * Decode the path of a request, or null when it can not be decoded (for example a single `%`)
 */
function decodePath(url: string): string | null {
    try {
        return decodeURIComponent(url.split('?')[0])
    } catch {
        return null
    }
}

describe('@wdio/visual-reporter on a static host', () => {
    let server: Server
    let baseUrl = ''
    const notFound: string[] = []

    before(() => {
        rmSync(reportFolder, { recursive: true, force: true })
        execFileSync('node', [
            join(process.cwd(), 'packages/visual-reporter/dist/cli.js'),
            `--jsonOutput=${join(process.cwd(), 'packages/visual-reporter/demo/output.json')}`,
            `--reportFolder=${reportFolder}`,
        ], { stdio: 'inherit' })

        server = createServer((request, response) => {
            const path = decodePath(request.url ?? '')
            let file = getReportFile(path)
            if (file && existsSync(file) && statSync(file).isDirectory()) {
                file = join(file, 'index.html')
            }
            if (!file || !existsSync(file)) {
                // The browser asks for /favicon.ico at the root of the host by itself, it is not a request of the report
                if (path !== '/favicon.ico') {
                    notFound.push(path ?? request.url ?? '')
                }
                response.writeHead(404).end()
                return
            }
            response.writeHead(200, { 'content-type': contentTypes[extname(file)] ?? 'application/octet-stream' })
            createReadStream(file).pipe(response)
        })

        return new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => {
            const address = server.address()
            baseUrl = address && typeof address === 'object' ? `http://127.0.0.1:${address.port}` : ''
            resolve()
        }))
    })

    after(() => new Promise<void>((resolve) => server.close(() => resolve())))

    beforeEach(() => {
        notFound.length = 0
    })

    for (const page of ['index.html', '']) {
        it(`shows the report at ${mount}${page}`, async () => {
            await browser.url(`${baseUrl}${mount}${page}`)

            // The report shows a thumbnail for each check of the demo data, when its data and images are loaded
            await browser.waitUntil(async () => browser.execute(() => {
                const images = Array.from(document.images)
                return images.length > 1 && images.every((image) => image.complete && image.naturalWidth > 0)
            }), { timeout: 15000, timeoutMsg: 'The report did not show its images' })

            expect(await browser.execute(() => document.body.innerText)).not.toContain('404')
            expect(notFound).toEqual([])
        })
    }
})
