import { describe, it, expect } from 'vitest'
import { encode } from 'fast-png'
import {
    decodeImage,
    encodeImage,
    toBase64Png,
    createCanvas,
    cropImage,
    hasSameArea,
    isUniformArea,
    compositeImage,
    resizeBilinear,
    rotate90CW,
    rotate90CCW,
    rotate180,
    setOpacity,
} from './imageUtils.js'
import type { RawImage } from './imageUtils.js'

// Build a minimal 2x2 RGBA PNG buffer for use as test input
function makePng(pixels: number[][]): Buffer {
    // pixels: [[r,g,b,a], ...] in row-major order, width = sqrt(pixels.length)
    const side = Math.sqrt(pixels.length)
    const data = new Uint8Array(pixels.length * 4)
    pixels.forEach(([r, g, b, a], i) => {
        data[i * 4]     = r
        data[i * 4 + 1] = g
        data[i * 4 + 2] = b
        data[i * 4 + 3] = a
    })
    return Buffer.from(encode({ data, width: side, height: side, channels: 4, depth: 8 }))
}

describe('decodeImage', () => {
    it('decodes an RGBA PNG buffer into a RawImage', () => {
        const buf = makePng([[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255]])
        const img = decodeImage(buf)
        expect(img.width).toBe(2)
        expect(img.height).toBe(2)
        expect(img.data[0]).toBe(255) // R
        expect(img.data[1]).toBe(0)   // G
        expect(img.data[2]).toBe(0)   // B
        expect(img.data[3]).toBe(255) // A
    })

    it('converts an RGB (3-channel) PNG to RGBA by adding full alpha', () => {
        const data = new Uint8Array([100, 150, 200,  50, 60, 70])
        const buf = Buffer.from(encode({ data, width: 2, height: 1, channels: 3, depth: 8 }))
        const img = decodeImage(buf)
        expect(img.width).toBe(2)
        expect(img.height).toBe(1)
        expect(img.data[0]).toBe(100)  // R
        expect(img.data[1]).toBe(150)  // G
        expect(img.data[2]).toBe(200)  // B
        expect(img.data[3]).toBe(255)  // A added
        expect(img.data[4]).toBe(50)
        expect(img.data[7]).toBe(255)  // A added for second pixel
    })

    it('converts a grayscale (1-channel) PNG to RGBA', () => {
        const data = new Uint8Array([128])
        const buf = Buffer.from(encode({ data, width: 1, height: 1, channels: 1, depth: 8 }))
        const img = decodeImage(buf)
        expect(img.width).toBe(1)
        expect(img.data[0]).toBe(128) // R = gray value
        expect(img.data[1]).toBe(128) // G = gray value
        expect(img.data[2]).toBe(128) // B = gray value
        expect(img.data[3]).toBe(255) // A = full
    })

    it('converts a grayscale+alpha (2-channel) PNG to RGBA', () => {
        const data = new Uint8Array([200, 128]) // gray=200, alpha=128
        const buf = Buffer.from(encode({ data, width: 1, height: 1, channels: 2, depth: 8 }))
        const img = decodeImage(buf)
        expect(img.data[0]).toBe(200) // R = gray
        expect(img.data[1]).toBe(200) // G = gray
        expect(img.data[2]).toBe(200) // B = gray
        expect(img.data[3]).toBe(128) // A preserved
    })

    it('converts a 16-bit RGBA PNG by downsampling to 8-bit', () => {
        // 16-bit value 0xFF00 >> 8 = 255, 0x8000 >> 8 = 128
        const data = new Uint16Array([0xFF00, 0x8000, 0x0000, 0xFF00])
        const buf = Buffer.from(encode({ data, width: 1, height: 1, channels: 4, depth: 16 }))
        const img = decodeImage(buf)
        expect(img.data[0]).toBe(255) // R: 0xFF00 >> 8
        expect(img.data[1]).toBe(128) // G: 0x8000 >> 8
        expect(img.data[2]).toBe(0)   // B: 0x0000 >> 8
        expect(img.data[3]).toBe(255) // A: 0xFF00 >> 8
    })
})

