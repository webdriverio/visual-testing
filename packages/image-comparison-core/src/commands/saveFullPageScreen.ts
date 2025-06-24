import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { takeFullPageScreenshots } from '../methods/fullPageScreenshots.js'
import { makeFullPageBase64Image } from '../methods/images.js'
import type { ScreenshotOutput, AfterScreenshotOptions } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { FullPageScreenshotDataOptions } from '../methods/screenshots.interfaces.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { getMethodOrWicOption, canUseBidiScreenshot } from '../helpers/utils.js'

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
    const {
        addressBarShadowPadding,
        formatImageName,
        savePerInstance,
        toolBarShadowPadding,
    } = saveFullPageOptions.wic

    // 1c. Set the method options to the right values
    const userBasedFullPageScreenshot = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'userBasedFullPageScreenshot')
    const disableBlinkingCursor = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'disableBlinkingCursor')
    const disableCSSAnimation = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'disableCSSAnimation')
    const enableLayoutTesting = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'enableLayoutTesting')
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'enableLegacyScreenshotMethod')
    const fullPageScrollTimeout = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'fullPageScrollTimeout')
    const hideAfterFirstScroll: HTMLElement[] = saveFullPageOptions.method.hideAfterFirstScroll || []
    const hideElements: HTMLElement[] = saveFullPageOptions.method.hideElements || []
    const hideScrollBars = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'hideScrollBars')
    const removeElements: HTMLElement[] = saveFullPageOptions.method.removeElements || []
    const waitForFontsLoaded = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'waitForFontsLoaded')

    // 2.  Prepare the beforeScreenshot
    const beforeOptions: BeforeScreenshotOptions = {
        instanceData,
        addressBarShadowPadding,
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        hideElements,
        noScrollBars: hideScrollBars,
        removeElements,
        toolBarShadowPadding,
        waitForFontsLoaded,
    }
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions, true)
    const {
        browserName,
        browserVersion,
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                isEmulated: _isEmulated,
                isLandscape,
                outerHeight,
                outerWidth,
                screenHeight,
                screenWidth,
            },
        },
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
        isTestInBrowser,
        logName,
        name,
        platformName,
        platformVersion,
    } = enrichedInstanceData

    // 3.  Take fullpage screenshots with clean routing
    const fullPageScreenshotOptions: FullPageScreenshotDataOptions = {
        addressBarShadowPadding,
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
        toolBarShadowPadding: toolBarShadowPadding,
    }
    const shouldUseBidi = canUseBidiScreenshot(browserInstance) && (!userBasedFullPageScreenshot || !enableLegacyScreenshotMethod)
    const screenshotsData = await takeFullPageScreenshots(
        browserInstance,
        fullPageScreenshotOptions,
        shouldUseBidi
    )

    // 4.  Get the final image - either direct BiDi or stitched from multiple screenshots
    const fullPageBase64Image = (screenshotsData.fullPageHeight === -1 && screenshotsData.fullPageWidth === -1)
        ? screenshotsData.data[0].screenshot // BiDi screenshot - use directly
        : await makeFullPageBase64Image(screenshotsData, { // Regular screenshots - stitch them together
            devicePixelRatio: devicePixelRatio || NaN,
            isLandscape,
        })

    // 5.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image: fullPageBase64Image,
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        filePath: {
            browserName,
            deviceName,
            isMobile,
            savePerInstance,
        },
        fileName: {
            browserName,
            browserVersion,
            deviceName,
            devicePixelRatio: devicePixelRatio || NaN,
            formatImageName,
            isMobile,
            isTestInBrowser,
            logName,
            name,
            outerHeight: outerHeight || NaN,
            outerWidth: outerWidth || NaN,
            platformName,
            platformVersion,
            screenHeight: screenHeight || NaN,
            screenWidth: screenWidth || NaN,
            tag,
        },
        hideElements,
        hideScrollBars,
        isLandscape,
        isNativeContext: false,
        platformName,
        removeElements,
    }

    // 6.  Return the data
    return afterScreenshot(browserInstance, afterOptions!)
}

