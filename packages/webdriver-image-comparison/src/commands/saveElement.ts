import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { SaveElementOptions } from './element.interfaces'
import saveAppElement from './saveAppElement.js'
import saveWebElement from './saveWebElement.js'

/**
 * Saves an image of an element
 */
export default async function saveElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: HTMLElement,
    tag: string,
    saveElementOptions: SaveElementOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    console.log('saveElement isNativeContext:', isNativeContext)
    return isNativeContext
        ? saveAppElement()
        : saveWebElement(methods, instanceData, folders, element, tag, saveElementOptions)
}