describe('encodeImage / toBase64Png', () => {
    it('round-trips a RawImage through encode → decode', () => {
        const original = createCanvas(2, 2, 100, 150, 200, 255)
        const buf = encodeImage(original)
        const decoded = decodeImage(buf)
        expect(decoded.width).toBe(2)
        expect(decoded.height).toBe(2)
        expect(decoded.data[0]).toBe(100)
        expect(decoded.data[1]).toBe(150)
        expect(decoded.data[2]).toBe(200)
        expect(decoded.data[3]).toBe(255)
    })

    it('toBase64Png returns a valid base64 string that decodes back correctly', () => {
        const img = createCanvas(1, 1, 10, 20, 30, 255)
        const b64 = toBase64Png(img)
        expect(typeof b64).toBe('string')
        const decoded = decodeImage(Buffer.from(b64, 'base64'))
        expect(decoded.data[0]).toBe(10)
        expect(decoded.data[1]).toBe(20)
        expect(decoded.data[2]).toBe(30)
    })
})

describe('createCanvas', () => {
    it('creates a zero-filled canvas by default', () => {
        const img = createCanvas(3, 3)
        expect(img.width).toBe(3)
        expect(img.height).toBe(3)
        expect(img.data.every(v => v === 0)).toBe(true)
    })

    it('fills all pixels with the provided RGBA color', () => {
        const img = createCanvas(2, 2, 57, 170, 86, 255)
        for (let i = 0; i < 4; i++) {
            expect(img.data[i * 4])     .toBe(57)
            expect(img.data[i * 4 + 1]).toBe(170)
            expect(img.data[i * 4 + 2]).toBe(86)
            expect(img.data[i * 4 + 3]).toBe(255)
        }
    })
})

describe('cropImage', () => {
    it('extracts the correct rectangular region', () => {
        // 4x1 image: red, green, blue, yellow
        const img: RawImage = {
            data: new Uint8Array([
                255, 0,   0,   255,  // red
                0,   255, 0,   255,  // green
                0,   0,   255, 255,  // blue
                255, 255, 0,   255,  // yellow
            ]),
            width: 4,
            height: 1,
        }
        const cropped = cropImage(img, 1, 0, 2, 1)
        expect(cropped.width).toBe(2)
        expect(cropped.height).toBe(1)
        // First pixel = green
        expect(cropped.data[0]).toBe(0)
        expect(cropped.data[1]).toBe(255)
        expect(cropped.data[2]).toBe(0)
        // Second pixel = blue
        expect(cropped.data[4]).toBe(0)
        expect(cropped.data[5]).toBe(0)
        expect(cropped.data[6]).toBe(255)
    })
})

describe('hasSameArea', () => {
    // 3x2 image, each pixel a different gray value
    const makeImage = (): RawImage => {
        const data = new Uint8Array(3 * 2 * 4)
        for (let i = 0; i < 6; i++) {
            data.set([i * 10, i * 10, i * 10, 255], i * 4)
        }
        return { data, width: 3, height: 2 }
    }

    it('is true for the same pixels in the area', () => {
        expect(hasSameArea(makeImage(), makeImage(), 0, 0, 3, 2)).toBe(true)
    })

    it('ignores a different pixel outside the area', () => {
        const changed = makeImage()
        // pixel (0, 0)
        changed.data[0] = 99

        expect(hasSameArea(makeImage(), changed, 1, 0, 2, 2)).toBe(true)
        expect(hasSameArea(makeImage(), changed, 0, 0, 3, 2)).toBe(false)
    })

    it('finds a different pixel in the last row and column of the area', () => {
        const changed = makeImage()
        // alpha of pixel (2, 1)
        changed.data[(1 * 3 + 2) * 4 + 3] = 0

        expect(hasSameArea(makeImage(), changed, 1, 1, 2, 1)).toBe(false)
    })

    it('does not compare an area that is not fully inside both images', () => {
        const small: RawImage = { data: new Uint8Array(2 * 2 * 4), width: 2, height: 2 }

        expect(hasSameArea(makeImage(), makeImage(), 1, 0, 3, 2)).toBe(false)
        expect(hasSameArea(makeImage(), makeImage(), -1, 0, 2, 2)).toBe(false)
        expect(hasSameArea(makeImage(), makeImage(), 0, 0, 0, 2)).toBe(false)
        expect(hasSameArea(makeImage(), small, 0, 0, 3, 2)).toBe(false)
    })
})

