import type { ImageCompareResult } from '../methods/images.interfaces.js'
import checkAppElement from './checkAppElement.js'
import checkWebElement from './checkWebElement.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    {
        browserInstance,
        instanceData,
        folders,
        element,
        tag,
        checkElementOptions,
        isNativeContext,
        testContext,
    }: InternalCheckElementMethodOptions
): Promise<ImageCompareResult | number> {
    return isNativeContext
        ? checkAppElement({ browserInstance, element, folders, instanceData, checkElementOptions, isNativeContext, tag, testContext })
        : checkWebElement({ browserInstance, element, folders, instanceData, checkElementOptions, tag, testContext })
}
