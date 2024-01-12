import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { CheckElementOptions } from './element.interfaces'
import checkAppElement from './checkAppElement.js'
import checkWebElement from './checkWebElement.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: HTMLElement,
    tag: string,
    checkElementOptions: CheckElementOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    console.log('checkElement isNativeContext:', isNativeContext)
    return isNativeContext ? checkAppElement() : checkWebElement(methods, instanceData, folders, element, tag, checkElementOptions)
}
