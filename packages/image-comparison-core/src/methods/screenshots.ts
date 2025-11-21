import logger from '@wdio/logger'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import getDocumentScrollHeight from '../clientSideScripts/getDocumentScrollHeight.js'
import { calculateDprData, getBase64ScreenshotSize, waitFor } from '../helpers/utils.js'
import type {
    FullPageScreenshotOptions,
    FullPageScreenshotNativeMobileOptions,
    FullPageScreenshotsData,
    TakeWebElementScreenshot,
    TakeWebElementScreenshotData,
} from './screenshots.interfaces.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import type { ElementRectanglesOptions, RectanglesOutput } from './rectangles.interfaces.js'
import { determineElementRectangles } from './rectangles.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:screenshots')

/**
 * Take a full page screenshots for desktop / iOS / Android
 */
export async function getMobileFullPageNativeWebScreenshotsData(browserInstance: WebdriverIO.Browser, options: FullPageScreenshotNativeMobileOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    // The addressBarShadowPadding and toolBarShadowPadding is used because the viewport might have a shadow on the address and the tool bar
    // so the cutout of the viewport needs to be a little bit smaller
    const {
        addressBarShadowPadding,
        devicePixelRatio,
        deviceRectangles: { viewport, bottomBar, homeBar },
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        isAndroid,
        isLandscape,
        toolBarShadowPadding,
    } = options
    // The returned data from the deviceRectangles is in real pixels, not CSS pixels, so we need to divide it by the devicePixelRatio
    // but only for Android, because the deviceRectangles are already in CSS pixels for iOS
    const viewportHeight = Math.round(viewport.height / (isAndroid ? devicePixelRatio : 1)) - addressBarShadowPadding - toolBarShadowPadding
    const hasNoBottomBar = bottomBar.height === 0
    const hasHomeBar = homeBar.height > 0
    const effectiveViewportHeight = hasNoBottomBar && hasHomeBar
        ? viewportHeight - Math.round(homeBar.height / (isAndroid ? devicePixelRatio : 1))
        : viewportHeight
    const viewportWidth= Math.round(viewport.width / (isAndroid ? devicePixelRatio : 1))
    const viewportX = Math.round(viewport.x / (isAndroid ? devicePixelRatio : 1))
    const viewportY = Math.round(viewport.y / (isAndroid ? devicePixelRatio : 1))
    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let isRotated = false
    let actualFullPageWidth: number | undefined

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = effectiveViewportHeight * i

        if (scrollY < 0) {
            const currentBrowserScrollPosition = await browserInstance.execute(() => window.pageYOffset || document.documentElement.scrollTop)

            log.error('Negative scrollY detected during full page screenshot', {
                iteration: i,
                scrollY,
                effectiveViewportHeight,
                originalViewportHeight: viewportHeight,
                calculatedScrollY: effectiveViewportHeight * i,
                deviceInfo: {
                    isAndroid,
                    isLandscape,
                    devicePixelRatio,
                    addressBarShadowPadding,
                    toolBarShadowPadding
                },
                deviceRectangles: {
                    viewport: options.deviceRectangles.viewport,
                    bottomBar: options.deviceRectangles.bottomBar,
                    homeBar: options.deviceRectangles.homeBar,
                    screenSize: options.deviceRectangles.screenSize
                },
                homeBarAdjustment: {
                    hasNoBottomBar,
                    hasHomeBar,
                    homeBarHeightAdjustment: hasNoBottomBar && hasHomeBar ? Math.round(homeBar.height / (isAndroid ? devicePixelRatio : 1)) : 0
                },
                scrollHeight,
                currentBrowserScrollPosition
            })

            throw new Error(`Negative scroll position detected (scrollY: ${scrollY}) during full page screenshot at iteration ${i}. This indicates an issue with viewport calculations or browser scroll state. Check logs for detailed debug information.`)
        }

        await browserInstance.execute(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await browserInstance.execute(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot and determine if it's rotated
        const screenshot = await takeBase64Screenshot(browserInstance)
        isRotated = Boolean(isLandscape && effectiveViewportHeight > viewportWidth)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await browserInstance.execute(getDocumentScrollHeight)

        // Get actual scroll position after scrolling to verify it matches scrollY
        const actualScrollInfo = await browserInstance.execute(() => ({
            scrollTop: window.pageYOffset || document.documentElement.scrollTop,
        }))

        if (scrollHeight && (scrollY + effectiveViewportHeight < scrollHeight)) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }

        // For the last image, use the actual scroll position instead of the intended scrollY
        // because the browser may not be able to scroll to the exact position we requested
        const isLastImage = amountOfScrollsArray.length === i
        const scrollPositionForCalculation = isLastImage && actualScrollInfo
            ? actualScrollInfo.scrollTop
            : scrollY

        const remainingContent = scrollHeight ? scrollHeight - scrollPositionForCalculation : 0
        const imageHeight = isLastImage && scrollHeight && remainingContent > 0
            ? remainingContent
            : effectiveViewportHeight

        if (amountOfScrollsArray.length === i && remainingContent <= 0) {
            break
        }

        // The starting position for cropping could be different for the last image
        // The cropping always needs to start at status and address bar height and the address bar shadow padding
        // For the last image, if imageHeight > effectiveViewportHeight, we crop from the top (y=0)
        // Otherwise, we crop from the bottom to align with previous images
        const imageYPositionBase = isLastImage && imageHeight <= effectiveViewportHeight
            ? effectiveViewportHeight - imageHeight
            : 0
        const imageYPosition = imageYPositionBase + viewportY + addressBarShadowPadding
        // For the last image, use the actual scroll position for canvasYPosition
        // because the browser may not be able to scroll to the exact position we requested
        const canvasYPositionForStorage = isLastImage && actualScrollInfo
            ? actualScrollInfo.scrollTop
            : scrollY

        // Store all the screenshot data in the screenshot object
        const screenshotData = {
            ...calculateDprData(
                {
                    canvasWidth: isRotated ? effectiveViewportHeight : viewportWidth,
                    canvasYPosition: canvasYPositionForStorage,
                    imageHeight: imageHeight,
                    imageWidth: isRotated ? effectiveViewportHeight : viewportWidth,
                    imageXPosition: viewportX,
                    imageYPosition: imageYPosition,
                },
                devicePixelRatio,
            ),
            screenshot,
        }
        viewportScreenshots.push(screenshotData)

        // Calculate the actual cropped width from the first screenshot to handle rounding differences
        if (i === 0 && !actualFullPageWidth) {
            const { height: screenshotHeightDevicePixels, width: screenshotWidthDevicePixels } = getBase64ScreenshotSize(screenshot)
            const screenshotIsRotated = Boolean(isLandscape && screenshotHeightDevicePixels > screenshotWidthDevicePixels)
            const actualScreenshotWidthDevicePixels = screenshotIsRotated ? screenshotHeightDevicePixels : screenshotWidthDevicePixels
            const maxAvailableWidthDevicePixels = actualScreenshotWidthDevicePixels - screenshotData.imageXPosition
            const actualCroppedWidthDevicePixels = Math.min(screenshotData.imageWidth, maxAvailableWidthDevicePixels)

            actualFullPageWidth = actualCroppedWidthDevicePixels / devicePixelRatio
        }

        // Show scrollbars again
        await browserInstance.execute(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e)
        }
    }

    if (!scrollHeight) {
        throw new Error('Couldn\'t determine scroll height or screenshot size')
    }

    const fullPageHeight = scrollHeight - addressBarShadowPadding - toolBarShadowPadding
    const fullPageWidth = actualFullPageWidth ?? (isRotated ? effectiveViewportHeight : viewportWidth)

    return {
        ...calculateDprData(
            {
                fullPageHeight,
                fullPageWidth,
            },
            devicePixelRatio,
        ),
        data: viewportScreenshots,
    }
}

