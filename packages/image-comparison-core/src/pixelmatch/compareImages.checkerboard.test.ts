import { describe, it, expect } from 'vitest'
import compareImages from './compareImages.js'
import { DEFAULT_PIXELMATCH_OPTIONS } from '../helpers/constants.js'
import { createCanvas, encodeImage } from '../utils/imageUtils.js'

// Runs the real pixelmatch (no mock): `checkerboard` only changes how pixelmatch blends semi-transparent pixels
const SIZE = 16
const transparent = encodeImage(createCanvas(SIZE, SIZE, 0, 0, 0, 0))
const opaqueWhite = encodeImage(createCanvas(SIZE, SIZE, 255, 255, 255, 255))

function compareWithCheckerboard(checkerboard: boolean) {
    return compareImages(transparent, opaqueWhite, {
        pixelmatch: { ...DEFAULT_PIXELMATCH_OPTIONS, threshold: 0.063, includeAA: true, checkerboard },
    })
}

describe('compareImages checkerboard', () => {
    it('blends transparent pixels with white when checkerboard is false, so they match white', async () => {
        const result = await compareWithCheckerboard(false)

        expect(result.rawMisMatchPercentage).toBe(0)
        expect(result.diffPixels).toHaveLength(0)
    })

    it('blends transparent pixels with a checker pattern when checkerboard is true, so they differ from white', async () => {
        const result = await compareWithCheckerboard(true)

        expect(result.rawMisMatchPercentage).toBeGreaterThan(0)
        expect(result.diffPixels.length).toBeGreaterThan(0)
    })
})
