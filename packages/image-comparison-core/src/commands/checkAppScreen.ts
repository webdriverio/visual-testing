import { screenMethodCompareOptions } from '../helpers/options.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import { determineDeviceBlockOuts, determineIgnoreRegions } from '../methods/rectangles.js'
import { extractCommonCheckVariables, buildBaseExecuteCompareOptions } from '../helpers/utils.js'
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
    // 1. Set some variables
    const commonCheckVariables = extractCommonCheckVariables({ folders, instanceData, wicOptions: checkScreenOptions.wic })
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

    // 2. Take the actual screenshot and retrieve the needed data
    const { devicePixelRatio, fileName } = await saveAppScreen({
        browserInstance,
        folders,
        instanceData,
        isNativeContext,
        saveScreenOptions: saveAppScreenOptions,
        tag,
    })

    // 3. Determine the ignore regions and compare options
    const ignoreRegions = await determineIgnoreRegions(browserInstance, screenCompareOptions.ignore || [])
    const deviceIgnoreRegions = await determineDeviceBlockOuts({
        isAndroid: commonCheckVariables.isAndroid,
        screenCompareOptions,
        instanceData,
    })
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)
    const baseExecuteCompareOptions = buildBaseExecuteCompareOptions({
        commonCheckVariables,
        wicCompareOptions: checkScreenOptions.wic.compareOptions,
        methodCompareOptions,
        devicePixelRatio,
        fileName,
        additionalProperties: {
            ignoreRegions: [...ignoreRegions, ...deviceIgnoreRegions],
        }
    })

    // 4. Now execute the compare and return the data
    const executeCompareOptions = {
        compareOptions: baseExecuteCompareOptions.compareOptions,
        devicePixelRatio: baseExecuteCompareOptions.devicePixelRatio,
        deviceRectangles: baseExecuteCompareOptions.deviceRectangles,
        fileName: baseExecuteCompareOptions.fileName,
        folderOptions: baseExecuteCompareOptions.folderOptions,
        ignoreRegions: baseExecuteCompareOptions.ignoreRegions,
        isAndroid: baseExecuteCompareOptions.isAndroid,
        isAndroidNativeWebScreenshot: baseExecuteCompareOptions.isAndroidNativeWebScreenshot,
    }

    return executeImageCompare({
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
