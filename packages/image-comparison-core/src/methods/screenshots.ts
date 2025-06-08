import logger from '@wdio/logger'
import { browser } from '@wdio/globals'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import getDocumentScrollHeight from '../clientSideScripts/getDocumentScrollHeight.js'
import { calculateDprData, getBase64ScreenshotSize, waitFor } from '../helpers/utils.js'
import type {
    FullPageScreenshotOptions,
    FullPageScreenshotNativeMobileOptions,
    FullPageScreenshotDataOptions,
    FullPageScreenshotsData,
    TakeWebElementScreenshot,
    TakeWebElementScreenshotData,
} from './screenshots.interfaces.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import type { ElementRectanglesOptions, RectanglesOutput } from './rectangles.interfaces.js'
import { determineElementRectangles } from './rectangles.js'

const log = logger('@wdio/visual-service:webdriver-image-comparison-screenshots')

/**
 * Take a full page screenshots for desktop / iOS / Android
 */
export async function getBase64FullPageScreenshotsData(options: FullPageScreenshotDataOptions): Promise<FullPageScreenshotsData> {
    const {
        addressBarShadowPadding,
        devicePixelRatio,
        deviceRectangles,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isAndroidChromeDriverScreenshot,
        isIOS,
        screenHeight,
        screenWidth,
        toolBarShadowPadding,
    } = options
    const desktopOptions = {
        devicePixelRatio,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight,
    }
    const nativeWebScreenshotOptions = {
        ...desktopOptions,
        addressBarShadowPadding,
        deviceRectangles,
        isAndroid,
        screenHeight,
        screenWidth,
        toolBarShadowPadding,
    }

    if ((isAndroid && isAndroidNativeWebScreenshot) || isIOS ) {
        // Create a fullpage screenshot for Android when a native web screenshot (so including status, address and toolbar) is created
        return getMobileFullPageNativeWebScreenshotsData(nativeWebScreenshotOptions)
    } else if (isAndroid && isAndroidChromeDriverScreenshot) {
        const chromeDriverOptions = { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight }

        // Create a fullpage screenshot for Android when the ChromeDriver provides the screenshots
        return getAndroidChromeDriverFullPageScreenshotsData(chromeDriverOptions)
    }

    // Create a fullpage screenshot for all desktops
    return getDesktopFullPageScreenshotsData(desktopOptions)
}

/**
 * Take a full page screenshots for native mobile
 */
export async function getMobileFullPageNativeWebScreenshotsData(options: FullPageScreenshotNativeMobileOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    // The addressBarShadowPadding and toolBarShadowPadding is used because the viewport might have a shadow on the address and the tool bar
    // so the cutout of the viewport needs to be a little bit smaller
    const {
        addressBarShadowPadding,
        devicePixelRatio,
        deviceRectangles: { viewport },
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        isAndroid,
        isLandscape,
        toolBarShadowPadding,
    } = options
    // The returned data from the deviceRectangles is in real pixels, not CSS pixels, so we need to divide it by the devicePixelRatio
    // but only for Android, because the deviceRectangles are already in CSS pixels for iOS
    const viewportHeight = Math.round(viewport.height / (isAndroid ? devicePixelRatio : 1)) - addressBarShadowPadding - toolBarShadowPadding
    const viewportWidth= Math.round(viewport.width / (isAndroid ? devicePixelRatio : 1))
    const viewportX = Math.round(viewport.x / (isAndroid ? devicePixelRatio : 1))
    const viewportY = Math.round(viewport.y / (isAndroid ? devicePixelRatio : 1))
    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let isRotated = false

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = viewportHeight * i
        await browser.execute(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await browser.execute(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot and determine if it's rotated
        const screenshot = await takeBase64Screenshot()
        isRotated = Boolean(isLandscape && viewportHeight > viewportWidth)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await browser.execute(getDocumentScrollHeight)
        if (scrollHeight && (scrollY + viewportHeight < scrollHeight)) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }
        // There is no else

        // The height of the image of the last 1 could be different
        const imageHeight = amountOfScrollsArray.length === i && scrollHeight
            ? scrollHeight - scrollY - addressBarShadowPadding - toolBarShadowPadding
            : viewportHeight
        // The starting position for cropping could be different for the last image
        // The cropping always needs to start at status and address bar height and the address bar shadow padding
        const imageYPosition =
            (amountOfScrollsArray.length === i ? viewportHeight - imageHeight : 0) + viewportY + addressBarShadowPadding

        // Store all the screenshot data in the screenshot object
        viewportScreenshots.push({
            ...calculateDprData(
                {
                    canvasWidth: isRotated ? viewportHeight : viewportWidth,
                    canvasYPosition: scrollY,
                    imageHeight: imageHeight,
                    imageWidth: isRotated ? viewportHeight : viewportWidth,
                    imageXPosition: viewportX,
                    imageYPosition: imageYPosition,
                },
                devicePixelRatio,
            ),
            screenshot,
        })

        // Show scrollbars again
        await browser.execute(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e)
        }
    }

    if (!scrollHeight) {
        throw new Error('Couldn\'t determine scroll height or screenshot size')
    }

    return {
        ...calculateDprData(
            {
                fullPageHeight: scrollHeight - addressBarShadowPadding - toolBarShadowPadding,
                fullPageWidth: isRotated ? viewportHeight : viewportWidth,
            },
            devicePixelRatio,
        ),
        data: viewportScreenshots,
    }
}

