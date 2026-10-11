import type { FullPageScreenshotsData, FullPageScreenshotDataOptions } from './screenshots.interfaces.js'
import {
    getScrollContainerFullPageScreenshotsData,
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
    // A page where a container scrolls and not the page (#125): a BiDi screenshot of the document does not show the
    // content of the container, so always scroll and stitch
    if (options.scrollContainer) {
        return getScrollContainerFullPageScreenshotsData(browserInstance, {
            devicePixelRatio: options.devicePixelRatio,
            fullPageScrollTimeout: options.fullPageScrollTimeout,
            hideAfterFirstScroll: options.hideAfterFirstScroll,
            hideScrollBars: options.hideScrollBars ?? true,
            ignoreElements: options.ignoreElements,
            scrollContainer: options.scrollContainer,
            viewport: getMobileScreenViewport(options),
        })
    }

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

/**
 * The viewport in a mobile screenshot of the screen (Android native web, iOS), in CSS pixels. The device rectangles
 * are in device pixels on Android and in CSS pixels on iOS. In a full page screenshot with a scroll container, the
 * service adds no shadow padding to the page, so the page is exactly in this viewport. Other screenshots are the
 * viewport: `undefined`
 */
function getMobileScreenViewport(options: FullPageScreenshotDataOptions): { x: number, y: number, width: number, height: number } | undefined {
    if (!isAndroidNativeWeb(options) && !options.isIOS) {
        return undefined
    }
    const { viewport } = options.deviceRectangles
    const scale = options.isAndroid ? options.devicePixelRatio : 1

    return { x: viewport.x / scale, y: viewport.y / scale, width: viewport.width / scale, height: viewport.height / scale }
}
