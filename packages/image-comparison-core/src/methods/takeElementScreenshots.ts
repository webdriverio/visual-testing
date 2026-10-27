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
    function getFrameScale(frameEl: Element, fr: DOMRect, parentWin: Window): { scaleX: number, scaleY: number } {
        const htmlFrame = frameEl as HTMLElement
        let scaleX = 1
        let scaleY = 1
        let curEl: Element | null = frameEl

        while (curEl) {
            const cs = parentWin.getComputedStyle(curEl)
            const inlineTransform = (curEl as HTMLElement).style?.transform || ''
            const transform = (cs.transform && cs.transform !== 'none') ? cs.transform : inlineTransform

            if (transform && transform !== 'none') {
                const matrix3dMatch = transform.match(/matrix3d\(\s*([^)]+)\)/)
                const matrixMatch = !matrix3dMatch && transform.match(/matrix\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)/)
                if (matrix3dMatch) {
                    const vals = matrix3dMatch[1].split(',').map((v) => parseFloat(v.trim()))
                    if (vals.length >= 6) {
                        const sx = Math.hypot(vals[0], vals[1], vals[2])
                        const sy = Math.hypot(vals[4], vals[5], vals[6] || 0)
                        if (sx > 0) { scaleX *= sx }
                        if (sy > 0) { scaleY *= sy }
                    }
                } else if (matrixMatch) {
                    const sx = Math.hypot(parseFloat(matrixMatch[1]), parseFloat(matrixMatch[2]))
                    const sy = Math.hypot(parseFloat(matrixMatch[3]), parseFloat(matrixMatch[4]))
                    if (sx > 0) { scaleX *= sx }
                    if (sy > 0) { scaleY *= sy }
                } else {
                    const scaleMatch = transform.match(/scale\(\s*([+-]?\d*\.?\d+)(?:\s*,\s*([+-]?\d*\.?\d+))?\s*\)/)
                    if (scaleMatch) {
                        const sx = parseFloat(scaleMatch[1])
                        const sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx
                        if (sx > 0) { scaleX *= sx }
                        if (sy > 0) { scaleY *= sy }
                    } else {
                        const scaleXMatch = transform.match(/scaleX\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        const scaleYMatch = transform.match(/scaleY\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        if (scaleXMatch && parseFloat(scaleXMatch[1]) > 0) { scaleX *= parseFloat(scaleXMatch[1]) }
                        if (scaleYMatch && parseFloat(scaleYMatch[1]) > 0) { scaleY *= parseFloat(scaleYMatch[1]) }
                    }
                }
            }

            const inlineScale = (curEl as HTMLElement).style?.scale || ''
            const scaleProp = (cs.scale && cs.scale !== 'none') ? cs.scale : inlineScale
            if (scaleProp && scaleProp !== 'none') {
                const parts = scaleProp.trim().split(/\s+/)
                if (parts.length >= 1) {
                    const rawX = parts[0]
                    const rawY = parts.length >= 2 ? parts[1] : rawX
                    const sx = rawX.endsWith('%') ? parseFloat(rawX) / 100 : parseFloat(rawX)
                    const sy = rawY.endsWith('%') ? parseFloat(rawY) / 100 : parseFloat(rawY)
                    if (sx > 0) { scaleX *= sx }
                    if (sy > 0) { scaleY *= sy }
                }
            }

            const csZoom = (cs as unknown as { zoom?: string }).zoom || ''
            const inlineZoom = (curEl as HTMLElement).style?.zoom || ''
            const zoomProp = (csZoom && csZoom !== 'normal' && csZoom !== '1') ? csZoom : inlineZoom
            if (zoomProp && zoomProp !== 'normal' && zoomProp !== '1') {
                const z = zoomProp.endsWith('%') ? parseFloat(zoomProp) / 100 : parseFloat(zoomProp)
                if (z > 0) {
                    scaleX *= z
                    scaleY *= z
                }
            }

            curEl = curEl.parentElement
        }

        if (htmlFrame.offsetWidth > 0 && fr.width > 0 && Math.abs(fr.width - htmlFrame.offsetWidth * scaleX) > 0.5) {
            scaleX = fr.width / htmlFrame.offsetWidth
        }
        if (htmlFrame.offsetHeight > 0 && fr.height > 0 && Math.abs(fr.height - htmlFrame.offsetHeight * scaleY) > 0.5) {
            scaleY = fr.height / htmlFrame.offsetHeight
        }

        return { scaleX, scaleY }
    }

    const r = element.getBoundingClientRect()
    let x = r.left
    let y = r.top
    let width = r.width
    let height = r.height
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
        const { scaleX, scaleY } = getFrameScale(frameEl, fr, win.parent)
        const paddingLeft = parseFloat(style.paddingLeft) || 0
        const paddingTop = parseFloat(style.paddingTop) || 0
        x = fr.left + (frameEl.clientLeft + paddingLeft + x) * scaleX
        y = fr.top + (frameEl.clientTop + paddingTop + y) * scaleY
        width *= scaleX
        height *= scaleY
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

    return { x, y, width, height, framePath }
}

