import { takeBase64BiDiScreenshot, takeBase64Screenshot } from '../methods/screenshots.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { determineScreenRectangles } from '../methods/rectangles.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { RectanglesOutput, ScreenRectanglesOptions } from '../methods/rectangles.interfaces.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import { canUseBidiScreenshot, getMethodOrWicOption } from '../helpers/utils.js'

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
    const disableBlinkingCursor = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'disableBlinkingCursor')
    const disableCSSAnimation = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'disableCSSAnimation')
    const enableLayoutTesting = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'enableLayoutTesting')
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'enableLegacyScreenshotMethod')
    const hideScrollBars = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'hideScrollBars')
    const hideElements: HTMLElement[] = saveScreenOptions.method.hideElements || []
    const removeElements: HTMLElement[] = saveScreenOptions.method.removeElements || []
    const waitForFontsLoaded = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'waitForFontsLoaded')

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
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(beforeOptions)
    const {
        browserName,
        browserVersion,
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                innerWidth,
                isEmulated,
                isLandscape,
                outerHeight,
                outerWidth,
                screenHeight,
                screenWidth,
            },
        },
        initialDevicePixelRatio,
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
    let base64Image: string

    if (canUseBidiScreenshot() && !isMobile && !enableLegacyScreenshotMethod) {
        // 3a. Take the screenshot with the BiDi method
        base64Image = await takeBase64BiDiScreenshot({
            bidiScreenshot: methods.bidiScreenshot!,
            getWindowHandle: methods.getWindowHandle!,
        })
    } else {
        // 3b. Take the screenshot with the regular method
        base64Image = await takeBase64Screenshot()

        // Determine the rectangles
        const screenRectangleOptions: ScreenRectanglesOptions = {
            devicePixelRatio: devicePixelRatio || NaN,
            enableLegacyScreenshotMethod,
            innerHeight: innerHeight || NaN,
            innerWidth: innerWidth || NaN,
            isAndroidChromeDriverScreenshot,
            isAndroidNativeWebScreenshot,
            isEmulated: isEmulated || false,
            initialDevicePixelRatio: initialDevicePixelRatio || NaN,
            isIOS,
            isLandscape,
        }
        const rectangles: RectanglesOutput = determineScreenRectangles(base64Image, screenRectangleOptions)
        // 4.  Make a cropped base64 image
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners,
            base64Image,
            deviceName,
            devicePixelRatio: devicePixelRatio || NaN,
            isIOS,
            isLandscape,
            rectangles,
        })
    }

    // 5.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image,
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
        isNativeContext,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 6.  Return the data
    return afterScreenshot(afterOptions)
}
