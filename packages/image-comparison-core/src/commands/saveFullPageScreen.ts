import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { takeFullPageScreenshots } from '../methods/fullPageScreenshots.js'
import { makeFullPageBase64Image } from '../methods/images.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { FullPageScreenshotDataOptions } from '../methods/screenshots.interfaces.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { getMethodOrWicOption, canUseBidiScreenshot } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'

/**
 * Saves an image of the full page
 */
export default async function saveFullPageScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        saveFullPageOptions,
        isNativeContext,
    }: InternalSaveFullPageMethodOptions
): Promise<ScreenshotOutput> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method saveFullPageScreen is not supported in native context for native mobile apps!')
    }

    // 1b. Set some variables
    const { formatImageName, savePerInstance } = saveFullPageOptions.wic

    // 1c. Set the method options to the right values
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'enableLegacyScreenshotMethod')
    const fullPageScrollTimeout = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'fullPageScrollTimeout')
    const hideAfterFirstScroll: HTMLElement[] = saveFullPageOptions.method.hideAfterFirstScroll || []
    const userBasedFullPageScreenshot = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'userBasedFullPageScreenshot')

    // 2.  Prepare the beforeScreenshot
    const beforeOptions = createBeforeScreenshotOptions(instanceData, saveFullPageOptions.method, saveFullPageOptions.wic)
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions, true)
    const {
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                isEmulated: _isEmulated,
                isLandscape,
                screenHeight,
                screenWidth,
            },
        },
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
    } = enrichedInstanceData

    // 3.  Take fullpage screenshots with clean routing
    const fullPageScreenshotOptions: FullPageScreenshotDataOptions = {
        addressBarShadowPadding: beforeOptions.addressBarShadowPadding,
        devicePixelRatio: devicePixelRatio || NaN,
        deviceRectangles: instanceData.deviceRectangles,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight: innerHeight || NaN,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isLandscape,
        screenHeight: screenHeight || NaN,
        screenWidth: screenWidth || NaN,
        toolBarShadowPadding: beforeOptions.toolBarShadowPadding,
    }
    const shouldUseBidi = canUseBidiScreenshot(browserInstance) && (!userBasedFullPageScreenshot || !enableLegacyScreenshotMethod)
    const screenshotsData = await takeFullPageScreenshots(browserInstance, fullPageScreenshotOptions, shouldUseBidi)

    // 4.  Get the final image - either direct BiDi or stitched from multiple screenshots
    const fullPageBase64Image = (screenshotsData.fullPageHeight === -1 && screenshotsData.fullPageWidth === -1)
        ? screenshotsData.data[0].screenshot // BiDi screenshot - use directly
        : await makeFullPageBase64Image(screenshotsData, { devicePixelRatio: devicePixelRatio || NaN, isLandscape })

    // 5.  The after the screenshot methods
    const afterOptions = buildAfterScreenshotOptions({
        base64Image: fullPageBase64Image,
        folders,
        tag,
        isNativeContext: false,
        instanceData,
        enrichedInstanceData,
        beforeOptions,
        wicOptions: { formatImageName, savePerInstance }
    })

    // 6.  Return the data
    return afterScreenshot(browserInstance, afterOptions!)
}