/**
 * Resolve the content-box offset and cumulative scale of a child frame path in the top-level document or viewport.
 */
export function getFrameOffsetInTopDocument(
    framePath: number[],
    origin: 'document' | 'viewport',
    allowSubframeContext: unknown = false,
): { x: number, y: number, scaleX?: number, scaleY?: number } | null {
    function getFrameScale(frameEl: Element, fr: DOMRect, parentWin: Window): { scaleX: number, scaleY: number } {
        const htmlFrame = frameEl as HTMLElement
        let scaleX = 1
        let scaleY = 1
        let curEl: Element | null = frameEl

        while (curEl) {
            const cs = parentWin.getComputedStyle(curEl)
            const inlineTransform = (curEl as HTMLElement).style?.transform || ''
            const transform = (cs.transform && cs.transform !== 'none') ? cs.transform : inlineTransform

            if (transform && transform !== 'none') {
                const matrix3dMatch = transform.match(/matrix3d\(\s*([^)]+)\)/)
                const matrixMatch = !matrix3dMatch && transform.match(/matrix\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)/)
                if (matrix3dMatch) {
                    const vals = matrix3dMatch[1].split(',').map((v) => parseFloat(v.trim()))
                    if (vals.length >= 6) {
                        const sx = Math.hypot(vals[0], vals[1], vals[2])
                        const sy = Math.hypot(vals[4], vals[5], vals[6] || 0)
                        if (sx > 0) { scaleX *= sx }
                        if (sy > 0) { scaleY *= sy }
                    }
                } else if (matrixMatch) {
                    const sx = Math.hypot(parseFloat(matrixMatch[1]), parseFloat(matrixMatch[2]))
                    const sy = Math.hypot(parseFloat(matrixMatch[3]), parseFloat(matrixMatch[4]))
                    if (sx > 0) { scaleX *= sx }
                    if (sy > 0) { scaleY *= sy }
                } else {
                    const scaleMatch = transform.match(/scale\(\s*([+-]?\d*\.?\d+)(?:\s*,\s*([+-]?\d*\.?\d+))?\s*\)/)
                    if (scaleMatch) {
                        const sx = parseFloat(scaleMatch[1])
                        const sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx
                        if (sx > 0) { scaleX *= sx }
                        if (sy > 0) { scaleY *= sy }
                    } else {
                        const scaleXMatch = transform.match(/scaleX\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        const scaleYMatch = transform.match(/scaleY\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        if (scaleXMatch && parseFloat(scaleXMatch[1]) > 0) { scaleX *= parseFloat(scaleXMatch[1]) }
                        if (scaleYMatch && parseFloat(scaleYMatch[1]) > 0) { scaleY *= parseFloat(scaleYMatch[1]) }
                    }
                }
            }

            const inlineScale = (curEl as HTMLElement).style?.scale || ''
            const scaleProp = (cs.scale && cs.scale !== 'none') ? cs.scale : inlineScale
            if (scaleProp && scaleProp !== 'none') {
                const parts = scaleProp.trim().split(/\s+/)
                if (parts.length >= 1) {
                    const rawX = parts[0]
                    const rawY = parts.length >= 2 ? parts[1] : rawX
                    const sx = rawX.endsWith('%') ? parseFloat(rawX) / 100 : parseFloat(rawX)
                    const sy = rawY.endsWith('%') ? parseFloat(rawY) / 100 : parseFloat(rawY)
                    if (sx > 0) { scaleX *= sx }
                    if (sy > 0) { scaleY *= sy }
                }
            }

            const csZoom = (cs as unknown as { zoom?: string }).zoom || ''
            const inlineZoom = (curEl as HTMLElement).style?.zoom || ''
            const zoomProp = (csZoom && csZoom !== 'normal' && csZoom !== '1') ? csZoom : inlineZoom
            if (zoomProp && zoomProp !== 'normal' && zoomProp !== '1') {
                const z = zoomProp.endsWith('%') ? parseFloat(zoomProp) / 100 : parseFloat(zoomProp)
                if (z > 0) {
                    scaleX *= z
                    scaleY *= z
                }
            }

            curEl = curEl.parentElement
        }

        if (htmlFrame.offsetWidth > 0 && fr.width > 0 && Math.abs(fr.width - htmlFrame.offsetWidth * scaleX) > 0.5) {
            scaleX = fr.width / htmlFrame.offsetWidth
        }
        if (htmlFrame.offsetHeight > 0 && fr.height > 0 && Math.abs(fr.height - htmlFrame.offsetHeight * scaleY) > 0.5) {
            scaleY = fr.height / htmlFrame.offsetHeight
        }

        return { scaleX, scaleY }
    }

    if (typeof window === 'undefined' || (allowSubframeContext !== true && window !== window.top)) {
        return null
    }
    let x = 0
    let y = 0
    let scaleX = 1
    let scaleY = 1
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
        const { scaleX: stepScaleX, scaleY: stepScaleY } = getFrameScale(frameEl, fr, win)
        const paddingLeft = parseFloat(style.paddingLeft) || 0
        const paddingTop = parseFloat(style.paddingTop) || 0
        x += (fr.left + (frameEl.clientLeft + paddingLeft) * stepScaleX) * scaleX
        y += (fr.top + (frameEl.clientTop + paddingTop) * stepScaleY) * scaleY
        scaleX *= stepScaleX
        scaleY *= stepScaleY
        win = targetWin
    }

    return origin === 'document'
        ? { x: x + window.scrollX, y: y + window.scrollY, scaleX, scaleY }
        : { x, y, scaleX, scaleY }
}

