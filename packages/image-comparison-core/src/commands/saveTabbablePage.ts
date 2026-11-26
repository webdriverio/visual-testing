import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import type { InternalSaveTabbablePageMethodOptions } from './save.interfaces.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'

/**
 * Saves an image of all tab executions
 */
export default async function saveTabbablePage(
    {
        browserInstance,
        instanceData,
        isNativeContext = false,
        folders,
        tag,
        saveTabbableOptions,
    }: InternalSaveTabbablePageMethodOptions
): Promise<ScreenshotOutput> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method saveTabbablePage is not supported in native context for native mobile apps!')
    }

    // Drawing the tabbables scrolls to the top, so read the position before it, and scroll back after the canvas is removed (#1231)
    const startScrollPosition = await readScrollPosition(browserInstance)
    try {
        return await takeTabbablePage({ browserInstance, folders, instanceData, isNativeContext, saveTabbableOptions, tag })
    } finally {
        await restoreScrollPosition(browserInstance, startScrollPosition, instanceData.isIOS)
    }
}

async function takeTabbablePage(
    {
        browserInstance,
        instanceData,
        isNativeContext,
        folders,
        tag,
        saveTabbableOptions,
    }: InternalSaveTabbablePageMethodOptions
): Promise<ScreenshotOutput> {
    // 1b. Inject drawing the tabbables
    await browserInstance.execute(drawTabbableOnCanvas, saveTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageData = await saveFullPageScreen({ browserInstance, folders, instanceData, isNativeContext, saveFullPageOptions: saveTabbableOptions, tag })

    // 3. Remove the canvas
    await browserInstance.execute(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageData
}
