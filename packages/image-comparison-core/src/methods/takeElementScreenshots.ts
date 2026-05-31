import logger from '@wdio/logger'
import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView.js'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'
import { getBase64ScreenshotSize, hasResizeDimensions, waitFor } from '../helpers/utils.js'
import type { ElementScreenshotDataOptions, ElementScreenshotData } from './screenshots.interfaces.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:takeElementScreenshot')

export async function takeElementScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: ElementScreenshotDataOptions,
    shouldUseBidi: boolean = false
): Promise<ElementScreenshotData> {
    if (shouldUseBidi) {
        return await takeBiDiElementScreenshot(browserInstance, options)
    }
    return await takeWebDriverElementScreenshot(browserInstance, options)
}

async function takeBiDiElementScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: ElementScreenshotDataOptions
): Promise<ElementScreenshotData> {
    // Fix #1129: scrollElementIntoView receives a promise
    const element = await (options.element as unknown as WebdriverIO.Element | Promise<WebdriverIO.Element>)

    if (options.biDiOrigin === 'viewport') {
        return takeBiDiElementScreenshotFromViewport(browserInstance, element, options)
    }

    // Default: origin: 'document' path.
    // Scroll the element into the viewport so any lazy‑load / intersection
    // observers are triggered. We always capture from the *document* origin,
    // so the clip coordinates are document‑relative and independent of scroll.
    let currentPosition: number | undefined
    if (options.autoElementScroll) {
        currentPosition = await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
        await waitFor(100)
    }

    // Get the element rect and clip the screenshot. WebDriver getElementRect
    // returns coordinates relative to the document origin, which matches the
    // BiDi `origin: 'document'` coordinate system.
    const rect = await browserInstance.getElementRect!(element.elementId)
    const clip = { x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.floor(rect.width), height: Math.floor(rect.height) }
    const base64Image = await takeBase64BiDiScreenshot({
        browserInstance,
        origin: 'document',
        clip,
    })

    if (options.autoElementScroll && currentPosition) {
        await browserInstance.execute(scrollToPosition, currentPosition)
    }

    return {
        base64Image,
        isWebDriverElementScreenshot: false,
    }
}

async function takeBiDiElementScreenshotFromViewport(
    browserInstance: WebdriverIO.Browser,
    element: WebdriverIO.Element,
    options: ElementScreenshotDataOptions
): Promise<ElementScreenshotData> {
    // Scroll element into view first so getElementRect reflects its viewport position.
    let currentPosition: number | undefined
    if (options.autoElementScroll) {
        currentPosition = await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
        await waitFor(100)
    }

    // getElementRect returns viewport-relative coordinates per W3C BiDi spec.
    const rect = await browserInstance.getElementRect!(element.elementId)
    const elX = Math.floor(rect.x)
    const elY = Math.floor(rect.y)
    const elW = Math.floor(rect.width)
    const elH = Math.floor(rect.height)
    const vpW = options.innerWidth ?? 0
    const vpH = options.innerHeight ?? 0

    // Case 1: element larger than viewport, can never be fully captured with 'viewport' origin.
    if (elW > vpW || elH > vpH) {
        throw new Error(
            `[BiDi viewport screenshot] The element dimensions (${elW}x${elH}px) exceed the viewport ` +
            `(${vpW}x${vpH}px). You must use the default \`biDiOrigin: 'document'\` for this element. ` +
            'Note: with `\'document\'` origin, composited layers such as scrollbars, fixed/sticky overlays, ' +
            'and elements using `will-change` may not appear in the screenshot.'
        )
    }

    // Case 2: element has no overlap with the viewport at all.
    const isOutsideViewport = elX + elW <= 0 || elX >= vpW || elY + elH <= 0 || elY >= vpH
    if (isOutsideViewport) {
        throw new Error(
            '[BiDi viewport screenshot] The element is not in the viewport ' +
            `(element: x=${elX}, y=${elY}, ${elW}x${elH}px; viewport: ${vpW}x${vpH}px). ` +
            'Call `element.scrollIntoView()` before taking the screenshot, or set `autoElementScroll: true`.'
        )
    }

    // Case 3: element is partially outside the viewport but fits, suggest scrolling it fully into view.
    const isPartiallyOutside = elX < 0 || elX + elW > vpW || elY < 0 || elY + elH > vpH
    if (isPartiallyOutside) {
        throw new Error(
            '[BiDi viewport screenshot] The element is not fully visible in the viewport ' +
            `(element: x=${elX}, y=${elY}, ${elW}x${elH}px; viewport: ${vpW}x${vpH}px). ` +
            'The element fits within the viewport, scroll it fully into view by calling ' +
            '`element.scrollIntoView()` or setting `autoElementScroll: true`.'
        )
    }

    const clip = { x: elX, y: elY, width: elW, height: elH }
    const base64Image = await takeBase64BiDiScreenshot({
        browserInstance,
        origin: 'viewport',
        clip,
    })

    if (options.autoElementScroll && currentPosition) {
        await browserInstance.execute(scrollToPosition, currentPosition)
    }

    return {
        base64Image,
        isWebDriverElementScreenshot: false,
    }
}

async function takeWebDriverElementScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: ElementScreenshotDataOptions
): Promise<ElementScreenshotData> {
    let base64Image: string
    let isWebDriverElementScreenshot = false

    // Fix #1129: scrollElementIntoView receives a promise
    // The element might be a promise, so we need to resolve it before using it as a browser.execute() argument
    // if we need to use it in browser.execute()
    const element = await (options.element as unknown as WebdriverIO.Element | Promise<WebdriverIO.Element>)

    // Scroll the element into top of the viewport and return the current scroll position
    let currentPosition: number | undefined
    if (options.autoElementScroll) {
        currentPosition = await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
        // We need to wait for the scroll to finish before taking the screenshot
        await waitFor(100)
    }

    // Take the screenshot and determine the rectangles
    const screenshotResult = await takeWebElementScreenshot({
        addressBarShadowPadding: options.addressBarShadowPadding,
        browserInstance,
        devicePixelRatio: options.devicePixelRatio,
        deviceRectangles: options.deviceRectangles,
        element,
        initialDevicePixelRatio: options.initialDevicePixelRatio,
        isEmulated: options.isEmulated,
        innerHeight: options.innerHeight,
        isAndroid: options.isAndroid,
        isAndroidChromeDriverScreenshot: options.isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot: options.isAndroidNativeWebScreenshot,
        isIOS: options.isIOS,
        isLandscape: options.isLandscape,
        toolBarShadowPadding: options.toolBarShadowPadding,
        // When the element needs to be resized, we need to take a screenshot of the whole page
        // also when it's emulated
        fallback: (hasResizeDimensions(options.resizeDimensions) || options.isEmulated) || false,
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

        log.error(`The element has no width or height. We defaulted to the viewport screen size of width: ${width} and height: ${height}.`)
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

    return {
        base64Image,
        isWebDriverElementScreenshot,
    }
}
