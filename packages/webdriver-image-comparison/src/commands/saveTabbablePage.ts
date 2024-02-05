import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { SaveTabbableOptions } from './tabbable.interfaces'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'

/**
 * Saves an image of all tab executions
 */
export default async function saveTabbablePage(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    saveTabbableOptions: SaveTabbableOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method saveTabbablePage is not supported in native context for native mobile apps!')
    }

    // 1b. Inject drawing the tabbables
    await methods.executor(drawTabbableOnCanvas, saveTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageData = await saveFullPageScreen(methods, instanceData, folders, tag, saveTabbableOptions, isNativeContext)

    // 3. Remove the canvas
    await methods.executor(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageData
}
