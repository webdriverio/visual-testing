import { methodCompareOptions } from '../helpers/options.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import { extractCommonCheckVariables, buildBaseExecuteCompareOptions } from '../helpers/utils.js'
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
    // 1. Extract common variables
    const commonCheckVariables = extractCommonCheckVariables({ folders, instanceData, wicOptions: checkElementOptions.wic })

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

    // 3. Determine the options
    const compareOptions = methodCompareOptions(checkElementOptions.method)
    const executeCompareOptions = buildBaseExecuteCompareOptions({
        commonCheckVariables,
        wicCompareOptions: checkElementOptions.wic.compareOptions,
        methodCompareOptions: compareOptions,
        devicePixelRatio,
        fileName,
        isElementScreenshot: true, // This will automatically set blockOut* options to false
        additionalProperties: {
            isHybridApp: checkElementOptions.wic.isHybridApp,
            platformName: instanceData.platformName,
        }
    })

    // 4. Now execute the compare and return the data
    return executeImageCompare({
        options: executeCompareOptions,
        testContext,
        isViewPortScreenshot: false,
        isNativeContext,
    })
}
