import type { FullPageScreenshotsData, FullPageScreenshotDataOptions } from './screenshots.interfaces.js'
import {
    getMobileFullPageNativeWebScreenshotsData,
    getAndroidChromeDriverFullPageScreenshotsData,
    getDesktopFullPageScreenshotsData,
    takeBase64BiDiScreenshot
} from './screenshots.js'

/**
 * Determines which screenshot method to use and executes it
 * This replaces the complex getBase64FullPageScreenshotsData router
 */
export async function takeFullPageScreenshots(
    browserInstance: WebdriverIO.Browser,
    options: FullPageScreenshotDataOptions,
    shouldUseBidi: boolean = false
): Promise<FullPageScreenshotsData> {

    // BiDi screenshots return the image directly, no stitching needed
    if (shouldUseBidi) {
        const screenshot = await takeBase64BiDiScreenshot({ browserInstance, origin: 'document' })

        // Return the screenshot directly for BiDi - indicate this is a direct image
        return {
            fullPageHeight: -1, // Special marker for BiDi direct image
            fullPageWidth: -1,  // Special marker for BiDi direct image
            data: [{
                canvasWidth: 0,
                canvasYPosition: 0,
                imageHeight: 0,
                imageWidth: 0,
                imageXPosition: 0,
                imageYPosition: 0,
                screenshot,
            }]
        }
    }

    // Route to the appropriate scrolling screenshot method
    if (isAndroidNativeWeb(options) || options.isIOS) {
        return getMobileFullPageNativeWebScreenshotsData(browserInstance, createMobileOptions(options))
    }

    if (isAndroidChromeDriver(options)) {
        return getAndroidChromeDriverFullPageScreenshotsData(browserInstance, createDesktopOptions(options))
    }

    // Default to desktop
    return getDesktopFullPageScreenshotsData(browserInstance, createDesktopOptions(options))
}

/**
 * Simple check for Android native web screenshots
 */
function isAndroidNativeWeb(options: FullPageScreenshotDataOptions): boolean {
    return options.isAndroid && options.isAndroidNativeWebScreenshot
}

/**
 * Simple check for Android ChromeDriver screenshots
 */
function isAndroidChromeDriver(options: FullPageScreenshotDataOptions): boolean {
    return options.isAndroid && options.isAndroidChromeDriverScreenshot
}

/**
 * Create mobile-specific options from the full options
 */
function createMobileOptions(options: FullPageScreenshotDataOptions) {
    return {
        addressBarShadowPadding: options.addressBarShadowPadding,
        devicePixelRatio: options.devicePixelRatio,
        deviceRectangles: options.deviceRectangles,
        fullPageScrollTimeout: options.fullPageScrollTimeout,
        hideAfterFirstScroll: options.hideAfterFirstScroll,
        innerHeight: options.innerHeight,
        isAndroid: options.isAndroid,
        isLandscape: options.isLandscape,
        screenHeight: options.screenHeight,
        screenWidth: options.screenWidth,
        toolBarShadowPadding: options.toolBarShadowPadding,
    }
}

/**
 * Create desktop-specific options from the full options
 */
function createDesktopOptions(options: FullPageScreenshotDataOptions) {
    return {
        devicePixelRatio: options.devicePixelRatio,
        fullPageScrollTimeout: options.fullPageScrollTimeout,
        hideAfterFirstScroll: options.hideAfterFirstScroll,
        innerHeight: options.innerHeight,
    }
}
