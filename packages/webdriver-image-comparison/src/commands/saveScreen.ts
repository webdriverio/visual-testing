import type { Methods } from '../methods/methods.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import type { SaveScreenOptions } from './screen.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import saveWebScreen from './saveWebScreen.js'

/**
 * Saves an image of the viewport of the desktop browser or the screen of a mobile device
 */
export default async function saveScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    saveScreenOptions: SaveScreenOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    return isNativeContext
        ? saveAppScreen(methods, instanceData, folders, tag, saveScreenOptions, isNativeContext)
        : saveWebScreen(methods, instanceData, folders, tag, saveScreenOptions, isNativeContext)
}
