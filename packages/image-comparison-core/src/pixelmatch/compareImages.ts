import pixelmatch from 'pixelmatch'
import { Jimp, JimpMime } from 'jimp'
import type { CompareData, ComparisonOptions, ComparisonIgnoreOption } from '../resemble/compare.interfaces.js'

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
    // 'antialiasing', 'alpha', 'colors' and the default all use standard sensitivity
    return { threshold: 0.1, includeAA: false }
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

    const img1 = await Jimp.read(image1)
    const img2 = await Jimp.read(image2)

    if (options.scaleToSameSize) {
        const size1 = img1.bitmap.width * img1.bitmap.height
        const size2 = img2.bitmap.width * img2.bitmap.height
        if (size1 > size2) {
            img2.resize({ w: img1.bitmap.width, h: img1.bitmap.height })
        } else if (size2 > size1) {
            img1.resize({ w: img2.bitmap.width, h: img2.bitmap.height })
        }
    }

    const width = img1.bitmap.width
    const height = img1.bitmap.height
    const totalPixels = width * height

    // Copy bitmap data into mutable buffers so transformations do not mutate the Jimp internals
    const pixels1 = Buffer.from(img1.bitmap.data)
    const pixels2 = Buffer.from(img2.bitmap.data)

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

    const diffCount: number = pixelmatch(pixels1, pixels2, outputPixels, width, height, {
        threshold,
        includeAA,
    })

    // Collect diff pixel coordinates from the output buffer.
    // pixelmatch draws actual diff pixels in red [255, 0, 0] and anti-aliased pixels
    // in yellow [255, 255, 0]. Only count the red pixels as real differences.
    const diffPixels: Array<{ x: number; y: number }> = []
    let left = width
    let top = height
    let right = 0
    let bottom = 0

    for (let i = 0; i < outputPixels.length; i += 4) {
        if (outputPixels[i] === 255 && outputPixels[i + 1] === 0 && outputPixels[i + 2] === 0) {
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

    const getBuffer = async (): Promise<Buffer> => {
        const diffImage = new Jimp({ width, height })
        Buffer.from(outputPixels).copy(diffImage.bitmap.data)
        return diffImage.getBuffer(JimpMime.png)
    }

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
