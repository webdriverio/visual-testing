import { executeImageCompare } from '../methods/images.js'
import { checkIsAndroid, checkIsMobile } from '../helpers/utils.js'
import saveWebElement from './saveWebElement.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { SaveElementOptions } from './element.interfaces.js'
import { methodCompareOptions } from '../helpers/options.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'

/**
 * Compare  an image of the element
 */
export default async function checkWebElement(
    {
        methods,
        instanceData,
        folders,
        element,
        tag,
        checkElementOptions,
        testContext,
        isNativeContext = false,
    }: InternalCheckElementMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Take the actual element screenshot and retrieve the needed data
    const saveElementOptions: SaveElementOptions = {
        wic: checkElementOptions.wic,
        method: {
            disableBlinkingCursor: checkElementOptions.method.disableBlinkingCursor,
            disableCSSAnimation: checkElementOptions.method.disableCSSAnimation,
            enableLayoutTesting: checkElementOptions.method.enableLayoutTesting,
            hideScrollBars: checkElementOptions.method.hideScrollBars,
            resizeDimensions: checkElementOptions.method.resizeDimensions,
            hideElements: checkElementOptions.method.hideElements || [],
            removeElements: checkElementOptions.method.removeElements || [],
            waitForFontsLoaded: checkElementOptions.method.waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName } = await saveWebElement({
        methods,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
    })

    // 2a. Determine the options
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
        deviceRectangles: instanceData.deviceRectangles,
        fileName,
        folderOptions: {
            autoSaveBaseline: checkElementOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile: checkIsMobile(instanceData.platformName),
            savePerInstance: checkElementOptions.wic.savePerInstance,
        },
        isAndroid: checkIsAndroid(instanceData.platformName),
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        platformName: instanceData.platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