function parseBiDiFrameOffsetResult(
    evalResult: unknown,
): { x: number, y: number, scaleX?: number, scaleY?: number } | null {
    if (!evalResult || typeof evalResult !== 'object') {
        return null
    }
    const candidate = (evalResult as { result?: unknown }).result ?? evalResult
    if (!candidate || typeof candidate !== 'object') {
        return null
    }
    if ('x' in candidate && 'y' in candidate && typeof (candidate as { x: unknown }).x === 'number') {
        return candidate as { x: number, y: number, scaleX?: number, scaleY?: number }
    }
    const pairs = (candidate as { value?: unknown }).value
    if (!Array.isArray(pairs)) {
        return null
    }
    const parsed: Record<string, number> = {}
    for (const entry of pairs) {
        if (Array.isArray(entry) && typeof entry[0] === 'string' && entry[1] && typeof entry[1] === 'object') {
            const val = (entry[1] as { value?: unknown }).value
            if (typeof val === 'number') {
                parsed[entry[0]] = val
            }
        }
    }
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return {
            x: parsed.x,
            y: parsed.y,
            ...(typeof parsed.scaleX === 'number' ? { scaleX: parsed.scaleX } : {}),
            ...(typeof parsed.scaleY === 'number' ? { scaleY: parsed.scaleY } : {}),
        }
    }
    return null
}

type BiDiContextTreeNode = {
    context?: string
    children?: BiDiContextTreeNode[] | null
}

