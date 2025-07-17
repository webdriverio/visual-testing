import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { processDiffPixels } from './processDiffPixels.js'
import type { Pixel } from './images.interfaces.js'
import logger from '@wdio/logger'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('processDiffPixels', () => {
    let logInfoSpy: ReturnType<typeof vi.spyOn>
    let logErrorSpy: ReturnType<typeof vi.spyOn>

    const createMockPixels = (count: number, startX = 0, startY = 0): Pixel[] => {
        const pixels: Pixel[] = []
        for (let i = 0; i < count; i++) {
            pixels.push({
                x: startX + (i % 10),
                y: startY + Math.floor(i / 10),
            })
        }
        return pixels
    }

    const createMockPixelsInBox = (box: { left: number; top: number; right: number; bottom: number }): Pixel[] => {
        const pixels: Pixel[] = []
        for (let x = box.left; x <= box.right; x++) {
            for (let y = box.top; y <= box.bottom; y++) {
                pixels.push({ x, y })
            }
        }
        return pixels
    }

    const normalizeTimingValues = (calls: any[]) => {
        return calls.map(call => {
            const message = call[0]

            return [
                message
                    .replace(/Union time: \d+ms/, 'Union time: XXXms')
                    .replace(/Grouping time: \d+ms/, 'Grouping time: XXXms')
                    .replace(/Total analysis time: \d+ms/, 'Total analysis time: XXXms')
                    .replace(/Post-processing time: \d+ms/, 'Post-processing time: XXXms')
            ]
        })
    }

    beforeEach(() => {
        logInfoSpy = vi.spyOn(log, 'info').mockImplementation(() => {})
        logErrorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        logInfoSpy.mockRestore()
        logErrorSpy.mockRestore()
    })

    it('should handle empty pixel array', () => {
        const result = processDiffPixels([], 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should process a single pixel', () => {
        const pixels = createMockPixels(1)
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should merge nearby pixels into a single bounding box', () => {
        const pixels = createMockPixels(4, 0, 0) // Creates a 2x2 square
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should create separate bounding boxes for distant pixels', () => {
        const pixels = [
            ...createMockPixels(4, 0, 0), // First 2x2 square
            ...createMockPixels(4, 20, 20), // Second 2x2 square far away
        ]
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should handle a large number of pixels', () => {
        const pixels = createMockPixels(1000)
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should respect proximity parameter when merging boxes', () => {
        const pixels = [
            ...createMockPixels(4, 0, 0), // First 2x2 square
            ...createMockPixels(4, 6, 6), // Second 2x2 square just outside proximity
        ]
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should handle pixels in a complex pattern', () => {
        const pixels = [
            ...createMockPixelsInBox({ left: 0, top: 0, right: 5, bottom: 5 }), // Square
            ...createMockPixelsInBox({ left: 10, top: 10, right: 15, bottom: 15 }), // Another square
            ...createMockPixelsInBox({ left: 20, top: 20, right: 25, bottom: 25 }), // Third square
        ]
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })

    it('should handle maximum diff percentage threshold', () => {
        const pixels = createMockPixels(1000000)
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(logErrorSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle maximum diff pixels threshold', () => {
        const pixels = createMockPixels(6000000)
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(logErrorSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle two adjacent pixels to trigger equal rank union', () => {
        const pixels = [
            { x: 0, y: 0 },
            { x: 1, y: 0 }
        ]
        const result = processDiffPixels(pixels, 5)
        expect(result).toMatchSnapshot()
        expect(normalizeTimingValues(logInfoSpy.mock.calls)).toMatchSnapshot()
    })
})
