import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView.js'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import { getBase64ScreenshotSize, waitFor } from '../helpers/utils.js'
import type { ElementScreenshotDataOptions } from './screenshots.interfaces.js'

/**
 * Interface representing data for element screenshot result.
 */
export interface ElementScreenshotData {
    /** The base64 encoded image. */
    base64Image: string;
    /** Whether this is a web driver element screenshot. */
    isWebDriverElementScreenshot?: boolean;
}

export async function takeElementScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: ElementScreenshotDataOptions,
    shouldUseBidi: boolean = false
): Promise<ElementScreenshotData> {
    let base64Image: string
    let isWebDriverElementScreenshot = false

    if (shouldUseBidi) {
        // Take the screenshot with the BiDi method
        // We also need to clip the image to the element size, taking into account the DPR
        // and also clip it from the document, not the viewport
        const rect = await browserInstance.getElementRect!((await options.element as WebdriverIO.Element).elementId)
        const clip = { x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.floor(rect.width), height: Math.floor(rect.height) }
        const takeBiDiElementScreenshot = (origin: 'document' | 'viewport') => takeBase64BiDiScreenshot({ browserInstance, origin, clip })

        try {
            // By default we take the screenshot from the viewport
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
        if (options.autoElementScroll) {
            currentPosition = await browserInstance.execute(scrollElementIntoView as any, options.element, options.addressBarShadowPadding)
            // We need to wait for the scroll to finish before taking the screenshot
            await waitFor(100)
        }

        // Take the screenshot and determine the rectangles
        const screenshotResult = await takeWebElementScreenshot({
            browserInstance,
            devicePixelRatio: options.devicePixelRatio,
            deviceRectangles: options.deviceRectangles,
            element: options.element,
            initialDevicePixelRatio: options.initialDevicePixelRatio,
            isEmulated: options.isEmulated,
            innerHeight: options.innerHeight,
            isAndroidNativeWebScreenshot: options.isAndroidNativeWebScreenshot,
            isAndroid: options.isAndroid,
            isIOS: options.isIOS,
            isLandscape: options.isLandscape,
            // When the element needs to be resized, we need to take a screenshot of the whole page
            // also when it's emulated
            fallback: (!!options.resizeDimensions || options.isEmulated) || false,
        })
        base64Image = screenshotResult.base64Image
        const { rectangles } = screenshotResult
        isWebDriverElementScreenshot = screenshotResult.isWebDriverElementScreenshot

        // When the screenshot has been taken and the element position has been determined,
        // we can scroll back to the original position
        // We don't need to wait for the scroll here because we don't take a screenshot after this
        if (options.autoElementScroll && currentPosition) {
            await browserInstance.execute(scrollToPosition, currentPosition)
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

        // Make a cropped base64 image with resizeDimensions
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners: false,
            base64Image,
            deviceName: options.deviceName,
            devicePixelRatio: options.devicePixelRatio || NaN,
            isWebDriverElementScreenshot,
            isIOS: options.isIOS,
            isLandscape: options.isLandscape,
            rectangles,
            resizeDimensions: options.resizeDimensions,
        })
    }

    return {
        base64Image,
        isWebDriverElementScreenshot,
    }
}