export async function resolveCrossOriginFrameOffset(
    browserInstance: WebdriverIO.Browser | undefined,
    framePath: number[],
    origin: 'document' | 'viewport',
): Promise<{ x: number, y: number, scaleX?: number, scaleY?: number } | null> {
    if (framePath.length === 0) {
        return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
    }
    if (!browserInstance) {
        return null
    }
    if (typeof browserInstance.execute === 'function') {
        const directOffset = await browserInstance.execute<
            { x: number, y: number, scaleX?: number, scaleY?: number } | null,
            [number[], 'document' | 'viewport']
        >(getFrameOffsetInTopDocument, framePath, origin)
        if (directOffset) {
            return directOffset
        }
    }
    if (
        typeof browserInstance.getWindowHandle === 'function' &&
        typeof browserInstance.scriptCallFunction === 'function'
    ) {
        try {
            const topContext = await browserInstance.getWindowHandle()
            if (framePath.length > 1 && typeof browserInstance.browsingContextGetTree === 'function') {
                const tree = await browserInstance.browsingContextGetTree({ root: topContext }) as { contexts?: BiDiContextTreeNode[] }
                let currentContext: string | undefined = topContext
                let currentChildren: BiDiContextTreeNode[] | null | undefined = tree?.contexts?.[0]?.children
                let totalX = 0
                let totalY = 0
                let totalScaleX = 1
                let totalScaleY = 1
                let resolvedAllSteps = true

                for (let step = 0; step < framePath.length; step++) {
                    const frameIndex = framePath[step]
                    if (!currentContext) {
                        resolvedAllSteps = false
                        break
                    }
                    const stepEval = await browserInstance.scriptCallFunction({
                        functionDeclaration: getFrameOffsetInTopDocument.toString(),
                        target: { context: currentContext },
                        arguments: [
                            { type: 'array', value: [{ type: 'number', value: frameIndex }] },
                            { type: 'string', value: step === 0 ? origin : 'viewport' },
                            { type: 'boolean', value: true },
                        ],
                        awaitPromise: false,
                    })
                    const stepOffset = parseBiDiFrameOffsetResult(stepEval)
                    if (!stepOffset) {
                        resolvedAllSteps = false
                        break
                    }
                    totalX += stepOffset.x * totalScaleX
                    totalY += stepOffset.y * totalScaleY
                    totalScaleX *= stepOffset.scaleX ?? 1
                    totalScaleY *= stepOffset.scaleY ?? 1
                    const nextNode = currentChildren?.[frameIndex]
                    currentContext = nextNode?.context
                    currentChildren = nextNode?.children
                }

                if (resolvedAllSteps) {
                    return { x: totalX, y: totalY, scaleX: totalScaleX, scaleY: totalScaleY }
                }
            }

            const evalResult = await browserInstance.scriptCallFunction({
                functionDeclaration: getFrameOffsetInTopDocument.toString(),
                target: { context: topContext },
                arguments: [
                    {
                        type: 'array',
                        value: framePath.map((idx) => ({ type: 'number', value: idx })),
                    },
                    { type: 'string', value: origin },
                    { type: 'boolean', value: true },
                ],
                awaitPromise: false,
            })
            return parseBiDiFrameOffsetResult(evalResult)
        } catch {
            // Ignore BiDi evaluation fallback errors
        }
    }
    return null
}

export async function resolveCrossOriginElementRect(
    browserInstance: WebdriverIO.Browser | undefined,
    element: WebdriverIO.Element,
    origin: 'document' | 'viewport',
): Promise<{ x: number, y: number, width: number, height: number } | null> {
    if (typeof element.execute !== 'function') {
        return null
    }
    const crossOriginRect = await element.execute(getElementRectInCrossOriginFrame)
    if (!crossOriginRect) {
        return null
    }
    const frameOffset = await resolveCrossOriginFrameOffset(browserInstance, crossOriginRect.framePath, origin)
    if (frameOffset) {
        const sx = frameOffset.scaleX ?? 1
        const sy = frameOffset.scaleY ?? 1
        return {
            x: frameOffset.x + crossOriginRect.x * sx,
            y: frameOffset.y + crossOriginRect.y * sy,
            width: crossOriginRect.width * sx,
            height: crossOriginRect.height * sy,
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
    return null
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

        const crossOriginResolved = await resolveCrossOriginElementRect(browserInstance, element, origin)
        if (crossOriginResolved) {
            return crossOriginResolved
        }

        if (origin === 'viewport') {
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
