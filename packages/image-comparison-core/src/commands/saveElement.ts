import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import saveAppElement from './saveAppElement.js'
import saveWebElement from './saveWebElement.js'

/**
 * Saves an image of an element
 */
export default async function saveElement(
    {
        browserInstance,
        element,
        folders,
        instanceData,
        isNativeContext,
        saveElementOptions,
        tag,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppElement({ browserInstance, element, folders, instanceData, saveElementOptions, isNativeContext, tag })
        : saveWebElement({ browserInstance, element, folders, instanceData, saveElementOptions, tag })
}
