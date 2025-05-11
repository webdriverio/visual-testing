import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { getBase64FullPageScreenshotsData, takeBase64BiDiScreenshot } from '../methods/screenshots.js'
import { makeFullPageBase64Image } from '../methods/images.js'
import type { ScreenshotOutput, AfterScreenshotOptions } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { FullPageScreenshotDataOptions, FullPageScreenshotsData } from '../methods/screenshots.interfaces.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { canUseBidiScreenshot, getMethodOrWicOption } from '../helpers/utils.js'

/**
 * Saves an image of the full page
 */
export default async function saveFullPageScreen(
    {
        methods,
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
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(methods.executor, beforeOptions, true)
    const devicePixelRatio = enrichedInstanceData.dimensions.window.devicePixelRatio
    const isLandscape = enrichedInstanceData.dimensions.window.isLandscape
    let fullPageBase64Image: string

    if (canUseBidiScreenshot(methods) && (!userBasedFullPageScreenshot || !enableLegacyScreenshotMethod)) {
        // 3a.  Fullpage screenshots are taken in one go with the Bidi protocol
        fullPageBase64Image = await takeBase64BiDiScreenshot({
            bidiScreenshot: methods.bidiScreenshot!,
            getWindowHandle: methods.getWindowHandle!,
            origin: 'document',
        })
    } else {
        // 3b.  Fullpage screenshots are taken per scrolled viewport
        const fullPageScreenshotOptions: FullPageScreenshotDataOptions = {
            addressBarShadowPadding: enrichedInstanceData.addressBarShadowPadding,
            devicePixelRatio: devicePixelRatio || NaN,
            deviceRectangles: instanceData.deviceRectangles,
            fullPageScrollTimeout,
            hideAfterFirstScroll,
            innerHeight: enrichedInstanceData.dimensions.window.innerHeight || NaN,
            isAndroid: enrichedInstanceData.isAndroid,
            isAndroidChromeDriverScreenshot: enrichedInstanceData.isAndroidChromeDriverScreenshot,
            isAndroidNativeWebScreenshot: enrichedInstanceData.isAndroidNativeWebScreenshot,
            isIOS: enrichedInstanceData.isIOS,
            isLandscape,
            screenHeight: enrichedInstanceData.dimensions.window.screenHeight || NaN,
            screenWidth: enrichedInstanceData.dimensions.window.screenWidth || NaN,
            toolBarShadowPadding: enrichedInstanceData.toolBarShadowPadding,
        }
        const screenshotsData: FullPageScreenshotsData = await getBase64FullPageScreenshotsData(
            methods.screenShot,
            methods.executor,
            fullPageScreenshotOptions,
        )

        // 4.  Make a fullpage base64 image by scrolling and stitching the images together
        fullPageBase64Image = await makeFullPageBase64Image(screenshotsData, {
            devicePixelRatio: devicePixelRatio || NaN,
            isLandscape,
        })
    }

    // 5.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image: fullPageBase64Image,
        disableBlinkingCursor,
        disableCSSAnimation,
        enableLayoutTesting,
        filePath: {
            browserName: enrichedInstanceData.browserName,
            deviceName: enrichedInstanceData.deviceName,
            isMobile: enrichedInstanceData.isMobile,
            savePerInstance,
        },
        fileName: {
            browserName: enrichedInstanceData.browserName,
            browserVersion: enrichedInstanceData.browserVersion,
            deviceName: enrichedInstanceData.deviceName,
            devicePixelRatio: enrichedInstanceData.dimensions.window.devicePixelRatio || NaN,
            formatImageName,
            isMobile: enrichedInstanceData.isMobile,
            isTestInBrowser: enrichedInstanceData.isTestInBrowser,
            logName: enrichedInstanceData.logName,
            name: enrichedInstanceData.name,
            outerHeight: enrichedInstanceData.dimensions.window.outerHeight || NaN,
            outerWidth: enrichedInstanceData.dimensions.window.outerWidth || NaN,
            platformName: enrichedInstanceData.platformName,
            platformVersion: enrichedInstanceData.platformVersion,
            screenHeight: enrichedInstanceData.dimensions.window.screenHeight || NaN,
            screenWidth: enrichedInstanceData.dimensions.window.screenWidth || NaN,
            tag,
        },
        hideElements,
        hideScrollBars,
        isLandscape,
        isNativeContext: false,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 6.  Return the data
    return afterScreenshot(methods.executor, afterOptions!)
}

