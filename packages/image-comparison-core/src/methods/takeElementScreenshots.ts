import logger from '@wdio/logger'
import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView.js'
import getElementRectInTopDocument from '../clientSideScripts/getElementRectInTopDocument.js'
import getElementViewportRect from '../clientSideScripts/getElementViewportRect.js'
import { getBase64ScreenshotSize, hasResizeDimensions, waitFor } from '../helpers/utils.js'
import type { ElementScreenshotDataOptions, ElementScreenshotData } from './screenshots.interfaces.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:takeElementScreenshot')

type CrossOriginFrameElementRect = {
    x: number
    y: number
    width: number
    height: number
    framePath: number[]
}

/**
 * When an ancestor frame is cross-origin (`window.frameElement` is `null`), compute the element's
 * viewport-relative rect up to the cross-origin boundary (excluding the frame's own scroll) and
 * record the `WindowProxy` frame index path from `window.top` down to that boundary.
 */
export function getElementRectInCrossOriginFrame(element: Element): CrossOriginFrameElementRect | null {
    const r = element.getBoundingClientRect()
    let x = r.left
    let y = r.top
    let win: Window | null = element.ownerDocument?.defaultView ?? window
    while (win && win !== win.top) {
        let frameEl: Element | null = null
        try {
            frameEl = win.frameElement
        } catch {
            break
        }
        if (!frameEl || !win.parent) {
            break
        }
        const fr = frameEl.getBoundingClientRect()
        const style = win.parent.getComputedStyle(frameEl)
        x += fr.left + frameEl.clientLeft + (parseFloat(style.paddingLeft) || 0)
        y += fr.top + frameEl.clientTop + (parseFloat(style.paddingTop) || 0)
        win = win.parent
    }

    const framePath: number[] = []
    let cur: Window | null = win
    while (cur && cur !== cur.top) {
        let parentWin: Window | null = null
        try {
            parentWin = cur.parent
        } catch {
            break
        }
        if (!parentWin || parentWin === cur) {
            break
        }
        let index = -1
        try {
            for (let i = 0; i < parentWin.frames.length; i++) {
                if (parentWin.frames[i] === cur) {
                    index = i
                    break
                }
            }
        } catch {
            break
        }
        if (index === -1) {
            break
        }
        framePath.unshift(index)
        cur = parentWin
    }

    return { x, y, width: r.width, height: r.height, framePath }
}

/**
 * Resolve the content-box offset of a child frame path in the top-level document or viewport.
 */
export function getFrameOffsetInTopDocument(
    framePath: number[],
    origin: 'document' | 'viewport',
): { x: number, y: number } | null {
    if (typeof window === 'undefined' || window !== window.top) {
        return null
    }
    let x = 0
    let y = 0
    let win: Window = window
    for (let step = 0; step < framePath.length; step++) {
        const frameIndex = framePath[step]
        let targetWin: Window | undefined
        try {
            targetWin = win.frames[frameIndex]
        } catch {
            return null
        }
        if (!targetWin) {
            return null
        }
        let frameEl: Element | null = null
        try {
            const frames = win.document.querySelectorAll('iframe, frame')
            for (let i = 0; i < frames.length; i++) {
                if ((frames[i] as HTMLIFrameElement).contentWindow === targetWin) {
                    frameEl = frames[i]
                    break
                }
            }
        } catch {
            return null
        }
        if (!frameEl) {
            return null
        }
        const fr = frameEl.getBoundingClientRect()
        const style = win.getComputedStyle(frameEl)
        x += fr.left + frameEl.clientLeft + (parseFloat(style.paddingLeft) || 0)
        y += fr.top + frameEl.clientTop + (parseFloat(style.paddingTop) || 0)
        win = targetWin
    }

    return origin === 'document'
        ? { x: x + window.scrollX, y: y + window.scrollY }
        : { x, y }
}

async function resolveElementRectInTopDocument(
    browserInstance: WebdriverIO.Browser,
    element: WebdriverIO.Element,
    origin: 'document' | 'viewport',
): Promise<{ x: number, y: number, width: number, height: number }> {
    if (typeof element.execute === 'function') {
        const directRect = await element.execute(getElementRectInTopDocument, origin)
        if (directRect) {
            return directRect
        }

        const crossOriginRect = await element.execute(getElementRectInCrossOriginFrame)
        if (crossOriginRect) {
            const frameOffset = crossOriginRect.framePath.length > 0
                ? await browserInstance.execute(getFrameOffsetInTopDocument, crossOriginRect.framePath, origin)
                : { x: 0, y: 0 }
            if (frameOffset) {
                return {
                    x: crossOriginRect.x + frameOffset.x,
                    y: crossOriginRect.y + frameOffset.y,
                    width: crossOriginRect.width,
                    height: crossOriginRect.height,
                }
            }
            if (origin === 'viewport') {
                return {
                    x: crossOriginRect.x,
                    y: crossOriginRect.y,
                    width: crossOriginRect.width,
                    height: crossOriginRect.height,
                }
            }
        } else if (origin === 'viewport') {
            const viewportRect = await element.execute(getElementViewportRect)
            if (viewportRect) {
                return viewportRect
            }
        }
    }

    return browserInstance.getElementRect!(element.elementId)
}

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
    if (options.autoElementScroll) {
        await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
        await waitFor(100)
    }

    // Get the element rect in the top-level document and clip the screenshot.
    // `element.execute()` runs in the element's own document (also inside a frame
    // reached with v9 `switchFrame()` or v10 `context.frame()`) and adds the
    // content-box offset of each parent iframe.
    const rect = await resolveElementRectInTopDocument(browserInstance, element, 'document')
    const clip = { x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.floor(rect.width), height: Math.floor(rect.height) }
    const base64Image = await takeBase64BiDiScreenshot({
        browserInstance,
        origin: 'document',
        clip,
    })

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
    // Scroll the element into view first, so it can be in the viewport.
    if (options.autoElementScroll) {
        await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
        await waitFor(100)
    }

    // The clip of a `viewport` screenshot is relative to the top-level viewport, so use the position of the element
    // in the top-level viewport.
    const rect = await resolveElementRectInTopDocument(browserInstance, element, 'viewport')
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
    if (options.autoElementScroll) {
        await browserInstance.execute(scrollElementIntoView as any, element, options.addressBarShadowPadding)
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
