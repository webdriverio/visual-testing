import { screenMethodCompareOptions } from '../helpers/options.js'
import type {  ImageCompareOptions, ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import { determineDeviceBlockOuts, determineIgnoreRegions } from '../methods/rectangles.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import type { ElementIgnore } from './element.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkAppScreen(
    {
        browserInstance,
        checkScreenOptions,
        folders,
        instanceData,
        isNativeContext = true,
        tag,
        testContext,
    }: InternalCheckScreenMethodOptions
): Promise<ImageCompareResult | number> {
    // 1. Set some vars
    const saveAppScreenOptions = {
        wic: checkScreenOptions.wic,
        method:{
            ...{ hideElements: [] },
            ...{ removeElements:  [] },
        }
    }
    const screenCompareOptions = {
        ...checkScreenOptions.wic.compareOptions,
        ...checkScreenOptions.method,
        // Use the hide and remove elements from the checkScreenOptions and add them to the ignore array
        ignore: [
            ...checkScreenOptions.method.ignore || [],
            ...checkScreenOptions.method.hideElements as unknown as ElementIgnore[] || [],
            ...checkScreenOptions.method.removeElements as unknown as ElementIgnore[] || [],
        ]

    }
    const { isAndroid, isMobile, deviceRectangles, browserName, deviceName, nativeWebScreenshot: isAndroidNativeWebScreenshot } = instanceData
    const { actualFolder, baselineFolder, diffFolder } = folders
    const { autoSaveBaseline, savePerInstance, compareOptions } = checkScreenOptions.wic

    // 2. Take the actual screenshot and retrieve the needed data
    const { devicePixelRatio, fileName } = await saveAppScreen({
        browserInstance,
        folders,
        instanceData,
        isNativeContext,
        saveScreenOptions: saveAppScreenOptions,
        tag,
    })

    // 3. Determine the ignore regions
    const ignoreRegions = await determineIgnoreRegions(browserInstance, screenCompareOptions.ignore || [])
    const deviceIgnoreRegions = await determineDeviceBlockOuts({
        isAndroid,
        screenCompareOptions,
        instanceData,
    })

    // 4a. Determine the compare options
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)

    const executeCompareOptions: ImageCompareOptions = {
        compareOptions: {
            wic: compareOptions,
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
        ignoreRegions: [...ignoreRegions, ...deviceIgnoreRegions],
        isAndroid,
        isAndroidNativeWebScreenshot,
    }

    // 4b Now execute the compare and return the data
    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
