import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import type { ChainablePromiseElement } from 'webdriverio'
import type { ClickPoint, DetermineClickPointOptions, Rectangles, RectReturn, ScreenshotSize } from '../types.js'

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
