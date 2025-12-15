import { takeWebScreenshot } from '../methods/takeWebScreenshots.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import type { BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import type { WebScreenshotDataOptions } from '../methods/screenshots.interfaces.js'
import { canUseBidiScreenshot, getMethodOrWicOption } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveWebScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext = false,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const { addIOSBezelCorners, formatImageName, savePerInstance } = saveScreenOptions.wic
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'enableLegacyScreenshotMethod')

    // 2.  Prepare the screenshot
    const beforeOptions = createBeforeScreenshotOptions(instanceData, saveScreenOptions.method, saveScreenOptions.wic)
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions)
    const {
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                innerWidth,
                isEmulated,
                isLandscape,
            },
        },
        initialDevicePixelRatio,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
    } = enrichedInstanceData

    // 3. Take the screenshot
    const shouldUseBidi = canUseBidiScreenshot(browserInstance) && !isMobile && !enableLegacyScreenshotMethod
    const webScreenshotOptions: WebScreenshotDataOptions = {
        addIOSBezelCorners,
        deviceName,
        devicePixelRatio: devicePixelRatio || 1,
        enableLegacyScreenshotMethod,
        innerHeight,
        innerWidth,
        initialDevicePixelRatio,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isEmulated,
        isIOS,
        isLandscape,
        isMobile,
    }
    const { base64Image } = await takeWebScreenshot(browserInstance, webScreenshotOptions, shouldUseBidi)

    // 4. Return the data
    const afterOptions = buildAfterScreenshotOptions({
        base64Image,
        folders,
        tag,
        isNativeContext,
        instanceData,
        enrichedInstanceData,
        beforeOptions,
        wicOptions: { formatImageName, savePerInstance, alwaysSaveActualImage: saveScreenOptions.wic.alwaysSaveActualImage }
    })

    return afterScreenshot(browserInstance, afterOptions)
}
