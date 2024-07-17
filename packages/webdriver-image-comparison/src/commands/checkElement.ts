import type { ImageCompareResult } from '../methods/images.interfaces.js'
import checkAppElement from './checkAppElement.js'
import checkWebElement from './checkWebElement.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    {
        methods,
        instanceData,
        folders,
        element,
        tag,
        checkElementOptions,
        isNativeContext
    }: InternalCheckElementMethodOptions
): Promise<ImageCompareResult | number> {
    return isNativeContext
        ? checkAppElement({ methods, instanceData, folders, element, tag, checkElementOptions, isNativeContext })
        : checkWebElement({ methods, instanceData, folders, element, tag, checkElementOptions })
}