describe('compositeImage', () => {
    it('copies an opaque overlay exactly onto the base', () => {
        const base    = createCanvas(2, 2, 0, 0, 0, 255)
        const overlay = createCanvas(1, 1, 255, 0, 0, 255)
        compositeImage(base, overlay, 1, 1)
        const di = (1 * 2 + 1) * 4
        expect(base.data[di])    .toBe(255)
        expect(base.data[di + 1]).toBe(0)
        expect(base.data[di + 2]).toBe(0)
        expect(base.data[di + 3]).toBe(255)
        // Top-left should be untouched
        expect(base.data[0]).toBe(0)
    })

    it('blends a semi-transparent overlay with opacity', () => {
        const base    = createCanvas(1, 1, 0, 0, 0, 255)  // black opaque
        const overlay = createCanvas(1, 1, 255, 0, 0, 255) // red opaque
        compositeImage(base, overlay, 0, 0, 0.5)
        // src_a = 0.5, dst_a = 1, out_a = 1
        // R = round((255 * 0.5 + 0 * 1 * 0.5) / 1) = 128 (approximately)
        expect(base.data[0]).toBeCloseTo(128, 0)
        expect(base.data[3]).toBe(255)
    })

    it('skips blending when both src and dst alpha are zero', () => {
        const base    = createCanvas(1, 1, 255, 0, 0, 0)   // red but fully transparent
        const overlay = createCanvas(1, 1, 0, 255, 0, 0)   // green but fully transparent
        compositeImage(base, overlay, 0, 0)
        // outA = 0 → pixel unchanged: base stays (255, 0, 0, 0)
        expect(base.data[0]).toBe(255)
        expect(base.data[3]).toBe(0)
    })

    it('skips pixels outside the base bounds', () => {
        const base    = createCanvas(2, 2, 0, 0, 0, 255)
        const overlay = createCanvas(3, 3, 255, 0, 0, 255)
        // Offset so overlay extends beyond base - should not throw
        expect(() => compositeImage(base, overlay, 1, 1)).not.toThrow()
    })
})

describe('resizeBilinear', () => {
    it('doubles a 1x1 image to 2x2 with the same color', () => {
        const img = createCanvas(1, 1, 100, 200, 50, 255)
        const resized = resizeBilinear(img, 2, 2)
        expect(resized.width).toBe(2)
        expect(resized.height).toBe(2)
        expect(resized.data[0]).toBe(100)
        expect(resized.data[1]).toBe(200)
        expect(resized.data[2]).toBe(50)
    })

    it('halves a 4x4 image to 2x2', () => {
        const img = createCanvas(4, 4, 200, 100, 50, 255)
        const resized = resizeBilinear(img, 2, 2)
        expect(resized.width).toBe(2)
        expect(resized.height).toBe(2)
    })
})

describe('rotate90CW', () => {
    it('swaps width and height', () => {
        const img = createCanvas(4, 2, 0, 0, 0, 255)
        const rotated = rotate90CW(img)
        expect(rotated.width).toBe(2)
        expect(rotated.height).toBe(4)
    })

    it('moves top-left pixel to top-right', () => {
        // 2x1: [red | green]
        const img: RawImage = {
            data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]),
            width: 2,
            height: 1,
        }
        const rotated = rotate90CW(img)
        // 90° CW: new 1x2 - top pixel comes from bottom-left of src (only 1 row, so left=red)
        expect(rotated.width).toBe(1)
        expect(rotated.height).toBe(2)
        // top of rotated should be red (was left in src)
        expect(rotated.data[0]).toBe(255) // R
        expect(rotated.data[1]).toBe(0)   // G
    })
})

