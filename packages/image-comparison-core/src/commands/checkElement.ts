import type { ImageCompareResult } from '../methods/images.interfaces.js'
import checkAppElement from './checkAppElement.js'
import checkWebElement from './checkWebElement.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    {
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
        ? checkAppElement({ instanceData, folders, element, tag, checkElementOptions, isNativeContext, testContext })
        : checkWebElement({ instanceData, folders, element, tag, checkElementOptions, testContext })
}
