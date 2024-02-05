import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import getDocumentScrollHeight from '../clientSideScripts/getDocumentScrollHeight.js'
import getAndroidStatusAddressToolBarOffsets from '../clientSideScripts/getAndroidStatusAddressToolBarOffsets.js'
import getIosStatusAddressToolBarOffsets from '../clientSideScripts/getIosStatusAddressToolBarOffsets.js'
import { ANDROID_OFFSETS, IOS_OFFSETS } from '../helpers/constants.js'
import { calculateDprData, getScreenshotSize, waitFor } from '../helpers/utils.js'
import type { Executor, TakeScreenShot } from './methods.interfaces'
import type {
    FullPageScreenshotOptions,
    FullPageScreenshotNativeMobileOptions,
    FullPageScreenshotDataOptions,
    FullPageScreenshotsData,
} from './screenshots.interfaces'
import type { StatusAddressToolBarOffsets } from '../clientSideScripts/statusAddressToolBarOffsets.interfaces'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import { LogLevel } from '../helpers/options.interfaces'

/**
 * Take a full page screenshots for desktop / iOS / Android
 */
export async function getBase64FullPageScreenshotsData(
    takeScreenshot: TakeScreenShot,
    executor: Executor,
    options: FullPageScreenshotDataOptions,
): Promise<FullPageScreenshotsData> {
    const {
        addressBarShadowPadding,
        devicePixelRatio,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isAndroidChromeDriverScreenshot,
        isHybridApp,
        isIOS,
        isLandscape,
        logLevel,
        screenHeight,
        screenWidth,
        toolBarShadowPadding,
    } = options
    const desktopOptions = {
        devicePixelRatio,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight,
        logLevel,
    }
    const nativeMobileOptions = {
        ...desktopOptions,
        addressBarShadowPadding,
        screenHeight,
        screenWidth,
        toolBarShadowPadding,
    }

    if (isAndroid && isAndroidNativeWebScreenshot) {
        // Create a fullpage screenshot for Android when native screenshot (so including status, address and toolbar) is created
        const {
            safeArea,
            screenHeight,
            screenWidth,
            sideBar: { width: sideBarWidth },
            statusAddressBar: { height: statusAddressBarHeight },
        } = <StatusAddressToolBarOffsets>(
            await executor(getAndroidStatusAddressToolBarOffsets, ANDROID_OFFSETS, { isHybridApp, isLandscape })
        )

        const androidNativeMobileOptions = {
            ...nativeMobileOptions,
            isLandscape,
            safeArea,
            screenHeight,
            screenWidth,
            sideBarWidth,
            statusAddressBarHeight,
        }

        return getFullPageScreenshotsDataNativeMobile(takeScreenshot, executor, androidNativeMobileOptions)
    } else if (isAndroid && isAndroidChromeDriverScreenshot) {
        const chromeDriverOptions = { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight, logLevel }

        // Create a fullpage screenshot for Android when the ChromeDriver provides the screenshots
        return getFullPageScreenshotsDataAndroidChromeDriver(takeScreenshot, executor, chromeDriverOptions)
    } else if (isIOS) {
        // Create a fullpage screenshot for iOS. iOS screenshots will hold the status, address and toolbar so they need to be removed
        const {
            safeArea,
            screenHeight,
            screenWidth,
            sideBar: { width: sideBarWidth },
            statusAddressBar: { height: statusAddressBarHeight },
            toolBar: { y: iosHomeBarY },
        } = <StatusAddressToolBarOffsets> await executor(getIosStatusAddressToolBarOffsets, IOS_OFFSETS, isLandscape)
        const iosNativeMobileOptions = {
            ...nativeMobileOptions,
            iosHomeBarY,
            isLandscape,
            safeArea,
            screenHeight,
            screenWidth,
            sideBarWidth,
            statusAddressBarHeight,
        }

        return getFullPageScreenshotsDataNativeMobile(takeScreenshot, executor, iosNativeMobileOptions)
    }

    // Create a fullpage screenshot for all desktops
    return getFullPageScreenshotsDataDesktop(takeScreenshot, executor, desktopOptions)
}

/**
 * Take a full page screenshots for native mobile
 */