describe('rotate90CCW', () => {
    it('swaps width and height', () => {
        const img = createCanvas(4, 2, 0, 0, 0, 255)
        const rotated = rotate90CCW(img)
        expect(rotated.width).toBe(2)
        expect(rotated.height).toBe(4)
    })

    it('is the inverse of rotate90CW', () => {
        const img = createCanvas(3, 2, 0, 0, 0, 255)
        img.data[0] = 42 // mark top-left
        const cw  = rotate90CW(img)
        const back = rotate90CCW(cw)
        expect(back.width).toBe(3)
        expect(back.height).toBe(2)
        expect(back.data[0]).toBe(42)
    })
})

describe('rotate180', () => {
    it('preserves dimensions', () => {
        const img = createCanvas(3, 4, 0, 0, 0, 255)
        const rotated = rotate180(img)
        expect(rotated.width).toBe(3)
        expect(rotated.height).toBe(4)
    })

    it('flips the pixel order', () => {
        const img: RawImage = {
            data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]),
            width: 2,
            height: 1,
        }
        const rotated = rotate180(img)
        // First pixel should now be green (was last)
        expect(rotated.data[0]).toBe(0)
        expect(rotated.data[1]).toBe(255)
        expect(rotated.data[2]).toBe(0)
        // Second pixel should be red
        expect(rotated.data[4]).toBe(255)
        expect(rotated.data[5]).toBe(0)
    })

    it('is its own inverse', () => {
        const img = createCanvas(2, 2, 0, 0, 0, 255)
        img.data[0] = 77
        const twice = rotate180(rotate180(img))
        expect(twice.data[0]).toBe(77)
    })
})

describe('setOpacity', () => {
    it('halves the alpha channel of each pixel', () => {
        const img = createCanvas(2, 2, 57, 170, 86, 255)
        setOpacity(img, 0.5)
        for (let i = 0; i < 4; i++) {
            expect(img.data[i * 4 + 3]).toBe(128)
        }
    })

    it('sets full opacity to 255', () => {
        const img = createCanvas(1, 1, 0, 0, 0, 128)
        setOpacity(img, 1)
        expect(img.data[3]).toBe(128) // unchanged - 128 * 1 = 128
    })

    it('sets zero opacity to 0', () => {
        const img = createCanvas(1, 1, 0, 0, 0, 200)
        setOpacity(img, 0)
        expect(img.data[3]).toBe(0)
    })
})

describe('isUniformArea', () => {
    const image = (pixel: (x: number, y: number) => number[]) => {
        const width = 4
        const height = 4
        const data = new Uint8Array(width * height * 4)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                data.set(pixel(x, y), (y * width + x) * 4)
            }
        }
        return { data, width, height }
    }

    it('should be true when all pixels of the area have the same value', () => {
        expect(isUniformArea(image(() => [255, 255, 255, 255]), 0, 0, 4, 4)).toBe(true)
    })

    it('should be false when one pixel of the area has another value', () => {
        expect(isUniformArea(image((x, y) => x === 3 && y === 3 ? [254, 255, 255, 255] : [255, 255, 255, 255]), 0, 0, 4, 4)).toBe(false)
    })

    it('should only look at the area', () => {
        expect(isUniformArea(image((x) => x === 0 ? [0, 0, 0, 255] : [255, 255, 255, 255]), 1, 0, 3, 4)).toBe(true)
    })

    it('should be false for an area outside the image', () => {
        expect(isUniformArea(image(() => [255, 255, 255, 255]), 2, 2, 4, 4)).toBe(false)
    })
})
