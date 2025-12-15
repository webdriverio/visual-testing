import { executeImageCompare } from '../methods/images.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveFullPageOptions } from './fullPage.interfaces.js'
import { methodCompareOptions } from '../helpers/options.js'
import { extractCommonCheckVariables, buildBaseExecuteCompareOptions } from '../helpers/utils.js'
import type { InternalCheckFullPageMethodOptions } from './check.interfaces.js'

/**
 * Compare a fullpage screenshot
 */
export default async function checkFullPageScreen(
    {
        browserInstance,
        checkFullPageOptions,
        folders,
        instanceData,
        isNativeContext = false,
        tag,
        testContext,
    }: InternalCheckFullPageMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Extract common variables
    const commonCheckVariables = extractCommonCheckVariables({ folders, instanceData, wicOptions: checkFullPageOptions.wic })
    const {
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        enableLegacyScreenshotMethod,
        fullPageScrollTimeout,
        hideAfterFirstScroll = [],
        hideScrollBars,
        hideElements = [],
        removeElements = [],
        waitForFontsLoaded,
    } = checkFullPageOptions.method

    // 2. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkFullPageScreen is not supported in native context for native mobile apps!')
    }

    // 3. Take the actual full page screenshot and retrieve the needed data
    const saveFullPageOptions: SaveFullPageOptions = {
        wic: checkFullPageOptions.wic,
        method: {
            disableBlinkingCursor,
            disableCSSAnimation,
            enableLayoutTesting,
            enableLegacyScreenshotMethod,
            fullPageScrollTimeout,
            hideAfterFirstScroll,
            hideScrollBars,
            hideElements,
            removeElements,
            waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName, base64Image } = await saveFullPageScreen({
        browserInstance,
        folders,
        instanceData,
        isNativeContext,
        saveFullPageOptions,
        tag,
    })

    // 4. Determine the options
    const compareOptions = methodCompareOptions(checkFullPageOptions.method)
    const executeCompareOptions = buildBaseExecuteCompareOptions({
        commonCheckVariables,
        wicCompareOptions: checkFullPageOptions.wic.compareOptions,
        methodCompareOptions: compareOptions,
        devicePixelRatio,
        fileName,
    })

    // 5. Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: false,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
        actualBase64Image: base64Image,
    })
}
