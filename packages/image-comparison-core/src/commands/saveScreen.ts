import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import saveWebScreen from './saveWebScreen.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'

/**
 * Saves an image of the viewport of the desktop browser or the screen of a mobile device
 */
export default async function saveScreen(
    {
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppScreen({ instanceData, folders, tag, saveScreenOptions, isNativeContext })
        : saveWebScreen({ instanceData, folders, tag, saveScreenOptions, isNativeContext })
}
