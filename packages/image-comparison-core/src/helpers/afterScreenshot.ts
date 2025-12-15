import { join } from 'node:path'
import logger from '@wdio/logger'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import { CUSTOM_CSS_ID } from './constants.js'
import { formatFileName, getAndCreatePath } from './utils.js'
import { saveBase64Image } from '../methods/images.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from './afterScreenshot.interfaces.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:afterScreenshot')

/**
 * Methods that need to be executed after a screenshot has been taken
 * to set all back to the original state
 */
export default async function afterScreenshot(browserInstance: WebdriverIO.Browser, options: AfterScreenshotOptions): Promise<ScreenshotOutput> {
    const {
        actualFolder,
        base64Image,
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        fileName: fileNameOptions,
        filePath,
        hideElements,
        hideScrollBars: noScrollBars,
        isLandscape,
        isNativeContext,
        removeElements,
        alwaysSaveActualImage,
    } = options
    const path = getAndCreatePath(actualFolder, filePath)
    const fileName = formatFileName(fileNameOptions)
    const result: ScreenshotOutput = {
        devicePixelRatio: fileNameOptions.devicePixelRatio,
        fileName,
        isLandscape,
        path,
    }

    if (alwaysSaveActualImage) {
        await saveBase64Image(base64Image, join(path, fileName))
    } else {
        result.base64Image = base64Image
    }

    if (isNativeContext) {
        return result
    }

    if (noScrollBars) {
        await browserInstance.execute(hideScrollBars, !noScrollBars)
    }

    if ((hideElements && hideElements.length > 0) || (removeElements && removeElements.length > 0)) {
        try {
            await browserInstance.execute(hideRemoveElements, { hide: hideElements, remove: removeElements }, false)
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

    if (disableCSSAnimation || disableBlinkingCursor || browserInstance.isMobile) {
        await browserInstance.execute(removeElementFromDom, CUSTOM_CSS_ID)
    }

    if (enableLayoutTesting){
        await browserInstance.execute(toggleTextTransparency, !enableLayoutTesting)
    }

    return result
}
