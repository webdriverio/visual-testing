/**
 * By default, React Router will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx react-router reveal` ✨
 * For more information, see https://reactrouter.com/explanation/special-files#entryclienttsx
 */

import { HydratedRouter } from 'react-router/dom'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { getReportBasename, makeManifestPathsAbsolute } from '~/utils/reportBase'
import type { RouterManifest } from '~/utils/reportBase'

declare global {
    interface Window {
        // Set by React Router in the generated index.html, read by `HydratedRouter`
        __reactRouterContext?: { basename?: string }
        __reactRouterManifest?: RouterManifest
    }
}

// The report can be in any folder of a static host (#985): fit the router to the path of the page before it starts
if (window.__reactRouterContext) {
    window.__reactRouterContext.basename = getReportBasename(window.location.pathname)
}
if (window.__reactRouterManifest) {
    makeManifestPathsAbsolute(window.__reactRouterManifest, document.baseURI)
}

startTransition(() => {
    hydrateRoot(
        document,
        <StrictMode>
            <HydratedRouter />
        </StrictMode>
    )
})
