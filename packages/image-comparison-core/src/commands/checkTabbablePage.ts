import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import checkFullPageScreen from './checkFullPageScreen.js'
import type { ImageCompareResult } from 'src/index.js'
import type { InternalCheckTabbablePageMethodOptions } from './check.interfaces.js'
import { browser } from '@wdio/globals'

/**
 * Compare an image with all tab executions
 */
export default async function checkTabbablePage(
    {
        instanceData,
        folders,
        tag,
        checkTabbableOptions,
        isNativeContext = false,
        testContext,
    }: InternalCheckTabbablePageMethodOptions
): Promise<ImageCompareResult | number> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkTabbablePage is not supported in native context for native mobile apps!')
    }

    // 1b. Inject drawing the tabbables
    await browser.execute(drawTabbableOnCanvas, checkTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageCompareData = await checkFullPageScreen({
        instanceData,
        folders,
        tag,
        checkFullPageOptions:
        checkTabbableOptions,
        isNativeContext,
        testContext,
    })

    // 3. Remove the canvas
    await browser.execute(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageCompareData
}