/**
 * Take a full page screenshot for Android with Chromedriver
 */
export async function getAndroidChromeDriverFullPageScreenshotsData(options: FullPageScreenshotOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight } = options

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = innerHeight * i
        await browser.execute(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await browser.execute(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot()
        screenshotSize = getBase64ScreenshotSize(screenshot, devicePixelRatio)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await browser.execute(getDocumentScrollHeight)
        if (scrollHeight && (scrollY + innerHeight < scrollHeight)) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }
        // There is no else

        // The height of the image of the last 1 could be different
        const imageHeight: number = amountOfScrollsArray.length === i && scrollHeight
            ? scrollHeight - innerHeight * viewportScreenshots.length
            : innerHeight

        // The starting position for cropping could be different for the last image (0 means no cropping)
        const imageYPosition = amountOfScrollsArray.length === i && amountOfScrollsArray.length !== 0 ? innerHeight - imageHeight : 0

        // Store all the screenshot data in the screenshot object
        viewportScreenshots.push({
            ...calculateDprData(
                {
                    canvasWidth: screenshotSize.width,
                    canvasYPosition: scrollY,
                    imageHeight: imageHeight,
                    imageWidth: screenshotSize.width,
                    imageXPosition: 0,
                    imageYPosition: imageYPosition,
                },
                devicePixelRatio,
            ),
            screenshot,
        })

        // Show the scrollbars again
        await browser.execute(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e)
        }
    }

    if (!scrollHeight || !screenshotSize) {
        throw new Error('Couldn\'t determine scroll height or screenshot size')
    }

    return {
        ...calculateDprData(
            {
                fullPageHeight: scrollHeight,
                fullPageWidth: screenshotSize.width,
            },
            devicePixelRatio,
        ),
        data: viewportScreenshots,
    }
}

/**
 * Take a full page screenshots
 */
export async function getDesktopFullPageScreenshotsData(options: FullPageScreenshotOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight } = options
    let actualInnerHeight = innerHeight

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = actualInnerHeight * i
        await browser.execute(scrollToPosition, scrollY)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot()
        screenshotSize = getBase64ScreenshotSize(screenshot, devicePixelRatio)

        // The actual screenshot size might be slightly different than the inner height
        // In that case, use the screenshot size instead of the innerHeight
        if (i === 0 && screenshotSize.height !== actualInnerHeight) {
            if (Math.round(screenshotSize.height) === actualInnerHeight) {
                actualInnerHeight = screenshotSize.height
            }
            // No else, because some drivers take a full page screenshot, e.g. some versions of FireFox,
            // and SafariDriver for Safari 11
        }

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await browser.execute(getDocumentScrollHeight)

        if (scrollHeight && (scrollY + actualInnerHeight < scrollHeight) && screenshotSize.height === actualInnerHeight) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }
        // There is no else, Lazy load and large screenshots,
        // like with older drivers such as FF <= 47 and IE11, will not work

        // The height of the image of the last 1 could be different
        const imageHeight: number = scrollHeight && amountOfScrollsArray.length === i
            ? scrollHeight - actualInnerHeight * viewportScreenshots.length
            : screenshotSize.height
        // The starting position for cropping could be different for the last image (0 means no cropping)
        const imageYPosition = amountOfScrollsArray.length === i && amountOfScrollsArray.length !== 0
            ? actualInnerHeight - imageHeight
            : 0

        // Store all the screenshot data in the screenshot object
        viewportScreenshots.push({
            ...calculateDprData(
                {
                    canvasWidth: screenshotSize.width,
                    canvasYPosition: scrollY,
                    imageHeight: imageHeight,
                    imageWidth: screenshotSize.width,
                    imageXPosition: 0,
                    imageYPosition: imageYPosition,
                },
                devicePixelRatio,
            ),
            screenshot,
        })
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await browser.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e)
        }
    }

    if (!scrollHeight || !screenshotSize) {
        throw new Error('Couldn\'t determine scroll height or screenshot size')
    }

    return {
        ...calculateDprData(
            {
                fullPageHeight: scrollHeight,
                fullPageWidth: screenshotSize.width,
            },
            devicePixelRatio,
        ),
        data: viewportScreenshots,
    }
}

