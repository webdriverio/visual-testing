import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from '../methods/screenshots.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView.js'
import { canUseBidiScreenshot, getBase64ScreenshotSize, getMethodOrWicOption, waitFor } from '../helpers/utils.js'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import type { BidiScreenshot, GetWindowHandle } from '../methods/methods.interfaces.js'

/**
 * Saves an image of an element
 */
export default async function saveWebElement(
    {
        methods,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addressBarShadowPadding, autoElementScroll, formatImageName, savePerInstance, toolBarShadowPadding } =
        saveElementOptions.wic
    const { executor, screenShot, takeElementScreenshot } = methods
    // 1b. Set the method options to the right values
    const disableBlinkingCursor = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'disableBlinkingCursor')
    const disableCSSAnimation = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'disableCSSAnimation')
    const enableLayoutTesting = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'enableLayoutTesting')
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'enableLegacyScreenshotMethod')
    const hideElements: HTMLElement[] = saveElementOptions.method.hideElements || []
    const hideScrollBars = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'hideScrollBars')
    const removeElements: HTMLElement[] = saveElementOptions.method.removeElements || []
    const resizeDimensions: ResizeDimensions | number = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const waitForFontsLoaded = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'waitForFontsLoaded')

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
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(executor, beforeOptions, true)
    const {
        browserName,
        browserVersion,
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                isEmulated,
                isLandscape,
                outerHeight,
                outerWidth,
                screenHeight,
                screenWidth,
            },
        },
        initialDevicePixelRatio,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
        isTestInBrowser,
        logName,
        name,
        platformName,
        platformVersion,
    } = enrichedInstanceData

    let base64Image: string

    if (canUseBidiScreenshot(methods) && !isMobile && !enableLegacyScreenshotMethod) {
        // 3a. Take the screenshot with the BiDi method
        // We also need to clip the image to the element size, taking into account the DPR
        // and also clipt if from the document, not the viewport
        const rect = await methods.getElementRect!((await element as WebdriverIO.Element).elementId)
        const clip = { x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.floor(rect.width), height: Math.floor(rect.height) }
        const { bidiScreenshot, getWindowHandle } = methods as { bidiScreenshot: BidiScreenshot; getWindowHandle: GetWindowHandle }
        const takeBiDiElementScreenshot = (origin: 'document' | 'viewport') =>
            takeBase64BiDiScreenshot({ bidiScreenshot, getWindowHandle, origin, clip })

        try {
            // By default we take the screenshot from the document
            base64Image = await takeBiDiElementScreenshot('viewport')
        } catch (err: any) {
            // But when we get a zero dimension error (meaning the element might be bigger than the
            // viewport or it might not be in the viewport), we need to take the screenshot from the document.
            const isZeroDimensionError = typeof err?.message === 'string' && err.message.includes(
                'WebDriver Bidi command "browsingContext.captureScreenshot" failed with error: unable to capture screen - Unable to capture screenshot with zero dimensions'
            )

            if (!isZeroDimensionError) {
                throw err
            }

            base64Image = await takeBiDiElementScreenshot('document')
        }
    } else {
        // Scroll the element into top of the viewport and return the current scroll position
        let currentPosition: number | undefined
        if (autoElementScroll) {
            currentPosition = await executor(scrollElementIntoView, element, addressBarShadowPadding)
            // We need to wait for the scroll to finish before taking the screenshot
            await waitFor(100)
        }

        // 3.  Take the screenshot and determine the rectangles
        const screenshotResult = await takeWebElementScreenshot({
            devicePixelRatio,
            deviceRectangles: instanceData.deviceRectangles,
            element,
            executor,
            initialDevicePixelRatio,
            isEmulated,
            innerHeight,
            isAndroidNativeWebScreenshot,
            isAndroid,
            isIOS,
            isLandscape,
            // When the element needs to be resized, we need to take a screenshot of the whole page
            // also when it's emulated
            fallback: (!!saveElementOptions.method.resizeDimensions || isEmulated) || false,
            screenShot,
            takeElementScreenshot,
        })
        base64Image = screenshotResult.base64Image
        const { rectangles, isWebDriverElementScreenshot } = screenshotResult

        // When the screenshot has been taken and the element position has been determined,
        // we can scroll back to the original position
        // We don't need to wait for the scroll here because we don't take a screenshot after this
        if (autoElementScroll && currentPosition) {
            await executor(scrollToPosition, currentPosition)
        }

        // When the element has no height or width, we default to the viewport screen size
        if (rectangles.width === 0 || rectangles.height === 0) {
            const { height, width } = getBase64ScreenshotSize(base64Image)
            rectangles.width = width
            rectangles.height = height
            rectangles.x = 0
            rectangles.y = 0
            console.error(`\x1b[31m\nThe element has no width or height. We defaulted to the viewport screen size of width: ${width} and height: ${height}.\x1b[0m\n`)
        }

        // 5.  Make a cropped base64 image with resizeDimensions
        // @TODO: we have isLandscape here
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners: false,
            base64Image,
            deviceName,
            devicePixelRatio: devicePixelRatio || NaN,
            isWebDriverElementScreenshot,
            isIOS,
            isLandscape,
            rectangles,
            resizeDimensions,
        })
    }

    // 6.  The after the screenshot methods
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
            savePerInstance: savePerInstance,
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
        isNativeContext: false,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 7.  Return the data
    return afterScreenshot(executor, afterOptions)
}