/**
 * Take a full page screenshot for Android with Chromedriver
 */
export async function getAndroidChromeDriverFullPageScreenshotsData(browserInstance:WebdriverIO.Browser, options: FullPageScreenshotOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight } = options

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = innerHeight * i
        await browserInstance.execute(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await browserInstance.execute(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot(browserInstance)
        screenshotSize = getBase64ScreenshotSize(screenshot, devicePixelRatio)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await browserInstance.execute(getDocumentScrollHeight)
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
        await browserInstance.execute(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
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
export async function getDesktopFullPageScreenshotsData(browserInstance:WebdriverIO.Browser, options: FullPageScreenshotOptions): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight } = options
    let actualInnerHeight = innerHeight

    const { capabilities } = browserInstance
    const browserName = (capabilities?.browserName || '').toLowerCase()
    // Safari desktop returns the browser mask with rounded corners and a drop shadow, so we need to fix this
    const isSafariDesktop = browserName.includes('safari') && !browserInstance.isMobile
    const safariTopDropShadowCssPixels = isSafariDesktop ? Math.round(1 * devicePixelRatio) : 0
    const safariBottomCropOffsetCssPixels = isSafariDesktop ? Math.round(10 * devicePixelRatio) : 0
    // For Safari desktop, calculate effective scroll increment
    // First image: scroll by 0, use full height (e.g.716px), crop 10px from bottom
    // Subsequent images: scroll by (actualInnerHeight - dropShadowOffset - bottomCropOffset) = 705px, crop 1px from top and 10px from bottom
    const effectiveScrollIncrement = isSafariDesktop
        ? actualInnerHeight - safariTopDropShadowCssPixels - safariBottomCropOffsetCssPixels
        : actualInnerHeight
    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        // For Safari desktop: first image scrolls to 0, subsequent images scroll by effectiveScrollIncrement (715px)
        // Image 0: scrollY = 0
        // Image 1: scrollY = 715 (effectiveScrollIncrement)
        // Image 2: scrollY = 1430 (2 * effectiveScrollIncrement)
        // etc.
        const scrollY = isSafariDesktop
            ? (i === 0 ? 0 : i * effectiveScrollIncrement)
            : actualInnerHeight * i

        await browserInstance.execute(scrollToPosition, scrollY)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot(browserInstance)
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

        scrollHeight = await browserInstance.execute(getDocumentScrollHeight)

        // For Safari desktop, use effectiveScrollIncrement for the scroll check
        const scrollCheckHeight = isSafariDesktop ? effectiveScrollIncrement : actualInnerHeight

        if (scrollHeight && (scrollY + scrollCheckHeight < scrollHeight) && screenshotSize.height === actualInnerHeight) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }

        // The height of the image of the last 1 could be different
        // For Safari desktop, account for first image being full height and subsequent images being cropped
        const isFirstImage = i === 0
        const isLastImage = amountOfScrollsArray.length === i
        let imageHeight: number
        if (scrollHeight && isLastImage) {
            if (isSafariDesktop) {
                // Calculate remaining content: scrollHeight - (firstImageHeight + (numberOfPreviousImages - 1) * effectiveScrollIncrement)
                const numberOfPreviousImages = viewportScreenshots.length
                const totalPreviousHeight = numberOfPreviousImages === 0
                    ? 0
                    : actualInnerHeight + (numberOfPreviousImages - 1) * effectiveScrollIncrement
                const remainingContent = scrollHeight - totalPreviousHeight
                // For the last image, we need to be smart:
                // - If remainingContent >= actualInnerHeight: it's a full screenshot, treat it like a regular non-first image
                //   (crop 1px from top, visible height = 705px, but last image doesn't crop bottom, so add 10px)
                // - If remainingContent < actualInnerHeight: it's a partial screenshot
                //   For partial screenshots, we're cropping from a position that doesn't include the drop shadow at pixel 0
                //   Last image doesn't crop bottom, so we need to add 10px to account for that
                imageHeight = remainingContent >= actualInnerHeight
                    ? effectiveScrollIncrement + safariBottomCropOffsetCssPixels
                    : remainingContent + safariBottomCropOffsetCssPixels
            } else {
                imageHeight = scrollHeight - actualInnerHeight * viewportScreenshots.length
            }
        } else {
            // Non-last images: use full height for first, effectiveScrollIncrement for subsequent
            // For non-first images, effectiveScrollIncrement already accounts for top and bottom crops
            imageHeight = isSafariDesktop && !isFirstImage
                ? effectiveScrollIncrement
                : screenshotSize.height
        }

        // The starting position for cropping could be different for the last image (0 means no cropping)
        // For Safari desktop, crop 1px from top for all images except first
        if (isSafariDesktop && isFirstImage && safariBottomCropOffsetCssPixels > 0) {
            imageHeight -= safariBottomCropOffsetCssPixels
        }

        // The starting position for cropping could be different for the last image (0 means no cropping)
        // For Safari desktop, crop 1px from top for all images except first
        let imageYPosition: number
        if (isSafariDesktop) {
            if (isLastImage && !isFirstImage) {
                // Last image: need to handle two cases
                const numberOfPreviousImages = viewportScreenshots.length
                const totalPreviousHeight = numberOfPreviousImages === 0
                    ? 0
                    : actualInnerHeight + (numberOfPreviousImages - 1) * effectiveScrollIncrement
                const remainingContent = scrollHeight ? scrollHeight - totalPreviousHeight : 0

                // Full screenshot: treat like regular non-first image (crop 1px from top)
                // Partial screenshot: we want to show the last remainingContent pixels
                // But we need to include the bottom 10px that we're not cropping, so start 10px higher
                // imageHeight = remainingContent, so we start at: 716 - remainingContent - 10px
                // This way we crop 10px higher to include the bottom corners
                imageYPosition = remainingContent >= actualInnerHeight
                    ? safariTopDropShadowCssPixels
                    : actualInnerHeight - remainingContent - safariBottomCropOffsetCssPixels

                // If remainingContent is too small, we might get negative imageYPosition or invalid dimensions
                if (imageYPosition < 0) {
                    imageYPosition = actualInnerHeight - remainingContent
                    imageHeight = remainingContent
                } else if (imageYPosition + imageHeight > screenshotSize.height) {
                    imageHeight = screenshotSize.height - imageYPosition
                }
            } else if (!isFirstImage) {
                // Non-last, non-first images: crop 1px from top
                imageYPosition = safariTopDropShadowCssPixels
            } else {
                // First image: no crop
                imageYPosition = 0
            }
        } else {
            imageYPosition = isLastImage && !isFirstImage
                ? actualInnerHeight - imageHeight
                : 0
        }

        // Ensure imageYPosition and imageHeight are valid for all cases
        if (imageYPosition < 0) {
            imageHeight += imageYPosition
            imageYPosition = 0
        }
        if (imageYPosition + imageHeight > screenshotSize.height) {
            imageHeight = screenshotSize.height - imageYPosition
        }

        // Calculate based on where the previous image ends
        // Previous image's canvasYPosition + previous image's height
        let canvasYPosition: number
        if (isSafariDesktop && !isFirstImage) {
            const previousImage = viewportScreenshots[viewportScreenshots.length - 1]
            canvasYPosition = previousImage
                ? previousImage.canvasYPosition + previousImage.imageHeight
                : actualInnerHeight + (i - 1) * effectiveScrollIncrement
        } else {
            canvasYPosition = isSafariDesktop ? 0 : scrollY
        }

        // Store all the screenshot data in the screenshot object
        viewportScreenshots.push({
            ...calculateDprData(
                {
                    canvasWidth: screenshotSize.width,
                    canvasYPosition: canvasYPosition,
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
            await browserInstance.execute(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
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
export async function takeBase64Screenshot(browserInstance: WebdriverIO.Browser): Promise<string> {
    return browserInstance.takeScreenshot()
}

/**
 * Take a bidi screenshot
 */
export async function takeBase64BiDiScreenshot({
    browserInstance,
    origin = 'viewport',
    clip,
}: {
    browserInstance: WebdriverIO.Browser,
    origin?: 'viewport' | 'document',
    clip?: RectanglesOutput,
}): Promise<string> {
    log.info('Taking a BiDi screenshot')
    const contextID = await browserInstance.getWindowHandle()

    return (await browserInstance.browsingContextCaptureScreenshot({
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
export function logHiddenRemovedError(error: any) {
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
    addressBarShadowPadding,
    browserInstance,
    devicePixelRatio,
    deviceRectangles,
    element,
    fallback = false,
    initialDevicePixelRatio,
    isEmulated,
    innerHeight,
    isAndroid,
    isAndroidChromeDriverScreenshot,
    isAndroidNativeWebScreenshot,
    isIOS,
    isLandscape,
    toolBarShadowPadding,
}: TakeWebElementScreenshot): Promise<TakeWebElementScreenshotData>{
    if (fallback) {
        const base64Image = await takeBase64Screenshot(browserInstance)
        const elementRectangleOptions: ElementRectanglesOptions = {
            /**
             * ToDo: handle NaA case
             */
            devicePixelRatio: devicePixelRatio,
            deviceRectangles,
            initialDevicePixelRatio: initialDevicePixelRatio || 1,
            innerHeight: innerHeight || NaN,
            isEmulated,
            isAndroidNativeWebScreenshot,
            isAndroid,
            isIOS,
        }
        const rectangles = await determineElementRectangles({
            browserInstance,
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
        const   base64Image = await browserInstance.takeElementScreenshot!((await element as WebdriverIO.Element).elementId)
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
            addressBarShadowPadding,
            browserInstance,
            devicePixelRatio,
            deviceRectangles,
            element,
            fallback: true,
            initialDevicePixelRatio,
            isEmulated,
            innerHeight,
            isAndroid,
            isAndroidChromeDriverScreenshot,
            isAndroidNativeWebScreenshot,
            isIOS,
            isLandscape,
            toolBarShadowPadding,
        })
    }
}
