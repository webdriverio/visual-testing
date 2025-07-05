import { executeImageCompare } from '../methods/images.js'
import saveWebElement from './saveWebElement.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveElementOptions } from './element.interfaces.js'
import { methodCompareOptions } from '../helpers/options.js'
import { extractCommonCheckVariables } from '../helpers/utils.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'

/**
 * Compare  an image of the element
 */
export default async function checkWebElement(
    {
        browserInstance,
        instanceData,
        folders,
        element,
        tag,
        checkElementOptions,
        testContext,
        isNativeContext = false,
    }: InternalCheckElementMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Extract common variables
    const {
        browserName,
        deviceName,
        deviceRectangles,
        isAndroid,
        isMobile,
        isAndroidNativeWebScreenshot,
        platformName,
        autoSaveBaseline,
        savePerInstance,
        actualFolder,
        baselineFolder,
        diffFolder
    } = extractCommonCheckVariables({ folders, instanceData, wicOptions: checkElementOptions.wic })
    const {
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        enableLegacyScreenshotMethod,
        hideScrollBars,
        resizeDimensions,
        hideElements = [],
        removeElements = [],
        waitForFontsLoaded = false,
    } = checkElementOptions.method

    // 2. Take the actual element screenshot and retrieve the needed data
    const saveElementOptions: SaveElementOptions = {
        wic: checkElementOptions.wic,
        method: {
            disableBlinkingCursor,
            disableCSSAnimation,
            enableLayoutTesting,
            enableLegacyScreenshotMethod,
            hideScrollBars,
            resizeDimensions,
            hideElements,
            removeElements,
            waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName } = await saveWebElement({
        browserInstance,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
    })

    // 3. Determine the options
    const compareOptions = methodCompareOptions(checkElementOptions.method)
    const executeCompareOptions = {
        compareOptions: {
            wic: {
                ...checkElementOptions.wic.compareOptions,
                // No need to block out anything on the app for element screenshots
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
            },
            method: compareOptions,
        },
        devicePixelRatio,
        deviceRectangles,
        fileName,
        folderOptions: {
            autoSaveBaseline,
            actualFolder,
            baselineFolder,
            diffFolder,
            browserName,
            deviceName,
            isMobile,
            savePerInstance,
        },
        isAndroid,
        isAndroidNativeWebScreenshot,
        platformName,
    }

    // 4. Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