/**
 * Take a screenshot
 */
export async function takeBase64Screenshot(): Promise<string> {
    return browser.takeScreenshot()
}

/**
 * Take a bidi screenshot
 */
export async function takeBase64BiDiScreenshot({ origin = 'viewport', clip }: { origin?: 'viewport' | 'document', clip?: RectanglesOutput} = {}): Promise<string> {
    log.info('Taking a BiDi screenshot')
    const contextID = await browser.getWindowHandle()

    return (await browser.browsingContextCaptureScreenshot({
        context: contextID,
        origin,
        ...(clip ? { clip: { ...clip, type: 'box' } } : {})
    })).data
}

/**
 * Log an error for not being able to hide remove elements
 *
 * @TODO: remove the any
 */
function logHiddenRemovedError(error: any) {
    log.warn(
        '\x1b[33m%s\x1b[0m',
        `
#####################################################################################
 WARNING:
 (One of) the elements that needed to be hidden or removed could not be found on the
 page and caused this error
 Error: ${error}
 We made sure the test didn't break.
#####################################################################################
`,
    )
}

/**
 * Take an element screenshot on the web
 */
export async function takeWebElementScreenshot({
    devicePixelRatio,
    deviceRectangles,
    element,
    fallback = false,
    initialDevicePixelRatio,
    isEmulated,
    innerHeight,
    isAndroidNativeWebScreenshot,
    isAndroid,
    isIOS,
    isLandscape,
}:TakeWebElementScreenshot): Promise<TakeWebElementScreenshotData>{
    if (fallback) {
        const base64Image = await takeBase64Screenshot()
        const elementRectangleOptions: ElementRectanglesOptions = {
            /**
             * ToDo: handle NaA case
             */
            devicePixelRatio: devicePixelRatio || NaN,
            deviceRectangles,
            initialDevicePixelRatio,
            innerHeight: innerHeight || NaN,
            isEmulated,
            isAndroidNativeWebScreenshot,
            isAndroid,
            isIOS,
        }
        const rectangles = await determineElementRectangles({
            base64Image,
            element,
            options: elementRectangleOptions,
        })

        return {
            base64Image,
            isWebDriverElementScreenshot: false,
            rectangles,
        }
    }

    try {
        const   base64Image = await browser.takeElementScreenshot!((await element as WebdriverIO.Element).elementId)
        const { height, width } = getBase64ScreenshotSize(base64Image)
        const rectangles = { x: 0, y: 0, width, height }

        if (rectangles.width === 0 || rectangles.height === 0) {
            throw new Error('The element has no width or height.')
        }

        return {
            base64Image,
            isWebDriverElementScreenshot: true,
            rectangles,
        }
    } catch (_e) {
        log.warn('The element screenshot failed, falling back to cutting the full device/viewport screenshot:', _e)
        return takeWebElementScreenshot({
            devicePixelRatio,
            deviceRectangles,
            element,
            fallback: true,
            initialDevicePixelRatio,
            isEmulated,
            innerHeight,
            isAndroidNativeWebScreenshot,
            isAndroid,
            isIOS,
            isLandscape,
        })
    }
}
