import type { ImageCompareResult } from '../methods/images.interfaces.js'
import checkAppScreen from './checkAppScreen.js'
import checkWebScreen from './checkWebScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkScreen(
    {
        browserInstance,
        checkScreenOptions,
        folders,
        instanceData,
        isNativeContext,
        tag,
        testContext,
    }: InternalCheckScreenMethodOptions
): Promise<ImageCompareResult | number> {
    return isNativeContext
        ? checkAppScreen({ browserInstance, checkScreenOptions, folders, instanceData, isNativeContext, tag, testContext })
        : checkWebScreen({ browserInstance, checkScreenOptions, folders, instanceData, isNativeContext, tag, testContext })
}
