import type { FullPageScreenshotsData, FullPageScreenshotDataOptions } from './screenshots.interfaces.js'
import {
    getMobileFullPageNativeWebScreenshotsData,
    getAndroidChromeDriverFullPageScreenshotsData,
    getDesktopFullPageScreenshotsData,
    takeBase64BiDiScreenshot
} from './screenshots.js'

export async function takeFullPageScreenshots(
    browserInstance: WebdriverIO.Browser,
    options: FullPageScreenshotDataOptions,
    shouldUseBidi: boolean = false
): Promise<FullPageScreenshotsData> {
    if (shouldUseBidi) {
        const screenshot = await takeBase64BiDiScreenshot({ browserInstance, origin: 'document' })

        return {
            fullPageHeight: -1,
            fullPageWidth: -1,
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

    if (isAndroidNativeWeb(options) || options.isIOS) {
        return getMobileFullPageNativeWebScreenshotsData(browserInstance, createMobileOptions(options))
    }

    if (isAndroidChromeDriver(options)) {
        return getAndroidChromeDriverFullPageScreenshotsData(browserInstance, createDesktopOptions(options))
    }

    // Default to desktop
    return getDesktopFullPageScreenshotsData(browserInstance, createDesktopOptions(options))
}

function isAndroidNativeWeb(options: FullPageScreenshotDataOptions): boolean {
    return options.isAndroid && options.isAndroidNativeWebScreenshot
}

function isAndroidChromeDriver(options: FullPageScreenshotDataOptions): boolean {
    return options.isAndroid && options.isAndroidChromeDriverScreenshot
}

function createMobileOptions(options: FullPageScreenshotDataOptions) {
    return {
        addressBarShadowPadding: options.addressBarShadowPadding,
        devicePixelRatio: options.devicePixelRatio,
        deviceRectangles: options.deviceRectangles,
        fullPageScrollTimeout: options.fullPageScrollTimeout,
        hideAfterFirstScroll: options.hideAfterFirstScroll,
        innerHeight: options.innerHeight,
        isAndroid: options.isAndroid,
        isIOS: options.isIOS,
        isLandscape: options.isLandscape,
        screenWidth: options.screenWidth,
        toolBarShadowPadding: options.toolBarShadowPadding,
    }
}

function createDesktopOptions(options: FullPageScreenshotDataOptions) {
    return {
        devicePixelRatio: options.devicePixelRatio,
        fullPageScrollTimeout: options.fullPageScrollTimeout,
        hideAfterFirstScroll: options.hideAfterFirstScroll,
        innerHeight: options.innerHeight,
    }
}
