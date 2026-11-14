import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import checkFullPageScreen from './checkFullPageScreen.js'
import type { ImageCompareResult } from '../index.js'
import type { InternalCheckTabbablePageMethodOptions } from './check.interfaces.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'
import { withoutScrollContainer } from '../helpers/utils.js'

/**
 * Compare an image with all tab executions
 */
export default async function checkTabbablePage(
    {
        browserInstance,
        checkTabbableOptions,
        folders,
        instanceData,
        isNativeContext = false,
        tag,
        testContext,
    }: InternalCheckTabbablePageMethodOptions
): Promise<ImageCompareResult | number> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkTabbablePage is not supported in native context for native mobile apps!')
    }

    // Drawing the tabbables scrolls to the top, so read the position before it, and scroll back after the canvas is removed (#1231)
    const startScrollPosition = await readScrollPosition(browserInstance)
    try {
        return await takeTabbablePage({ browserInstance, checkTabbableOptions, folders, instanceData, isNativeContext, tag, testContext })
    } finally {
        await restoreScrollPosition(browserInstance, startScrollPosition, instanceData.isIOS)
    }
}

async function takeTabbablePage(
    {
        browserInstance,
        checkTabbableOptions,
        folders,
        instanceData,
        isNativeContext,
        tag,
        testContext,
    }: InternalCheckTabbablePageMethodOptions
): Promise<ImageCompareResult | number> {
    // 1b. Inject drawing the tabbables
    await browserInstance.execute(drawTabbableOnCanvas, checkTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageCompareData = await checkFullPageScreen({
        browserInstance,
        checkFullPageOptions: withoutScrollContainer(checkTabbableOptions, 'checkTabbablePage'),
        instanceData,
        folders,
        isNativeContext,
        testContext,
        tag,
    })

    // 3. Remove the canvas
    await browserInstance.execute(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageCompareData
}
