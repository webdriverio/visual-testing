import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import type { SaveElementOptions, WicElement } from './element.interfaces.js'
import saveAppElement from './saveAppElement.js'
import saveWebElement from './saveWebElement.js'

/**
 * Saves an image of an element
 */
export default async function saveElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: WicElement,
    tag: string,
    saveElementOptions: SaveElementOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppElement(methods, instanceData, folders, element, tag, saveElementOptions, isNativeContext)
        : saveWebElement(methods, instanceData, folders, element, tag, saveElementOptions, isNativeContext)
}
