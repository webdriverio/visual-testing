import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import { buildAfterScreenshotOptions } from '../helpers/options.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import { takeBase64ElementScreenshot } from '../methods/images.js'
import type { WicElement } from './element.interfaces.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'

/**
 * Saves an element image for a native app
 */
export default async function saveAppElement(
    {
        browserInstance,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
        isNativeContext = false,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const resizeDimensions: ResizeDimensions = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const { devicePixelRatio, isIOS } = instanceData

    // 2. Take the screenshot
    const base64Image: string = await takeBase64ElementScreenshot({
        browserInstance,
        element: element as WicElement,
        devicePixelRatio,
        isIOS,
        resizeDimensions,
    })

    // 3. Return the data
    const afterOptions = buildAfterScreenshotOptions({
        base64Image,
        folders,
        tag,
        isNativeContext,
        instanceData: instanceData,
        wicOptions: saveElementOptions.wic
    })

    return afterScreenshot(browserInstance, afterOptions)
}
