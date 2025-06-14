import { executeImageCompare } from '../methods/images.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveFullPageOptions } from './fullPage.interfaces.js'
import { methodCompareOptions } from '../helpers/options.js'
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
    // Set some variables
    const { actualFolder, baselineFolder, diffFolder } = folders
    const {
        browserName,
        deviceName,
        deviceRectangles,
        isAndroid,
        isIOS,
        isMobile,
        nativeWebScreenshot: isAndroidNativeWebScreenshot,
        platformName,
    } = instanceData
    const { autoSaveBaseline, isHybridApp, savePerInstance } = checkFullPageOptions.wic
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

    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkFullPageScreen is not supported in native context for native mobile apps!')
    }

    // 1b. Take the actual full page screenshot and retrieve the needed data
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
    const { devicePixelRatio, fileName } = await saveFullPageScreen({
        browserInstance,
        folders,
        instanceData,
        isNativeContext,
        saveFullPageOptions,
        tag,
    })

    // 2a. Determine the options
    const compareOptions = methodCompareOptions(checkFullPageOptions.method)
    const executeCompareOptions = {
        compareOptions: {
            wic: checkFullPageOptions.wic.compareOptions,
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
        isIOS,
        isHybridApp,
        platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: false,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
