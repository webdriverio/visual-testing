import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import type { ChainablePromiseElement } from 'webdriverio'
import type {
    ClickPoint,
    DetermineClickPointOptions,
    PageSegmentationMode,
    PageSegmentationModeOptions,
    Rectangles,
    RectReturn,
    ScreenshotSize,
} from '../types.js'
import { PAGE_SEGMENTATION_MODES } from './constants.js'

export function getBase64ScreenshotSize(screenshot: string): ScreenshotSize {
    return {
        height: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(20)),
        width: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(16)),
    }
}

export function getDprPositions(values: Rectangles, dpr: number): Rectangles {
    Object.keys({ ...values }).map((value: string) => {
    // @ts-ignore
        values[value] /= dpr
    })

    return values
}

/**
 * Determine the click point
 */
export function determineClickPoint(options: DetermineClickPointOptions): ClickPoint {
    const { rectangles: { left, right, top, bottom } } = options
    const x = Math.round( left + (right - left) / 2 )
    const y = Math.round( top + (bottom - top) / 2 )

    return { x, y }
}

/**
 * Adjust the Element Bbox
 */
export function adjustElementBbox(bbox: Rectangles, elementRect: RectReturn): Rectangles {
    return {
        left: Math.round(bbox.left + elementRect.x),
        top: Math.round(bbox.top + elementRect.y),
        right: Math.round(bbox.right + elementRect.x),
        bottom: Math.round(bbox.bottom + elementRect.y),
    }
}

export function createOcrDir(imagesPath: string): string {
    const ocrDir =  join(imagesPath, 'ocr')
    mkdirSync(ocrDir, { recursive: true })

    return ocrDir
}

export function isRectanglesObject(obj: WebdriverIO.Element | ChainablePromiseElement | RectReturn): boolean {
    const properties = ['x', 'y', 'width', 'height']

    return obj !== null &&
           typeof obj === 'object' &&
           properties.every(prop => typeof (obj as any)[prop] === 'number' && !isNaN((obj as any)[prop]) && (obj as any)[prop] >= 0)
}

/**
 * Tells a multiremote browser apart from a single browser
 */
export function isMultiRemoteBrowser(
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
): browser is WebdriverIO.MultiRemoteBrowser {
    return browser.isMultiRemote === true
}

export function isPageSegmentationMode(pageSegmentationMode: unknown): pageSegmentationMode is PageSegmentationMode {
    return PAGE_SEGMENTATION_MODES.some((mode) => mode === pageSegmentationMode)
}

/**
 * Get the page segmentation mode from the `pageSegmentationMode` option or its alias `psm`, or the default when
 * neither is set. Only the supported numbers are allowed, because the system Tesseract gets the value in a shell command.
 */
export function getPageSegmentationMode(
    options: PageSegmentationModeOptions | undefined,
    defaultPageSegmentationMode: PageSegmentationMode,
): PageSegmentationMode {
    const { pageSegmentationMode, psm } = options ?? {}

    if (pageSegmentationMode !== undefined && psm !== undefined && pageSegmentationMode !== psm) {
        throw new Error(
            `The "pageSegmentationMode" option (${String(pageSegmentationMode)}) and its alias "psm" (${String(psm)}) `
            + 'have different values, use only one of them.'
        )
    }

    // Not `??`: a `null` must fail the check below, not fall back to the alias or the default
    const value: unknown = pageSegmentationMode !== undefined ? pageSegmentationMode : psm

    if (value === undefined) {
        return defaultPageSegmentationMode
    }

    if (!isPageSegmentationMode(value)) {
        throw new Error(
            `The "pageSegmentationMode" option (alias "psm") must be one of ${PAGE_SEGMENTATION_MODES.join(', ')}, `
            + `but it is "${String(value)}".`
        )
    }

    return value
}
