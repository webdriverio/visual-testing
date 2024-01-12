import type { Methods } from '../methods/methods.interfaces'
import type { Folders } from '../base.interfaces'
import type { SaveScreenOptions } from './screen.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces'
import saveAppScreen from './saveAppScreen.js'
import saveWebScreen from './saveWebScreen.js'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    saveScreenOptions: SaveScreenOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    console.log('saveScreen isNativeContext:', isNativeContext)
    return isNativeContext
        ? saveAppScreen()
        : saveWebScreen(methods, instanceData, folders, tag, saveScreenOptions)
}
