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
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkFullPageScreen is not supported in native context for native mobile apps!')
    }

    // 1b. Take the actual full page screenshot and retrieve the needed data
    const saveFullPageOptions: SaveFullPageOptions = {
        wic: checkFullPageOptions.wic,
        method: {
            disableBlinkingCursor: checkFullPageOptions.method.disableBlinkingCursor,
            disableCSSAnimation: checkFullPageOptions.method.disableCSSAnimation,
            enableLayoutTesting: checkFullPageOptions.method.enableLayoutTesting,
            enableLegacyScreenshotMethod: checkFullPageOptions.method.enableLegacyScreenshotMethod,
            fullPageScrollTimeout: checkFullPageOptions.method.fullPageScrollTimeout,
            hideAfterFirstScroll: checkFullPageOptions.method.hideAfterFirstScroll || [],
            hideScrollBars: checkFullPageOptions.method.hideScrollBars,
            hideElements: checkFullPageOptions.method.hideElements || [],
            removeElements: checkFullPageOptions.method.removeElements || [],
            waitForFontsLoaded: checkFullPageOptions.method.waitForFontsLoaded,
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
        deviceRectangles: instanceData.deviceRectangles,
        fileName,
        folderOptions: {
            autoSaveBaseline: checkFullPageOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile: browserInstance.isMobile,
            savePerInstance: checkFullPageOptions.wic.savePerInstance,
        },
        isAndroid: browserInstance.isAndroid,
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: checkFullPageOptions.wic.isHybridApp,
        platformName: instanceData.platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: false,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
