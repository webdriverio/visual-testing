import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import type { CheckTabbableOptions } from './tabbable.interfaces'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import checkFullPageScreen from './checkFullPageScreen.js'
import type { ImageCompareResult } from '..'

/**
 * Compare an image with all tab executions
 */
export default async function checkTabbablePage(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkTabbableOptions: CheckTabbableOptions,
): Promise<ImageCompareResult | number> {
    // 1. Inject drawing the tabbables
    await methods.executor(drawTabbableOnCanvas, checkTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageCompareData = await checkFullPageScreen(methods, instanceData, folders, tag, checkTabbableOptions)

    // 3. Remove the canvas
    await methods.executor(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageCompareData
}
