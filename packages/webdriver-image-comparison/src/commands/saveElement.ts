import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import saveAppElement from './saveAppElement.js'
import saveWebElement from './saveWebElement.js'

/**
 * Saves an image of an element
 */
export default async function saveElement(
    {
        methods,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
        isNativeContext,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppElement({ methods, instanceData, folders, element, tag, saveElementOptions, isNativeContext })
        : saveWebElement({ methods, instanceData, folders, element, tag, saveElementOptions })
}
