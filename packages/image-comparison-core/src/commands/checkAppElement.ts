import { checkIsAndroid } from '../helpers/utils.js'
import { methodCompareOptions } from '../helpers/options.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'
import type { WicElement } from './element.interfaces.js'
import saveAppElement from './saveAppElement.js'

/**
 * Compare  an image of the element
 */
export default async function checkAppElement(
    {
        checkElementOptions,
        browserInstance,
        element,
        folders,
        instanceData,
        isNativeContext = true,
        tag,
        testContext,
    }: InternalCheckElementMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Set some vars
    const { isMobile } = instanceData

    // 2. Save the element and return the data
    const { devicePixelRatio, fileName } = await saveAppElement({
        browserInstance,
        element: element as WicElement,
        folders,
        instanceData,
        isNativeContext,
        saveElementOptions: checkElementOptions,
        tag,
    })
    // @TODO: This is something for the future, to allow ignore regions on the element itself.
    // This will become a feature request

    // 3a. Determine the options
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
            isMobile,
            savePerInstance: checkElementOptions.wic.savePerInstance,
        },
        isAndroid: checkIsAndroid(instanceData.platformName),
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: checkElementOptions.wic.isHybridApp,
        platformName: instanceData.platformName,
    }

    // 3b Now execute the compare and return the data
    return executeImageCompare({
        options: executeCompareOptions,
        testContext,
        isViewPortScreenshot: false,
        isNativeContext,
    })
}
