import saveWebScreen from './saveWebScreen.js'
import { executeImageCompare } from '../methods/images.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveScreenOptions } from './screen.interfaces.js'
import { screenMethodCompareOptions } from '../helpers/options.js'
import { extractCommonCheckVariables, buildBaseExecuteCompareOptions } from '../helpers/utils.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkWebScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        checkScreenOptions,
        isNativeContext = false,
        testContext,
    }: InternalCheckScreenMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Extract common variables
    const commonCheckVariables = extractCommonCheckVariables({ folders, instanceData, wicOptions: checkScreenOptions.wic })
    const {
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        enableLegacyScreenshotMethod,
        hideScrollBars,
        hideElements = [],
        removeElements = [],
        waitForFontsLoaded,
    } = checkScreenOptions.method

    // 2. Take the actual screenshot and retrieve the needed data
    const saveScreenOptions: SaveScreenOptions = {
        wic: checkScreenOptions.wic,
        method: {
            disableBlinkingCursor,
            disableCSSAnimation,
            enableLayoutTesting,
            enableLegacyScreenshotMethod,
            hideScrollBars,
            hideElements,
            removeElements,
            waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName, base64Image } = await saveWebScreen({
        browserInstance,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext,
    })

    // 3. Determine the compare options
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)
    const executeCompareOptions = buildBaseExecuteCompareOptions({
        commonCheckVariables,
        wicCompareOptions: checkScreenOptions.wic.compareOptions,
        methodCompareOptions,
        devicePixelRatio,
        fileName,
    })

    // 4. Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
        actualBase64Image: base64Image,
    })
}
