import saveWebScreen from './saveWebScreen.js'
import { executeImageCompare } from '../methods/images.js'
import type { ImageCompareOptions, ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveScreenOptions } from './screen.interfaces.js'
import { screenMethodCompareOptions } from '../helpers/options.js'
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
    // Set some variables
    const { browserName, deviceName, deviceRectangles, isAndroid, isMobile, nativeWebScreenshot: isAndroidNativeWebScreenshot } = instanceData
    const { autoSaveBaseline, savePerInstance } = checkScreenOptions.wic
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
    const { actualFolder, baselineFolder, diffFolder } = folders
    // 1.  Take the actual screenshot and retrieve the needed data
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
    const { devicePixelRatio, fileName } = await saveWebScreen({
        browserInstance,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext,
    })

    // 2a. Determine the compare options
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)
    const executeCompareOptions: ImageCompareOptions = {
        compareOptions: {
            wic: checkScreenOptions.wic.compareOptions,
            method: methodCompareOptions,
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
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
