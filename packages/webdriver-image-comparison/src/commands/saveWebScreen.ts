import { takeBase64Screenshot } from '../methods/screenshots.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { determineScreenRectangles } from '../methods/rectangles.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { RectanglesOutput, ScreenRectanglesOptions } from '../methods/rectangles.interfaces.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveWebScreen(
    {
        methods,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext = false,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addressBarShadowPadding, addIOSBezelCorners, formatImageName, savePerInstance, toolBarShadowPadding } =
        saveScreenOptions.wic

    // 1b. Set the method options to the right values
    const disableCSSAnimation: boolean = saveScreenOptions.method.disableCSSAnimation !== undefined
        ? Boolean(saveScreenOptions.method.disableCSSAnimation)
        : saveScreenOptions.wic.disableCSSAnimation
    const enableLayoutTesting: boolean = saveScreenOptions.method.enableLayoutTesting !== undefined
        ? Boolean(saveScreenOptions.method.enableLayoutTesting)
        : saveScreenOptions.wic.enableLayoutTesting
    const hideScrollBars: boolean = saveScreenOptions.method.hideScrollBars !== undefined
        ? Boolean(saveScreenOptions.method.hideScrollBars)
        : saveScreenOptions.wic.hideScrollBars
    const hideElements: HTMLElement[] = saveScreenOptions.method.hideElements || []
    const removeElements: HTMLElement[] = saveScreenOptions.method.removeElements || []
    const waitForFontsLoaded: boolean = saveScreenOptions.method.waitForFontsLoaded !== undefined
        ? Boolean(saveScreenOptions.method.waitForFontsLoaded)
        : saveScreenOptions.wic.waitForFontsLoaded

    // 2.  Prepare the beforeScreenshot
    const beforeOptions: BeforeScreenshotOptions = {
        instanceData,
        addressBarShadowPadding,
        disableCSSAnimation,
        enableLayoutTesting,
        hideElements,
        noScrollBars: hideScrollBars,
        removeElements,
        toolBarShadowPadding,
        waitForFontsLoaded,
    }
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(methods.executor, beforeOptions)
    const {
        browserName,
        browserVersion,
        deviceName,
        dimensions: {
            window: { devicePixelRatio, innerHeight, innerWidth, isLandscape, outerHeight, outerWidth, screenHeight, screenWidth },
        },
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

    // 3.  Take the screenshot
    const base64Image: string = await takeBase64Screenshot(methods.screenShot)

    // Determine the rectangles
    const screenRectangleOptions: ScreenRectanglesOptions = {
        devicePixelRatio: devicePixelRatio || NaN,
        innerHeight: innerHeight || NaN,
        innerWidth: innerWidth || NaN,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isLandscape,
    }
    const rectangles: RectanglesOutput = determineScreenRectangles(base64Image, screenRectangleOptions)
    // 4.  Make a cropped base64 image
    const croppedBase64Image: string = await makeCroppedBase64Image({
        addIOSBezelCorners,
        base64Image,
        deviceName,
        devicePixelRatio: devicePixelRatio || NaN,
        isIOS,
        isLandscape,
        rectangles,
    })

    // 5.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image: croppedBase64Image,
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
        isNativeContext,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 6.  Return the data
    return afterScreenshot(methods.executor, afterOptions)
}
