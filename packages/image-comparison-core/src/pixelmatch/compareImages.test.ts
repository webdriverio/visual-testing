import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('pixelmatch', () => ({
    default: vi.fn()
}))

vi.mock('../utils/imageUtils.js', () => {
    const makeImage = (width = 100, height = 100) => ({
        data: new Uint8Array(width * height * 4).fill(128),
        width,
        height,
    })

    return {
        decodeImage:    vi.fn().mockImplementation(() => makeImage()),
        resizeBilinear: vi.fn().mockImplementation((_img: unknown, w: number, h: number) => makeImage(w, h)),
        encodeImage:    vi.fn().mockReturnValue(Buffer.from('png-data')),
    }
})

import compareImages from './compareImages.js'
import pixelmatch from 'pixelmatch'
import * as imageUtils from '../utils/imageUtils.js'

const pixelmatchFn = vi.mocked(pixelmatch)
const decodeImageFn = vi.mocked(imageUtils.decodeImage)
const resizeBilinearFn = vi.mocked(imageUtils.resizeBilinear)

describe('pixelmatch adapter - compareImages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        decodeImageFn.mockReturnValue({ data: new Uint8Array(100 * 100 * 4).fill(128), width: 100, height: 100 })
    })

    describe('basic comparison', () => {
        it('returns zero mismatch percentage when images are identical', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.rawMisMatchPercentage).toBe(0)
            expect(result.misMatchPercentage).toBe(0)
            expect(result.diffPixels).toHaveLength(0)
        })

        it('returns correct mismatch percentage for a known diff count', async () => {
            // 100x100 = 10000 total pixels, 100 diff pixels = 1%
            pixelmatchFn.mockImplementation(() => 100)

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.rawMisMatchPercentage).toBeCloseTo(1, 5)
            expect(result.misMatchPercentage).toBe(1)
        })

        it('returns analysisTime greater than or equal to 0', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.analysisTime).toBeGreaterThanOrEqual(0)
        })

        it('resolves getBuffer to a Buffer', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})
            const buf = await result.getBuffer()

            expect(Buffer.isBuffer(buf)).toBe(true)
        })
    })

    describe('diffPixels and diffBounds', () => {
        it('collects magenta pixels as diff pixel coordinates', async () => {
            pixelmatchFn.mockImplementation((_img1, _img2, output: Uint8Array, width: number) => {
                // Place a magenta pixel at x=5, y=3
                const pos = (3 * width + 5) * 4
                output[pos] = 255
                output[pos + 1] = 0
                output[pos + 2] = 255
                output[pos + 3] = 255
                return 1
            })

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.diffPixels).toHaveLength(1)
            expect(result.diffPixels[0]).toEqual({ x: 5, y: 3 })
        })

        it('does not count grayscale matching pixels as diff pixels', async () => {
            pixelmatchFn.mockImplementation((_img1, _img2, output: Uint8Array, width: number) => {
                const pos = (2 * width + 10) * 4
                output[pos] = 200
                output[pos + 1] = 200
                output[pos + 2] = 200
                output[pos + 3] = 255
                return 0
            })

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.diffPixels).toHaveLength(0)
        })

        it('computes correct diffBounds from multiple diff pixels', async () => {
            pixelmatchFn.mockImplementation((_img1, _img2, output: Uint8Array, width: number) => {
                const mark = (x: number, y: number) => {
                    const pos = (y * width + x) * 4
                    output[pos] = 255
                    output[pos + 1] = 0
                    output[pos + 2] = 255
                    output[pos + 3] = 255
                }
                mark(10, 5)
                mark(30, 20)
                mark(20, 10)
                return 3
            })

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.diffBounds).toEqual({ left: 10, top: 5, right: 30, bottom: 20 })
        })

        it('returns sentinel diffBounds when there are no diff pixels', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            const result = await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(result.diffBounds.left).toBeGreaterThan(result.diffBounds.right)
            expect(result.diffBounds.top).toBeGreaterThan(result.diffBounds.bottom)
        })
    })

    describe('ignore option mapping', () => {
        it('passes threshold=0 and includeAA=true for ignore: nothing', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { ignore: 'nothing' })

            expect(pixelmatchFn).toHaveBeenCalledWith(
                expect.anything(), expect.anything(), expect.anything(),
                expect.any(Number), expect.any(Number),
                expect.objectContaining({ threshold: 0, includeAA: true })
            )
        })

        it('passes threshold=0.063 and includeAA=false for ignore: less', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { ignore: 'less' })

            expect(pixelmatchFn).toHaveBeenCalledWith(
                expect.anything(), expect.anything(), expect.anything(),
                expect.any(Number), expect.any(Number),
                expect.objectContaining({ threshold: 0.063, includeAA: false })
            )
        })

        it('passes threshold=0.13 and includeAA=false for ignore: antialiasing', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { ignore: 'antialiasing' })

            expect(pixelmatchFn).toHaveBeenCalledWith(
                expect.anything(), expect.anything(), expect.anything(),
                expect.any(Number), expect.any(Number),
                expect.objectContaining({ threshold: 0.13, includeAA: false })
            )
        })

        it('passes threshold=0.13 and includeAA=false when no ignore option is given', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), {})

            expect(pixelmatchFn).toHaveBeenCalledWith(
                expect.anything(), expect.anything(), expect.anything(),
                expect.any(Number), expect.any(Number),
                expect.objectContaining({ threshold: 0.13, includeAA: false })
            )
        })

        it('accepts ignore as an array and uses the highest-priority mode', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), {
                ignore: ['antialiasing', 'less']
            })

            expect(pixelmatchFn).toHaveBeenCalledWith(
                expect.anything(), expect.anything(), expect.anything(),
                expect.any(Number), expect.any(Number),
                expect.objectContaining({ threshold: 0.063 })
            )
        })
    })

    describe('ignoredBoxes', () => {
        it('zeroes out the specified box regions in both pixel arrays before comparison', async () => {
            let capturedImg1: Uint8Array | undefined
            let capturedImg2: Uint8Array | undefined

            pixelmatchFn.mockImplementation((img1: Uint8Array, img2: Uint8Array) => {
                capturedImg1 = new Uint8Array(img1)
                capturedImg2 = new Uint8Array(img2)
                return 0
            })

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), {
                output: {
                    ignoredBoxes: [{ left: 0, top: 0, right: 0, bottom: 0 }]
                }
            })

            expect(capturedImg1![0]).toBe(0)
            expect(capturedImg1![1]).toBe(0)
            expect(capturedImg1![2]).toBe(0)
            expect(capturedImg1![3]).toBe(0)
            expect(capturedImg2![0]).toBe(0)
        })
    })

    describe('scaleToSameSize', () => {
        it('calls resizeBilinear on the smaller image when images differ in size', async () => {
            decodeImageFn
                .mockReturnValueOnce({ data: new Uint8Array(100 * 100 * 4), width: 100, height: 100 })
                .mockReturnValueOnce({ data: new Uint8Array(50 * 50 * 4), width: 50, height: 50 })
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { scaleToSameSize: true })

            expect(resizeBilinearFn).toHaveBeenCalledTimes(1)
            expect(resizeBilinearFn).toHaveBeenCalledWith(
                expect.objectContaining({ width: 50, height: 50 }),
                100, 100
            )
        })

        it('does not call resizeBilinear when scaleToSameSize is false', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { scaleToSameSize: false })

            expect(resizeBilinearFn).not.toHaveBeenCalled()
        })

        it('does not call resizeBilinear when images are the same size', async () => {
            pixelmatchFn.mockImplementation(() => 0)

            await compareImages(Buffer.from('img1'), Buffer.from('img2'), { scaleToSameSize: true })

            expect(resizeBilinearFn).not.toHaveBeenCalled()
        })
    })
})
