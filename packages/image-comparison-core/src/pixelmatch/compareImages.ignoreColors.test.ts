import { describe, it, expect } from 'vitest'
import compareImages from './compareImages.js'
import { createCanvas, encodeImage } from '../utils/imageUtils.js'

function solidColorImage(r: number, g: number, b: number): Buffer {
    return encodeImage(createCanvas(1, 1, r, g, b, 255))
}

describe('compareImages ignoreColors parity', () => {
    it('passes when hue changes but resemble brightness matches', async () => {
        const baseline = solidColorImage(180, 60, 60)
        const actual = solidColorImage(96, 96, 96)

        const result = await compareImages(baseline, actual, { ignore: 'colors' })

        expect(result.rawMisMatchPercentage).toBe(0)
        expect(result.diffPixels).toHaveLength(0)
    })

    it('fails when brightness differs under ignoreColors', async () => {
        const baseline = solidColorImage(96, 96, 96)
        const actual = solidColorImage(120, 120, 120)

        const result = await compareImages(baseline, actual, { ignore: 'colors' })

        expect(result.rawMisMatchPercentage).toBeGreaterThan(0)
        expect(result.diffPixels.length).toBeGreaterThan(0)
    })

    it('fails for a color-only diff without ignoreColors', async () => {
        const baseline = solidColorImage(180, 60, 60)
        const actual = solidColorImage(96, 96, 96)

        const result = await compareImages(baseline, actual, {})

        expect(result.rawMisMatchPercentage).toBeGreaterThan(0)
    })
})
