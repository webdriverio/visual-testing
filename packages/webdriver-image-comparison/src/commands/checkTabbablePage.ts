import type { Methods } from '../methods/methods.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import type { CheckTabbableOptions } from './tabbable.interfaces.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import checkFullPageScreen from './checkFullPageScreen.js'
import type { ImageCompareResult } from 'src/index.js'

/**
 * Compare an image with all tab executions
 */
export default async function checkTabbablePage(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkTabbableOptions: CheckTabbableOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkTabbablePage is not supported in native context for native mobile apps!')
    }

    // 1b. Inject drawing the tabbables
    await methods.executor(drawTabbableOnCanvas, checkTabbableOptions.wic.tabbableOptions)

    // 2. Create the screenshot
    const fullPageCompareData = await checkFullPageScreen(methods, instanceData, folders, tag, checkTabbableOptions, isNativeContext)

    // 3. Remove the canvas
    await methods.executor(removeElementFromDom, 'wic-tabbable-canvas')

    // 4. Return the data
    return fullPageCompareData
}
