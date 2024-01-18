import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { CheckElementOptions, WicElement } from './element.interfaces'
import checkAppElement from './checkAppElement.js'
import checkWebElement from './checkWebElement.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: WicElement | HTMLElement,
    tag: string,
    checkElementOptions: CheckElementOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    return isNativeContext
        ? checkAppElement(methods, instanceData, folders, element as WicElement, tag, checkElementOptions, isNativeContext)
        : checkWebElement(methods, instanceData, folders, element as HTMLElement, tag, checkElementOptions, isNativeContext)
}
