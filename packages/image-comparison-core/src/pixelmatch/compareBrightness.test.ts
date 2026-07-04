import { describe, it, expect } from 'vitest'
import { toResembleBrightness, applyResembleGrayscale } from './compareBrightness.js'

describe('compareBrightness', () => {
    describe('toResembleBrightness', () => {
        it('uses resemble coefficients 0.3/0.59/0.11', () => {
            expect(toResembleBrightness(180, 60, 60)).toBe(96)
            expect(toResembleBrightness(96, 96, 96)).toBe(96)
            expect(toResembleBrightness(85, 0, 0)).toBe(26)
        })

        it('differs from BT.601 weights for some RGB values', () => {
            // BT.601 would round 0.299 * 85 to 25; resemble uses 0.3 → 26
            expect(toResembleBrightness(85, 0, 0)).not.toBe(Math.round(0.299 * 85 + 0.587 * 0 + 0.114 * 0))
        })
    })

    describe('applyResembleGrayscale', () => {
        it('writes equal R/G/B channels using resemble luma', () => {
            const pixels = Buffer.from([180, 60, 60, 255])
            applyResembleGrayscale(pixels, 1)

            expect(pixels[0]).toBe(96)
            expect(pixels[1]).toBe(96)
            expect(pixels[2]).toBe(96)
            expect(pixels[3]).toBe(255)
        })
    })
})
