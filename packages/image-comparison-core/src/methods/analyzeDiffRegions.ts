import type { BoundingBox, DiffChangeType, DiffPattern, DiffRegion } from './rectangles.interfaces.js'
import type { RawImage } from '../utils/imageUtils.js'

type RegionData = { box: BoundingBox; diffPixelCount: number; edgePixelRatio: number }

const LW_R = 0.299
const LW_G = 0.587
const LW_B = 0.114

// Max possible luminance-weighted delta: sqrt(LW_R²×255² + LW_G²×255² + LW_B²×255²) ≈ 179
const MAX_WEIGHTED_DELTA = Math.sqrt(LW_R * LW_R + LW_G * LW_G + LW_B * LW_B) * 255

function luma(r: number, g: number, b: number): number {
    return LW_R * r + LW_G * g + LW_B * b
}

function stddev(values: number[]): number {
    if (values.length < 2) { return 0 }
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
}

function hueAngle(r: number, g: number, b: number): number {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    if (delta === 0) { return 0 }
    let h = 0
    if (max === r) {
        h = ((g - b) / delta) % 6
    } else if (max === g) {
        h = (b - r) / delta + 2
    } else {
        h = (r - g) / delta + 4
    }
    return (h * 60 + 360) % 360
}

interface PixelSample { r: number; g: number; b: number; luma: number; hue: number }

function sampleRegion(pixels: RawImage, box: BoundingBox, stride: number): PixelSample[] {
    const samples: PixelSample[] = []
    for (let y = box.top; y <= box.bottom; y += stride) {
        for (let x = box.left; x <= box.right; x += stride) {
            const i = (y * pixels.width + x) * 4
            const r = pixels.data[i]
            const g = pixels.data[i + 1]
            const b = pixels.data[i + 2]
            samples.push({ r, g, b, luma: luma(r, g, b), hue: hueAngle(r, g, b) })
        }
    }
    return samples
}

const UNIFORM_STDDEV = 20
const HUE_DIFF_THRESHOLD = 30

function classifyPattern(edgePixelRatio: number, density: number): DiffPattern {
    if (edgePixelRatio > 0.85) { return 'edge-outline' }
    if (edgePixelRatio < 0.35 && density > 0.30) { return 'solid-fill' }
    return 'scattered'
}

function isSignificant(pattern: DiffPattern, meanColorDelta: number, relativeArea: number): boolean {
    switch (pattern) {
    case 'edge-outline': return meanColorDelta > 50
    case 'solid-fill':   return true
    case 'scattered':    return meanColorDelta > 20 && relativeArea > 0.002
    }
}

export function analyzeDiffRegions(
    regions: RegionData[],
    imageWidth: number,
    imageHeight: number,
    actualPixels: RawImage,
    baselinePixels: RawImage,
): DiffRegion[] {
    const imageArea = imageWidth * imageHeight

    return regions.map(({ box, diffPixelCount, edgePixelRatio }) => {
        const w = box.right - box.left + 1
        const h = box.bottom - box.top + 1
        const boxArea = w * h

        // --- Geometric metrics ---
        const density = diffPixelCount / boxArea
        const aspectRatio = h > 0 ? w / h : 1
        const relativeArea = boxArea / imageArea
        const centerX = (box.left + box.right) / 2 / imageWidth
        const centerY = (box.top + box.bottom) / 2 / imageHeight

        // --- Diff pattern ---
        const diffPattern = classifyPattern(edgePixelRatio, density)

        // --- Pixel sampling ---
        const stride = boxArea > 500 ? 4 : 1
        const actualSamples = sampleRegion(actualPixels, box, stride)
        const baselineSamples = sampleRegion(baselinePixels, box, stride)

        // --- Change-type classification ---
        const stddevActual = stddev(actualSamples.map(s => s.luma))
        const stddevBaseline = stddev(baselineSamples.map(s => s.luma))

        let changeType: DiffChangeType
        if (stddevBaseline < UNIFORM_STDDEV && stddevActual >= UNIFORM_STDDEV) {
            changeType = 'added'
        } else if (stddevActual < UNIFORM_STDDEV && stddevBaseline >= UNIFORM_STDDEV) {
            changeType = 'removed'
        } else {
            const n = actualSamples.length
            const meanActualHue = n > 0 ? actualSamples.reduce((s, p) => s + p.hue, 0) / n : 0
            const meanBaselineHue = n > 0 ? baselineSamples.reduce((s, p) => s + p.hue, 0) / n : 0
            const hueDiff = Math.abs(meanActualHue - meanBaselineHue)
            const circularDiff = Math.min(hueDiff, 360 - hueDiff)
            changeType = circularDiff > HUE_DIFF_THRESHOLD ? 'color-shift' : 'changed'
        }

        // --- Perceptual significance ---
        const n = Math.min(actualSamples.length, baselineSamples.length)
        let totalDelta = 0
        for (let i = 0; i < n; i++) {
            const a = actualSamples[i]
            const bl = baselineSamples[i]
            const dr = LW_R * (a.r - bl.r)
            const dg = LW_G * (a.g - bl.g)
            const db = LW_B * (a.b - bl.b)
            totalDelta += Math.sqrt(dr * dr + dg * dg + db * db)
        }
        const meanColorDelta = n > 0 ? Math.round((totalDelta / n) * 100 / MAX_WEIGHTED_DELTA) : 0

        const perceptualScore = Math.round(
            (density * 0.35 + (meanColorDelta / 100) * 0.45 + Math.min(relativeArea / 0.05, 1) * 0.20) * 100
        )
        const isVisuallySignificant = isSignificant(diffPattern, meanColorDelta, relativeArea)

        return {
            ...box,
            diffPixelCount,
            density,
            aspectRatio,
            relativeArea,
            centerX,
            centerY,
            edgePixelRatio,
            diffPattern,
            changeType,
            meanColorDelta,
            perceptualScore,
            isVisuallySignificant,
        }
    })
}
