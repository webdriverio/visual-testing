/**
 * The report is built with relative paths (Vite `base: './'`), so it works in any folder of a static host, for
 * example an S3 bucket, a CI artifact or GitHub Pages (#985). These helpers fit React Router to that.
 */

interface ManifestModule {
    module?: string
    imports?: string[]
    css?: string[]
}

export interface RouterManifest {
    entry?: ManifestModule
    routes?: Record<string, ManifestModule | undefined>
    url?: string
}

/**
 * The router base name for the page at `pathname`. The report has one route, which must match the path of the page:
 * `/run-1/`, `/run-1/index.html`, ...
 */
export function getReportBasename(pathname: string): string {
    return pathname.replace(/\/$/, '') || '/'
}

/**
 * React Router puts the Vite `base` in front of the module paths of its manifest (`./assets/...`) and imports them
 * from its own module, which is in `assets/`, so a relative path would point to `assets/assets/...`. Make the
 * relative paths absolute to the page. Absolute paths (for example from a `GITHUB_PAGES` build) do not change.
 */
export function makeManifestPathsAbsolute(manifest: RouterManifest, pageUrl: string): void {
    const toAbsolute = (path: string) => path.startsWith('./') ? new URL(path, pageUrl).href : path
    const fix = (manifestModule?: ManifestModule) => {
        if (!manifestModule) {
            return
        }
        if (manifestModule.module) {
            manifestModule.module = toAbsolute(manifestModule.module)
        }
        if (manifestModule.imports) {
            manifestModule.imports = manifestModule.imports.map(toAbsolute)
        }
        if (manifestModule.css) {
            manifestModule.css = manifestModule.css.map(toAbsolute)
        }
    }

    fix(manifest.entry)
    Object.values(manifest.routes ?? {}).forEach(fix)
    if (manifest.url) {
        manifest.url = toAbsolute(manifest.url)
    }
}
