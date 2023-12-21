import { takeBase64Screenshot } from '../methods/screenshots'
import { makeCroppedBase64Image } from '../methods/images'
import beforeScreenshot from '../helpers/beforeScreenshot'
import afterScreenshot from '../helpers/afterScreenshot'
import { determineScreenRectangles } from '../methods/rectangles'
import type { Methods } from '../methods/methods.interface'
import type { Folders } from '../base.interface'
import type { SaveScreenOptions } from './screen.interfaces'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interface'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces'
import type { RectanglesOutput, ScreenRectanglesOptions } from '../methods/rectangles.interfaces'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    saveScreenOptions: SaveScreenOptions,
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addressBarShadowPadding, addIOSBezelCorners, formatImageName, logLevel, savePerInstance, toolBarShadowPadding } =
    saveScreenOptions.wic

    // 1b. Set the method options to the right values
    const disableCSSAnimation: boolean =
    'disableCSSAnimation' in saveScreenOptions.method
        ? saveScreenOptions.method.disableCSSAnimation
        : saveScreenOptions.wic.disableCSSAnimation
    const hideScrollBars: boolean =
    'hideScrollBars' in saveScreenOptions.method ? saveScreenOptions.method.hideScrollBars : saveScreenOptions.wic.hideScrollBars
    const hideElements: HTMLElement[] = saveScreenOptions.method.hideElements || []
    const removeElements: HTMLElement[] = saveScreenOptions.method.removeElements || []

    // 2.  Prepare the beforeScreenshot
    const beforeOptions: BeforeScreenshotOptions = {
        instanceData,
        addressBarShadowPadding,
        disableCSSAnimation,
        hideElements,
        logLevel,
        noScrollBars: hideScrollBars,
        removeElements,
        toolBarShadowPadding,
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
        isIos,
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
        devicePixelRatio,
        innerHeight,
        innerWidth,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIos,
        isLandscape,
    }
    const rectangles: RectanglesOutput = determineScreenRectangles(base64Image, screenRectangleOptions)
    // 4.  Make a cropped base64 image
    const croppedBase64Image: string = await makeCroppedBase64Image({
        addIOSBezelCorners,
        base64Image,
        deviceName,
        devicePixelRatio,
        isIos,
        isLandscape,
        logLevel,
        rectangles,
    })

    // 5.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image: croppedBase64Image,
        disableCSSAnimation,
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
            devicePixelRatio,
            formatImageName,
            isMobile,
            isTestInBrowser,
            logName,
            name,
            outerHeight,
            outerWidth,
            platformName,
            platformVersion,
            screenHeight,
            screenWidth,
            tag,
        },
        hideElements,
        hideScrollBars,
        isLandscape,
        logLevel,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 6.  Return the data
    return afterScreenshot(methods.executor, afterOptions)
}
