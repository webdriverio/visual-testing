import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'
import type { Folders } from 'webdriver-image-comparison'
import type { ClickPoint, DetermineClickPointOptions, OcrOptions, Rectangles, RectReturn } from '../types.js'

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

export function createOcrDir(options: OcrOptions, folders: Folders): string {
    const ocrDir = options.ocr?.imagesPath || join(dirname(folders.actualFolder), 'ocr')
    mkdirSync(ocrDir, { recursive: true })

    return ocrDir
}

export function isRectanglesObject(obj: WebdriverIO.Element | ChainablePromiseElement | RectReturn): boolean {
    const properties = ['x', 'y', 'width', 'height']

    return obj !== null &&
           typeof obj === 'object' &&
           properties.every(prop => typeof (obj as any)[prop] === 'number' && !isNaN((obj as any)[prop]) && (obj as any)[prop] >= 0)
}
