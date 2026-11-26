import { describe, it, expect } from 'vitest'
import compareImages from './compareImages.js'
import { createCanvas, encodeImage, type RawImage } from '../utils/imageUtils.js'

// Runs the real pixelmatch (no mock) with ignored boxes
const SIZE = 20

function withRedSquare(image: RawImage, left: number, top: number, size: number): RawImage {
    for (let y = top; y < top + size; y++) {
        for (let x = left; x < left + size; x++) {
            const offset = (y * image.width + x) * 4
            image.data[offset] = 255
            image.data[offset + 1] = 0
            image.data[offset + 2] = 0
        }
    }
    return image
}

const white = () => createCanvas(SIZE, SIZE, 255, 255, 255, 255)

describe('compareImages ignoredBoxes', () => {
    it('does not count a difference inside an ignored box', async () => {
        const result = await compareImages(
            encodeImage(white()),
            encodeImage(withRedSquare(white(), 5, 5, 4)),
            { output: { ignoredBoxes: [{ left: 5, top: 5, right: 8, bottom: 8 }] } },
        )

        expect(result.rawMisMatchPercentage).toBe(0)
        expect(result.diffPixels).toHaveLength(0)
    })

    it('still counts a difference outside the ignored box', async () => {
        const result = await compareImages(
            encodeImage(white()),
            encodeImage(withRedSquare(withRedSquare(white(), 5, 5, 4), 14, 14, 2)),
            { output: { ignoredBoxes: [{ left: 5, top: 5, right: 8, bottom: 8 }] } },
        )

        // only the 2×2 square outside the box differs
        expect(result.diffPixels).toHaveLength(4)
        expect(result.diffPixels.every(({ x, y }) => x >= 14 && y >= 14)).toBe(true)
    })

    it('ignores the part of a box that is outside the image', async () => {
        const result = await compareImages(
            encodeImage(white()),
            encodeImage(withRedSquare(white(), 16, 16, 4)),
            { output: { ignoredBoxes: [{ left: 16, top: 16, right: 40, bottom: 40 }] } },
        )

        expect(result.rawMisMatchPercentage).toBe(0)
    })
})
