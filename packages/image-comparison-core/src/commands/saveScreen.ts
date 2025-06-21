import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import saveWebScreen from './saveWebScreen.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'

/**
 * Saves an image of the viewport of the desktop browser or the screen of a mobile device
 */
export default async function saveScreen(
    {
        browserInstance,
        folders,
        instanceData,
        isNativeContext,
        tag,
        saveScreenOptions,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppScreen({ browserInstance, folders, instanceData, isNativeContext, saveScreenOptions, tag })
        : saveWebScreen({ browserInstance, folders, instanceData, isNativeContext, saveScreenOptions, tag })
}
