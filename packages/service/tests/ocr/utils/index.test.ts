import { mkdirSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { adjustElementBbox, createOcrDir, determineClickPoint, getDprPositions, isRectanglesObject } from '../../../src/ocr/utils/index.js'

vi.mock('node:fs', () => ({
    mkdirSync: vi.fn(),
}))

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
        const options = { ocr: { imagesPath: '/custom/path' } }
        const folders = { actualFolder: '/actual/folder', baselineFolder: 'base/folder', diffFolder: 'diff/folder' }
        const expected = '/custom/path'

        const result = createOcrDir(options, folders)
        expect(result).toBe(expected)
        expect(mkdirSync).toHaveBeenCalledWith(expected, { recursive: true })
    })

    it('should create and return the OCR directory path based on actualFolder when imagesPath is not specified', () => {
        const options = {}
        const folders = { actualFolder: '/actual/folder', baselineFolder: 'base/folder', diffFolder: 'diff/folder' }
        const expectedPath = '/actual/ocr'

        const result = createOcrDir(options, folders)
        expect(result).toBe(expectedPath)
        expect(mkdirSync).toHaveBeenCalledWith(expectedPath, { recursive: true })
    })

    it('should handle edge cases in path definitions', () => {
        const expected = '/custom/path'
        const options = { ocr: { imagesPath: expected } }
        const folders = { actualFolder: '/actual/folder///////', baselineFolder: 'base/folder', diffFolder: 'diff/folder' }

        const result = createOcrDir(options, folders)
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
        const rect = { x: '0', y: 10, width: 100, height: 100 }

        const result = isRectanglesObject(rect)
        expect(result).toBe(false)
    })
})
