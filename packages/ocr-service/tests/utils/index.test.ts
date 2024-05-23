import { mkdirSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { adjustElementBbox, createOcrDir, determineClickPoint, getDprPositions, getScreenshotSize, isRectanglesObject } from '../../src/utils/index.js'
import type { RectReturn } from '../../src/types.js'

vi.mock('node:fs', () => ({
    mkdirSync: vi.fn(),
}))

function createMockScreenshot(width: number, height: number): string {
    const buffer = Buffer.alloc(24)
    buffer.writeUInt32BE(width, 16)
    buffer.writeUInt32BE(height, 20)

    return buffer.toString('base64')
}

describe('getScreenshotSize', () => {
    it('should correctly extract dimensions from a valid screenshot', () => {
        const width = 800
        const height = 600
        const base64 = createMockScreenshot(width, height)
        const result = getScreenshotSize(base64)

        expect(result).toEqual({ width: width, height: height })
    })

    it('should handle invalid base64 strings gracefully', () => {
        const invalidBase64 = 'not-a-real-base64-string'
        const action = () => getScreenshotSize(invalidBase64)

        expect(action).toThrowError()
    })

    it('should handle unexpected data layout', () => {
        const malformedBase64 = Buffer.from([1, 2, 3, 4, 5]).toString('base64')
        const action = () => getScreenshotSize(malformedBase64)

        expect(action).toThrowError()
    })
})

describe('getDprPositions', () => {
    it('should divide each rectangle dimension by the given DPR', () => {
        const rectangles = { left: 100, top: 200, right: 300, bottom: 400 }
        const dpr = 2
        const expected = { left: 50, top: 100, right: 150, bottom: 200 }

        const result = getDprPositions(rectangles, dpr)
        expect(result).toEqual(expected)
    })
})

describe('determineClickPoint', () => {
    it('should calculate the center point of the rectangle', () => {
        const options = { rectangles: { left: 10, right: 30, top: 10, bottom: 30 } }
        const expected = { x: 20, y: 20 }

        const result = determineClickPoint(options)
        expect(result).toEqual(expected)
    })
})

describe('adjustElementBbox', () => {
    it('should adjust the bounding box by the element rectangle', () => {
        const bbox = { left: 100, right: 200, top: 100, bottom: 200 }
        const elementRect = { x: 10, y: 20, width: 10, height: 20 }

        const result = adjustElementBbox(bbox, elementRect)
        expect(result).toEqual({ left: 110, right: 210, top: 120, bottom: 220 })
    })
})

describe('createOcrDir', () => {
    it('should create and return the OCR directory path', () => {
        const imagesPath = '/custom/path'
        const expected = `${imagesPath}/ocr`

        const result = createOcrDir(imagesPath)
        expect(result).toBe(expected)
        expect(mkdirSync).toHaveBeenCalledWith(expected, { recursive: true })
    })

    it('should handle edge cases in path definitions', () => {
        const imagesPath = '/custom//////////path///////'
        const expected = '/custom/path/ocr'

        const result = createOcrDir(imagesPath)
        expect(result).toBe(expected)
        expect(mkdirSync).toHaveBeenCalledWith(expected, { recursive: true })
    })
})

describe('isRectanglesObject', () => {
    it('should return true for a valid rectangle object', () => {
        const rect = { x: 0, y: 10, width: 100, height: 100 }

        const result = isRectanglesObject(rect)
        expect(result).toBe(true)
    })

    it('should return false for an invalid rectangle object', () => {
        const rect = { x: '0', y: 10, width: 100, height: 100 } as unknown as RectReturn

        const result = isRectanglesObject(rect)
        expect(result).toBe(false)
    })
})
