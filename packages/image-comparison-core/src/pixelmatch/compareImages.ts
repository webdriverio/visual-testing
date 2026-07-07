import pixelmatch from 'pixelmatch'
import { resolveComparePreset } from '../helpers/options.js'
import { DEFAULT_PIXELMATCH_OPTIONS } from '../helpers/constants.js'
import { applyResembleGrayscale } from './compareBrightness.js'
import { decodeImage, resizeBilinear, encodeImage, type RawImage } from '../utils/imageUtils.js'
import type { CompareData, ComparisonOptions, ComparisonIgnoreOption, ResolvedPixelmatchOptions } from './compare.interfaces.js'

function resolveIgnoreList(ignore: ComparisonOptions['ignore']): ComparisonIgnoreOption[] {
    if (!ignore) {
        return []
    }

    return Array.isArray(ignore) ? ignore : [ignore]
}

/**
 * Returns whether a pixelmatch output buffer pixel is a diff, AA, or alt highlight.
 */
function isHighlightedPixel(
    output: Uint8Array,
    offset: number,
    diffColor: [number, number, number],
    aaColor: [number, number, number],
    diffColorAlt?: [number, number, number],
): boolean {
    const r = output[offset]
    const g = output[offset + 1]
    const b = output[offset + 2]

    const matchesColor = (color: [number, number, number]) =>
        r === color[0] && g === color[1] && b === color[2]

    return matchesColor(diffColor)
        || matchesColor(aaColor)
        || (diffColorAlt !== undefined && matchesColor(diffColorAlt))
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

    // Snapshot the original actual pixels before any comparison transforms (grayscale,
    // alpha-opaque, zero-out). The diff image uses this as its background so the real
    // screenshot content is always visible, including inside blockout regions.
    const displayPixels2 = Buffer.from(pixels2)

    const pixelmatchSettings = options.pixelmatch
    const ignoreList = pixelmatchSettings ? [] : resolveIgnoreList(options.ignore)

    if (ignoreList.includes('colors')) {
        applyResembleGrayscale(pixels1, totalPixels)
        applyResembleGrayscale(pixels2, totalPixels)
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

    const resolvedPixelmatch: ResolvedPixelmatchOptions = pixelmatchSettings ?? {
        ...resolveComparePreset(ignoreList),
        diffColor: DEFAULT_PIXELMATCH_OPTIONS.diffColor,
        aaColor: DEFAULT_PIXELMATCH_OPTIONS.aaColor,
        diffColorAlt: DEFAULT_PIXELMATCH_OPTIONS.diffColorAlt,
        alpha: DEFAULT_PIXELMATCH_OPTIONS.alpha,
        diffMask: DEFAULT_PIXELMATCH_OPTIONS.diffMask,
        checkerboard: DEFAULT_PIXELMATCH_OPTIONS.checkerboard,
    }

    const outputPixels = new Uint8Array(totalPixels * 4)

    const diffCount: number = pixelmatch(pixels1, pixels2, outputPixels, width, height, {
        threshold: resolvedPixelmatch.threshold,
        includeAA: resolvedPixelmatch.includeAA,
        diffColor: resolvedPixelmatch.diffColor,
        aaColor: resolvedPixelmatch.aaColor,
        diffColorAlt: resolvedPixelmatch.diffColorAlt,
        alpha: resolvedPixelmatch.alpha,
        diffMask: resolvedPixelmatch.diffMask,
        ...(resolvedPixelmatch.checkerboard !== undefined ? { checkerboard: resolvedPixelmatch.checkerboard } : {}),
    })

    const { diffColor, aaColor, diffColorAlt, diffMask } = resolvedPixelmatch

    // Collect diff pixel coordinates from the output buffer.
    const diffPixels: Array<{ x: number; y: number }> = []
    let left = width
    let top = height
    let right = 0
    let bottom = 0

    for (let i = 0; i < outputPixels.length; i += 4) {
        if (isHighlightedPixel(outputPixels, i, diffColor, aaColor, diffColorAlt)) {
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

    const getRawPixels = (): RawImage => {
        const data = new Uint8Array(totalPixels * 4)

        if (diffMask) {
            data.set(outputPixels)
            return { data, width, height }
        }

        for (let i = 0; i < data.length; i += 4) {
            if (isHighlightedPixel(outputPixels, i, diffColor, aaColor, diffColorAlt)) {
                data[i] = outputPixels[i]
                data[i + 1] = outputPixels[i + 1]
                data[i + 2] = outputPixels[i + 2]
                data[i + 3] = outputPixels[i + 3] || 255
            } else {
                data[i] = displayPixels2[i]
                data[i + 1] = displayPixels2[i + 1]
                data[i + 2] = displayPixels2[i + 2]
                data[i + 3] = displayPixels2[i + 3]
            }
        }

        return { data, width, height }
    }

    const getBuffer = async (): Promise<Buffer> => encodeImage(getRawPixels())

    const rawMisMatchPercentage = (diffCount / totalPixels) * 100

    return {
        rawMisMatchPercentage,
        misMatchPercentage: Number(rawMisMatchPercentage.toFixed(2)),
        getRawPixels,
        getBuffer,
        diffBounds,
        analysisTime: Date.now() - start,
        diffPixels,
    }
}
