import logger from '@wdio/logger'
import getScrollPosition from '../clientSideScripts/getScrollPosition.js'
import scrollBackToPosition from '../clientSideScripts/scrollBackToPosition.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:scrollPosition')

/** How long the page must stay at the position on iOS before the next command can start */
export const IOS_STABLE_SCROLL_TIME = 100
/** The maximum time to wait for that on iOS */
export const IOS_MAX_SCROLL_WAIT_TIME = 1000

/**
 * Read the vertical scroll position of the page, so a command that scrolls the page can scroll back (#1231).
 * Returns `undefined` when the position could not be read, then the page is not scrolled back
 */
export async function readScrollPosition(browserInstance: WebdriverIO.Browser): Promise<number | undefined> {
    try {
        return await browserInstance.execute(getScrollPosition)
    } catch (error) {
        log.warn(`Could not read the scroll position before the screenshot, the page will not be scrolled back: ${error}`)
        return undefined
    }
}

/**
 * Scroll back to the position from `readScrollPosition`, without a smooth scroll animation.
 * Only logs a warning when it fails, so it never hides an error of the screenshot itself.
 *
 * On iOS, Safari applies the layout changes of the page (for example the CSS that the screenshot removed) a moment
 * later, and can then put back the old scroll position for some milliseconds. When the next command starts in that
 * time, the page can stay at the old position. So on iOS, wait until the page stays at the position
 */
export async function restoreScrollPosition(browserInstance: WebdriverIO.Browser, position: number | undefined, isIOS = false): Promise<void> {
    if (typeof position !== 'number') {
        return
    }
    try {
        await browserInstance.execute(scrollBackToPosition, position)
        if (isIOS) {
            await waitForStableScrollPosition(browserInstance, position)
        }
    } catch (error) {
        log.warn(`Could not scroll back to the position before the screenshot: ${error}`)
    }
}

async function waitForStableScrollPosition(browserInstance: WebdriverIO.Browser, position: number): Promise<void> {
    const start = Date.now()
    let atPositionSince: number | undefined
    while (Date.now() - start < IOS_MAX_SCROLL_WAIT_TIME) {
        const current = await browserInstance.execute(getScrollPosition)
        if (Math.abs(current - position) > 1) {
            atPositionSince = undefined
            continue
        }
        atPositionSince ??= Date.now()
        if (Date.now() - atPositionSince >= IOS_STABLE_SCROLL_TIME) {
            return
        }
    }
    log.debug(`The page did not stay at the scroll position ${position} for ${IOS_STABLE_SCROLL_TIME} ms within ${IOS_MAX_SCROLL_WAIT_TIME} ms`)
}
