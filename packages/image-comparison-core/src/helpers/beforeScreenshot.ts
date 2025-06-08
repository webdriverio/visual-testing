import logger from '@wdio/logger'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import setCustomCss from '../clientSideScripts/setCustomCss.js'
import { CUSTOM_CSS_ID } from './constants.js'
import { checkIsMobile, getAddressBarShadowPadding, getToolBarShadowPadding, waitFor } from './utils.js'
import getEnrichedInstanceData from '../methods/instanceData.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from './beforeScreenshot.interfaces.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'
import waitForFonts from '../clientSideScripts/waitForFonts.js'

const log = logger('@wdio/visual-service:beforeScreenshot')

/**
 * Methods that need to be executed before a screenshot will be taken
 */
export default async function beforeScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: BeforeScreenshotOptions,
    addShadowPadding = false,
): Promise<BeforeScreenshotResult> {
    const { browserName, nativeWebScreenshot, platformName } = options.instanceData
    const {
        addressBarShadowPadding,
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        hideElements,
        noScrollBars,
        removeElements,
        toolBarShadowPadding,
        waitForFontsLoaded,
    } = options
    const addressBarPadding = getAddressBarShadowPadding({
        platformName,
        browserName,
        nativeWebScreenshot,
        addressBarShadowPadding,
        addShadowPadding,
    })
    const toolBarPadding = getToolBarShadowPadding({ platformName, browserName, toolBarShadowPadding, addShadowPadding })

    // Wait for the fonts to be loaded
    if (waitForFontsLoaded){
        try {
            await browserInstance.execute(waitForFonts)
        } catch (e) {
            log.debug('Waiting for fonts to load threw an error:', e)
        }
    }

    // Hide the scrollbars
    if (noScrollBars) {
        await browserInstance.execute(hideScrollBars, noScrollBars)
    }

    // Hide and or Remove elements
    if (hideElements.length > 0 || removeElements.length > 0) {
        try {
            await browserInstance.execute(hideRemoveElements, { hide: hideElements, remove: removeElements }, true)
        } catch (e) {
            log.warn(
                '\x1b[33m%s\x1b[0m',
                `
#####################################################################################
 WARNING:
 (One of) the elements that needed to be hidden or removed could not be found on the
 page and caused this error
 Error: ${e}
 We made sure the test didn't break.
#####################################################################################
`,
            )
        }
    }

    // Set some custom css
    if (disableCSSAnimation || disableBlinkingCursor || checkIsMobile(platformName)) {
        await browserInstance.execute(setCustomCss, { addressBarPadding, disableBlinkingCursor, disableCSSAnimation, id: CUSTOM_CSS_ID, toolBarPadding })
        // Wait at least 500 milliseconds to make sure the css is applied
        // Not every device is fast enough to apply the css faster
        await waitFor(500)
    }

    // Make all text transparent
    if (enableLayoutTesting){
        await browserInstance.execute(toggleTextTransparency, enableLayoutTesting)
        // Wait at least 500 milliseconds to make sure the css is applied
        // Not every device is fast enough to apply the css faster
        await waitFor(500)
    }

    // Get all the needed instance data
    const instanceOptions = {
        addressBarShadowPadding: options.addressBarShadowPadding,
        toolBarShadowPadding: options.toolBarShadowPadding,
        ...options.instanceData,
    }

    return getEnrichedInstanceData(browserInstance, instanceOptions, addShadowPadding)
}
