import type { ImageCompareResult } from '../methods/images.interfaces.js'
import checkAppScreen from './checkAppScreen.js'
import checkWebScreen from './checkWebScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkScreen(
    {
        instanceData,
        folders,
        tag,
        checkScreenOptions,
        isNativeContext,
        testContext,
    }: InternalCheckScreenMethodOptions
): Promise<ImageCompareResult | number> {
    return isNativeContext
        ? checkAppScreen({ instanceData, folders, tag, checkScreenOptions, isNativeContext, testContext })
        : checkWebScreen({ instanceData, folders, tag, checkScreenOptions, isNativeContext, testContext })
}
