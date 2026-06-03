import pixelmatch from 'pixelmatch'
import { decodeImage, resizeBilinear, encodeImage } from '../utils/imageUtils.js'
import type { CompareData, ComparisonOptions, ComparisonIgnoreOption } from './compare.interfaces.js'

function resolveIgnoreList(ignore: ComparisonOptions['ignore']): ComparisonIgnoreOption[] {
    if (!ignore) {
        return []
    }

    return Array.isArray(ignore) ? ignore : [ignore]
}

function toPixelmatchOptions(ignoreList: ComparisonIgnoreOption[]): { threshold: number; includeAA: boolean } {
    if (ignoreList.includes('nothing')) {
        return { threshold: 0, includeAA: true }
    }
    if (ignoreList.includes('less')) {
        // 16/255 per channel in resemble maps roughly to ~6.3% of max YIQ distance
        return { threshold: 0.063, includeAA: false }
    }
    // 'antialiasing', 'alpha', 'colors' and the default.
    // Resemble's ignoreAntialiasing uses 32/255 per-channel tolerance which
    // corresponds to ~0.13 in YIQ perceptual distance. Using 0.1 is stricter
    // and causes invisible sub-pixel differences to register as failures.
    return { threshold: 0.13, includeAA: false }
}

function grayscalePixels(pixels: Buffer, totalPixels: number): void {
    for (let i = 0; i < totalPixels * 4; i += 4) {
        const luma = Math.round(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2])
        pixels[i] = luma
        pixels[i + 1] = luma
        pixels[i + 2] = luma
    }
}

function opaqueAlphaChannel(pixels: Buffer, totalPixels: number): void {
    for (let i = 3; i < totalPixels * 4; i += 4) {
        pixels[i] = 255
    }
}

// Pad a raw RGBA pixel buffer to a larger canvas size, placing the source at
// position (0, 0) and filling the remaining area with opaque white.
// Pad source at (0, 0) and fill the remaining area with opaque white.
function padToSize(src: Buffer, srcW: number, srcH: number, dstW: number, dstH: number): Buffer {
    const dst = Buffer.alloc(dstW * dstH * 4, 255) // opaque white
    for (let y = 0; y < srcH; y++) {
        src.copy(dst, y * dstW * 4, y * srcW * 4, (y + 1) * srcW * 4)
    }
    return dst
}

function zeroIgnoredBoxes(
    pixels: Buffer,
    width: number,
    boxes: Array<{ left: number; top: number; right: number; bottom: number }>
): void {
    for (const box of boxes) {
        for (let y = box.top; y <= box.bottom; y++) {
            for (let x = box.left; x <= box.right; x++) {
                const offset = (y * width + x) * 4
                pixels[offset] = 0
                pixels[offset + 1] = 0
                pixels[offset + 2] = 0
                pixels[offset + 3] = 0
            }
        }
    }
}

export default async function compareImages(
    image1: Buffer,
    image2: Buffer,
    options: ComparisonOptions
): Promise<CompareData> {
    const start = Date.now()

    let img1 = decodeImage(image1)
    let img2 = decodeImage(image2)

    if (options.scaleToSameSize) {
        const size1 = img1.width * img1.height
        const size2 = img2.width * img2.height
        if (size1 > size2) {
            img2 = resizeBilinear(img2, img1.width, img1.height)
        } else if (size2 > size1) {
            img1 = resizeBilinear(img1, img2.width, img2.height)
        }
    }

    // Determine the target canvas size (max of both dimensions).
    const width = Math.max(img1.width, img2.width)
    const height = Math.max(img1.height, img2.height)
    const totalPixels = width * height

    // Copy bitmap data into mutable buffers, padding smaller images at (0,0)
    // with opaque white so content is not shifted by centering.
    const pixels1 = img1.width === width && img1.height === height
        ? Buffer.from(img1.data)
        : padToSize(Buffer.from(img1.data), img1.width, img1.height, width, height)
    const pixels2 = img2.width === width && img2.height === height
        ? Buffer.from(img2.data)
        : padToSize(Buffer.from(img2.data), img2.width, img2.height, width, height)

    const ignoreList = resolveIgnoreList(options.ignore)

    if (ignoreList.includes('colors')) {
        grayscalePixels(pixels1, totalPixels)
        grayscalePixels(pixels2, totalPixels)
    }

    if (ignoreList.includes('alpha')) {
        opaqueAlphaChannel(pixels1, totalPixels)
        opaqueAlphaChannel(pixels2, totalPixels)
    }

    const ignoredBoxes = options.output?.ignoredBoxes ?? []
    if (ignoredBoxes.length > 0) {
        zeroIgnoredBoxes(pixels1, width, ignoredBoxes)
        zeroIgnoredBoxes(pixels2, width, ignoredBoxes)
    }

    const { threshold, includeAA } = toPixelmatchOptions(ignoreList)
    const outputPixels = new Uint8Array(totalPixels * 4)

    // Use magenta [255, 0, 255] for both diff and AA pixels.
    const diffCount: number = pixelmatch(pixels1, pixels2, outputPixels, width, height, {
        threshold,
        includeAA,
        diffColor: [255, 0, 255],
        aaColor: [255, 0, 255],
    })

    // Collect diff pixel coordinates from the output buffer.
    // Both diff and AA pixels are drawn in magenta [255, 0, 255]; grayscale pixels are matches.
    const diffPixels: Array<{ x: number; y: number }> = []
    let left = width
    let top = height
    let right = 0
    let bottom = 0

    for (let i = 0; i < outputPixels.length; i += 4) {
        if (outputPixels[i] === 255 && outputPixels[i + 1] === 0 && outputPixels[i + 2] === 255) {
            const pixelIndex = i / 4
            const x = pixelIndex % width
            const y = Math.floor(pixelIndex / width)
            diffPixels.push({ x, y })
            if (x < left) { left = x }
            if (x > right) { right = x }
            if (y < top) { top = y }
            if (y > bottom) { bottom = y }
        }
    }

    const diffBounds = diffPixels.length > 0
        ? { left, top, right, bottom }
        : { left: width, top: height, right: 0, bottom: 0 }

    const getBuffer = async (): Promise<Buffer> => encodeImage({ data: outputPixels, width, height })

    const rawMisMatchPercentage = (diffCount / totalPixels) * 100

    return {
        rawMisMatchPercentage,
        misMatchPercentage: Number(rawMisMatchPercentage.toFixed(2)),
        getBuffer,
        diffBounds,
        analysisTime: Date.now() - start,
        diffPixels,
    }
}
