import { join } from 'node:path'

import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import { CUSTOM_CSS_ID } from './constants.js'
import { checkIsMobile, formatFileName, getAndCreatePath } from './utils.js'
import { saveBase64Image } from '../methods/images.js'

import type { Executor } from '../methods/methods.interfaces.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from './afterScreenshot.interfaces.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import { LogLevel } from './options.interfaces.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'

/**
 * Methods that need to be executed after a screenshot has been taken
 * to set all back to the original state
 */
export default async function afterScreenshot(executor: Executor, options: AfterScreenshotOptions): Promise<ScreenshotOutput> {
    const {
        actualFolder,
        base64Image,
        disableCSSAnimation,
        enableLayoutTesting,
        fileName: fileNameOptions,
        filePath,
        hideElements,
        hideScrollBars: noScrollBars,
        isLandscape,
        isNativeContext,
        logLevel,
        platformName,
        removeElements,
    } = options

    // Get the path
    const path = getAndCreatePath(actualFolder, filePath)

    // Get the filePath
    const fileName = formatFileName(fileNameOptions)

    // Save the screenshot
    await saveBase64Image(base64Image, join(path, fileName))

    if (!isNativeContext){
        // Show the scrollbars again
        if (noScrollBars) {
            await executor(hideScrollBars, !noScrollBars)
        }

        // Show elements again
        if ((hideElements && hideElements.length > 0) || (removeElements && removeElements.length > 0)) {
            try {
                await executor(hideRemoveElements, { hide: hideElements, remove: removeElements }, false)
            } catch (e) {
                if (logLevel === LogLevel.debug || logLevel === LogLevel.warn) {
                    console.log(
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
        }

        // Remove the custom set css
        if (disableCSSAnimation || checkIsMobile(platformName)) {
            await executor(removeElementFromDom, CUSTOM_CSS_ID)
        }

        // Show the text again
        if (enableLayoutTesting){
            await executor(toggleTextTransparency, !enableLayoutTesting)
        }

    }

    // Return the needed data
    return {
        devicePixelRatio: fileNameOptions.devicePixelRatio,
        fileName,
        isLandscape,
        path,
    }
}
