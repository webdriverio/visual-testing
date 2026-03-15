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
        ignoreRegionPadding,
        hideElements = [],
        removeElements = [],
        waitForFontsLoaded,
    } = checkScreenOptions.method

    // 2. Take the actual screenshot and resolve ignore regions in one go.
    //    Ignore regions are resolved while the DOM is still in screenshot state
    //    (scrollbar hidden, elements hidden/removed) so positions match the image.
    const saveScreenOptions: SaveScreenOptions = {
        wic: checkScreenOptions.wic,
        method: {
            disableBlinkingCursor,
            disableCSSAnimation,
            enableLayoutTesting,
            enableLegacyScreenshotMethod,
            hideScrollBars,
            ignoreRegionPadding,
            hideElements,
            removeElements,
            waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName, base64Image, ignoreRegions } = await saveWebScreen({
        browserInstance,
        instanceData,
        folders,
        tag,
        ignore: checkScreenOptions.method.ignore,
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
        additionalProperties: {
            ignoreRegions: ignoreRegions || [],
        },
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