export async function getFullPageScreenshotsDataNativeMobile(
    takeScreenshot: TakeScreenShot,
    executor: Executor,
    options: FullPageScreenshotNativeMobileOptions,
): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []

    // The addressBarShadowPadding and toolBarShadowPadding is used because the viewport has a shadow on the address and the tool bar
    // so the cutout of the viewport needs to be a little bit smaller
    const {
        addressBarShadowPadding,
        devicePixelRatio,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        innerHeight,
        iosHomeBarY,
        safeArea,
        isLandscape,
        logLevel,
        statusAddressBarHeight,
        screenHeight,
        sideBarWidth,
        toolBarShadowPadding,
    } = options
    const iosViewportHeight =
        innerHeight -
        addressBarShadowPadding -
        toolBarShadowPadding -
        // This is for iOS devices in landscape mode with a notch. They have a home bar at the bottom of the screen
        // which is not part of the bottom toolbar. This home bar is not part of the viewport and needs to be subtracted
        // 1133 is for iPads with a home bar, see the constants
        (iosHomeBarY && ((isLandscape && safeArea) || screenHeight >= 1133) ? screenHeight - iosHomeBarY : 0)

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSizeHeight: number | undefined
    let screenshotSizeWidth: number | undefined
    let isRotated = false

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = iosViewportHeight * i
        await executor(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await executor(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e, logLevel)
            }
        }

        // Take the screenshot and get the width
        const screenshot = await takeBase64Screenshot(takeScreenshot)
        screenshotSizeHeight = getScreenshotSize(screenshot, devicePixelRatio).height - sideBarWidth
        screenshotSizeWidth = getScreenshotSize(screenshot, devicePixelRatio).width - sideBarWidth
        isRotated = Boolean(isLandscape && screenshotSizeHeight > screenshotSizeWidth)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await executor(getDocumentScrollHeight)
        if (scrollHeight && (scrollY + iosViewportHeight < scrollHeight)) {
            amountOfScrollsArray.push(amountOfScrollsArray.length)
        }
        // There is no else

        // The height of the image of the last 1 could be different
        const imageHeight = amountOfScrollsArray.length === i && scrollHeight
            ? scrollHeight - scrollY
            : iosViewportHeight

        // The starting position for cropping could be different for the last image
        // The cropping always needs to start at status and address bar height and the address bar shadow padding
        const imageYPosition =
            (amountOfScrollsArray.length === i ? innerHeight - imageHeight : 0) + statusAddressBarHeight + addressBarShadowPadding

        // Store all the screenshot data in the screenshot object
        viewportScreenshots.push({
            ...calculateDprData(
                {
                    canvasWidth: isRotated ? screenshotSizeHeight : screenshotSizeWidth,
                    canvasYPosition: scrollY,
                    imageHeight: imageHeight,
                    imageWidth: isRotated ? screenshotSizeHeight : screenshotSizeWidth,
                    imageXPosition: sideBarWidth,
                    imageYPosition: imageYPosition,
                },
                devicePixelRatio,
            ),
            screenshot,
        })

        // Show scrollbars again
        await executor(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e, logLevel)
        }
    }

    if (!scrollHeight || !screenshotSizeHeight || !screenshotSizeWidth) {
        throw new Error('Couldn\'t determine scroll height or screenshot size')
    }

    return {
        ...calculateDprData(
            {
                fullPageHeight: scrollHeight - addressBarShadowPadding - toolBarShadowPadding,
                fullPageWidth: isRotated ? screenshotSizeHeight : screenshotSizeWidth,
            },
            devicePixelRatio,
        ),
        data: viewportScreenshots,
    }
}

/**
 * Take a full page screenshot for Android with Chromedriver
 */
export async function getFullPageScreenshotsDataAndroidChromeDriver(
    takeScreenshot: TakeScreenShot,
    executor: Executor,
    options: FullPageScreenshotOptions,
): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight, logLevel } = options

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = innerHeight * i
        await executor(scrollToPosition, scrollY)

        // Hide scrollbars before taking a screenshot, we don't want them, on the screenshot
        await executor(hideScrollBars, true)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e, logLevel)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot(takeScreenshot)
        screenshotSize = getScreenshotSize(screenshot, devicePixelRatio)

        // Determine scroll height and check if we need to scroll again
        scrollHeight = await executor(getDocumentScrollHeight)
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
        await executor(hideScrollBars, false)
    }

    // Put back the hidden elements to visible
    if (hideAfterFirstScroll.length > 0) {
        try {
            await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e, logLevel)
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
export async function getFullPageScreenshotsDataDesktop(
    takeScreenshot: TakeScreenShot,
    executor: Executor,
    options: FullPageScreenshotOptions,
): Promise<FullPageScreenshotsData> {
    const viewportScreenshots = []
    const { devicePixelRatio, fullPageScrollTimeout, hideAfterFirstScroll, innerHeight, logLevel } = options
    let actualInnerHeight = innerHeight

    // Start with an empty array, during the scroll it will be filled because a page could also have a lazy loading
    const amountOfScrollsArray = []
    let scrollHeight: number | undefined
    let screenshotSize

    for (let i = 0; i <= amountOfScrollsArray.length; i++) {
        // Determine and start scrolling
        const scrollY = actualInnerHeight * i
        await executor(scrollToPosition, scrollY)

        // Simply wait the amount of time specified for lazy-loading
        await waitFor(fullPageScrollTimeout)

        // Elements that need to be hidden after the first scroll for a fullpage scroll
        if (i === 1 && hideAfterFirstScroll.length > 0) {
            try {
                await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, true)
            } catch (e) {
                logHiddenRemovedError(e, logLevel)
            }
        }

        // Take the screenshot
        const screenshot = await takeBase64Screenshot(takeScreenshot)
        screenshotSize = getScreenshotSize(screenshot, devicePixelRatio)

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
        scrollHeight = await executor(getDocumentScrollHeight)

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
            await executor(hideRemoveElements, { hide: hideAfterFirstScroll, remove: [] }, false)
        } catch (e) {
            logHiddenRemovedError(e, logLevel)
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
export async function takeBase64Screenshot(takeScreenshot: TakeScreenShot): Promise<string> {
    return takeScreenshot()
}

/**
 * Log an error for not being able to hide remove elements
 *
 * @TODO: remove the any
 */
function logHiddenRemovedError(error: any, logLevel: LogLevel) {
    if (logLevel === LogLevel.debug || logLevel === LogLevel.warn) {
        console.log(
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
}
