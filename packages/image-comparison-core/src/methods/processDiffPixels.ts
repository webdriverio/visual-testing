/**
 * NOTE: This code/logic is based on logical research and support from the following sources:
 * - Copilot AI
 * - ChatGPT
 *
 * This is still a draft and may not be accurate, more research is needed and will tell you if this is correct.
 * It produces the following log based on `150585` diff pixels:
 *
 * [0-0] Processing diff pixels started
 * [0-0] Bounding boxes: [
 * [0-0]   { left: 912, top: 743, right: 1144, bottom: 762 },
 * [0-0]   { left: 650, top: 749, right: 790, bottom: 760 },
 * [0-0]   { left: 537, top: 749, right: 644, bottom: 760 },
 * [0-0]   { left: 377, top: 749, right: 415, bottom: 760 },
 * [0-0]   { left: 362, top: 749, right: 371, bottom: 759 },
 * [0-0]   { left: 290, top: 750, right: 356, bottom: 762 },
 * [0-0]   { left: 159, top: 746, right: 284, bottom: 760 },
 * [0-0]   { left: 536, top: 711, right: 754, bottom: 730 },
 * [0-0]   { left: 913, top: 711, right: 1186, bottom: 730 },
 * [0-0]   { left: 368, top: 717, right: 413, bottom: 730 },
 * [0-0]   { left: 159, top: 711, right: 362, bottom: 728 },
 * [0-0]   { left: 912, top: 652, right: 1144, bottom: 703 },
 * [0-0]   { left: 536, top: 652, right: 790, bottom: 701 },
 * [0-0]   { left: 377, top: 690, right: 415, bottom: 701 },
 * [0-0]   { left: 362, top: 690, right: 371, bottom: 700 },
 * [0-0]   { left: 159, top: 652, right: 356, bottom: 703 },
 * [0-0]   { left: 129, top: 529, right: 1236, bottom: 633 },
 * [0-0]   { left: 475, top: 457, right: 1046, bottom: 513 },
 * [0-0]   { left: 319, top: 470, right: 454, bottom: 513 },
 * [0-0]   { left: 387, top: 399, right: 514, bottom: 428 },
 * [0-0]   { left: 818, top: 398, right: 978, bottom: 422 },
 * [0-0]   { left: 527, top: 398, right: 807, bottom: 428 },
 * [0-0]   { left: 600, top: 143, right: 766, bottom: 338 },
 * [0-0]   { left: 25, top: 27, right: 56, bottom: 58 }
 * [0-0] ]
 * [0-0] Processing 150585 diff pixels
 * [0-0] Union operations started
 * [0-0] Union time: 155ms
 * [0-0] Grouping pixels into bounding boxes
 * [0-0] Grouping time: 19ms
 * [0-0] Total analysis time: 209ms
 * [0-0] Post-processing bounding boxes
 * [0-0] Post-processing time: 3ms
 * [0-0] Number merged: 24
 */

import logger from '@wdio/logger'
import type { Pixel, WicImageCompareOptions } from 'src/methods/images.interfaces.js'
import type { BoundingBox, DiffRegion, IgnoreBoxes } from './rectangles.interfaces.js'
import type { CompareData } from '../pixelmatch/compare.interfaces.js'
import { savePngBuffer } from './images.js'
import { compositeImage, createCanvas, encodeImage, setOpacity } from '../utils/imageUtils.js'
import { analyzeDiffRegions } from './analyzeDiffRegions.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:pixelDiffProcessing')

class DisjointSet {
    private parent: Map<string, string>
    private rank: Map<string, number>

    constructor() {
        this.parent = new Map()
        this.rank = new Map()
    }

    find(x: string): string {
        if (this.parent.get(x) !== x) {
            this.parent.set(x, this.find(this.parent.get(x) as string)) // Path compression
        }
        return this.parent.get(x) as string
    }

    union(x: string, y: string): void {
        const rootX = this.find(x)
        const rootY = this.find(y)

        if (rootX !== rootY) {
            const rankX = this.rank.get(rootX) || 0
            const rankY = this.rank.get(rootY) || 0

            if (rankX > rankY) {
                this.parent.set(rootY, rootX)
            } else if (rankX < rankY) {
                this.parent.set(rootX, rootY)
            } else {
                this.parent.set(rootY, rootX)
                this.rank.set(rootX, rankX + 1)
            }
        }
    }

    add(x: string): void {
        if (!this.parent.has(x)) {
            this.parent.set(x, x)
            this.rank.set(x, 0)
        }
    }
}

type RegionData = { box: BoundingBox; diffPixelCount: number; edgePixelRatio: number }

function mergeBoundingBoxes(regions: RegionData[], proximity: number): RegionData[] {
    log.info(`Merging bounding boxes started with a proximity of ${proximity} pixels`)
    const merged: RegionData[] = []

    while (regions.length) {
        const region = regions.pop()!
        let mergedWithAnotherBox = false

        for (let i = 0; i < regions.length; i++) {
            const other = regions[i]

            if (
                region.box.left <= other.box.right + proximity &&
                region.box.right >= other.box.left - proximity &&
                region.box.top <= other.box.bottom + proximity &&
                region.box.bottom >= other.box.top - proximity
            ) {
                regions.splice(i, 1)
                const totalPixels = region.diffPixelCount + other.diffPixelCount
                regions.push({
                    box: {
                        left: Math.min(region.box.left, other.box.left),
                        top: Math.min(region.box.top, other.box.top),
                        right: Math.max(region.box.right, other.box.right),
                        bottom: Math.max(region.box.bottom, other.box.bottom),
                    },
                    diffPixelCount: totalPixels,
                    edgePixelRatio: (
                        region.edgePixelRatio * region.diffPixelCount +
                        other.edgePixelRatio * other.diffPixelCount
                    ) / totalPixels,
                })
                mergedWithAnotherBox = true
                break
            }
        }

        if (!mergedWithAnotherBox) {
            merged.push(region)
        }
    }

    return merged
}

function processDiffPixels(diffPixels: Pixel[], proximity: number): RegionData[] {
    log.info('Processing diff pixels started')
    log.info(`Processing ${diffPixels.length} diff pixels`)

    // Calculate total pixels and diff percentage
    let maxX = 0
    let maxY = 0
    for (const pixel of diffPixels) {
        maxX = Math.max(maxX, pixel.x)
        maxY = Math.max(maxY, pixel.y)
    }
    const totalPixels = diffPixels.length > 0 ? (maxX + 1) * (maxY + 1) : 0
    const diffPercentage = totalPixels > 0 ? (diffPixels.length / totalPixels) * 100 : 0

    log.info(`Total pixels in image: ${totalPixels.toLocaleString()}`)
    log.info(`Number of diff pixels: ${diffPixels.length.toLocaleString()}`)
    log.info(`Diff percentage: ${diffPercentage.toFixed(2)}%`)

    // Fail fast if there are too many differences
    const MAX_DIFF_PERCENTAGE = 20 // 20% threshold
    const MAX_DIFF_PIXELS = 5000000 // 5M pixels threshold

    if (diffPercentage > MAX_DIFF_PERCENTAGE || diffPixels.length > MAX_DIFF_PIXELS) {
        log.error(`Too many differences detected! Diff percentage: ${diffPercentage.toFixed(2)}%, Diff pixels: ${diffPixels.length.toLocaleString()}`)
        log.error('This likely indicates a major visual difference or an issue with the comparison.')
        log.error('Consider checking if the baseline image is correct or if there are major UI changes.')

        return [{ box: { left: 0, top: 0, right: maxX, bottom: maxY }, diffPixelCount: diffPixels.length, edgePixelRatio: 0 }]
    }

    const totalStartTime = Date.now()

    const ds = new DisjointSet()
    const pixelMap = new Map<string, Pixel>()
    const directions = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
        { dx: -1, dy: 1 },
    ]

    // Initialize disjoint set and pixel map
    for (const pixel of diffPixels) {
        const key = `${pixel.x},${pixel.y}`
        ds.add(key)
        pixelMap.set(key, pixel)
    }

    log.info('Union operations started')
    const unionStartTime = Date.now()

    // Union pixels within the proximity range
    for (const pixel of diffPixels) {
        const key = `${pixel.x},${pixel.y}`
        for (const { dx, dy } of directions) {
            const neighborKey = `${pixel.x + dx},${pixel.y + dy}`
            if (pixelMap.has(neighborKey)) {
                ds.union(key, neighborKey)
            }
        }
    }
    log.info(`Union time: ${Date.now() - unionStartTime}ms`)

    log.info('Grouping pixels into bounding boxes')
    const groupingStartTime = Date.now()

    // Group pixels by their root
    const groups = new Map<string, Pixel[]>()
    for (const key of pixelMap.keys()) {
        const root = ds.find(key)
        if (!groups.has(root)) {
            groups.set(root, [])
        }
        groups.get(root)?.push(pixelMap.get(key) as Pixel)
    }

    // Calculate bounding boxes with per-group pixel counts and edge pixel ratio
    const edgeDirections = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
    const regions: RegionData[] = []
    for (const pixels of groups.values()) {
        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity
        let edgeCount = 0

        for (const pixel of pixels) {
            if (pixel.x < left) {left = pixel.x}
            if (pixel.y < top) {top = pixel.y}
            if (pixel.x > right) {right = pixel.x}
            if (pixel.y > bottom) {bottom = pixel.y}
            if (edgeDirections.some(({ dx, dy }) => !pixelMap.has(`${pixel.x + dx},${pixel.y + dy}`))) {
                edgeCount++
            }
        }

        regions.push({ box: { left, top, right, bottom }, diffPixelCount: pixels.length, edgePixelRatio: edgeCount / pixels.length })
    }

    log.info(`Grouping time: ${Date.now() - groupingStartTime}ms`)
    const totalAnalysisTime = Date.now() - totalStartTime
    log.info(`Total analysis time: ${totalAnalysisTime}ms`)

    // Post-process to merge nearby bounding boxes
    log.info('Post-processing bounding boxes')
    const postProcessStartTime = Date.now()

    const mergedRegions = mergeBoundingBoxes(regions, proximity)

    log.info(`Post-processing time: ${Date.now() - postProcessStartTime}ms`)
    log.info(`Number merged: ${mergedRegions.length}`)

    return mergedRegions
}

/**
 * Generate and save diff image with bounding boxes
 */
function formatRegionSummary(regions: DiffRegion[]): string {
    const lines = regions.map((r, i) => {
        const type = r.changeType.padEnd(12)
        const pattern = r.diffPattern.padEnd(13)
        const density = `${Math.round(r.density * 100)}%`.padStart(4)
        const score = `${r.perceptualScore}/100`.padStart(8)
        const flag = r.isVisuallySignificant ? 'SIGNIFICANT    ' : 'not significant'
        return ` Region ${i + 1}: type=${type} | pattern=${pattern} | density=${density} | score=${score} | ${flag}`
    })
    return lines.join('\n')
}

export async function generateAndSaveDiff(
    data: CompareData,
    imageCompareOptions: WicImageCompareOptions,
    ignoredBoxes: IgnoreBoxes[],
    diffFilePath: string,
    rawMisMatchPercentage: number
): Promise<{ diffBoundingBoxes: DiffRegion[]; storeDiffs: boolean; allDiffsInsignificant: boolean }> {
    const saveAboveTolerance = imageCompareOptions.saveAboveTolerance ?? 0
    const storeDiffs = rawMisMatchPercentage > saveAboveTolerance || process.argv.includes('--store-diffs')

    // Run analysis when the diff is in the "is this real?" band, or when JSON reports are enabled.
    const diffAnalysisThreshold = imageCompareOptions.diffAnalysisThreshold ?? 10
    const shouldRunAnalysis =
        (rawMisMatchPercentage > 0 && rawMisMatchPercentage < diffAnalysisThreshold) ||
        imageCompareOptions.createJsonReportFiles

    let diffBoundingBoxes: DiffRegion[] = []
    if (shouldRunAnalysis && data.diffPixels.length > 0) {
        const regions = processDiffPixels(data.diffPixels, imageCompareOptions.diffPixelBoundingBoxProximity)
        const actualPixels = data.getActualPixels()
        const baselinePixels = data.getBaselinePixels()
        diffBoundingBoxes = analyzeDiffRegions(regions, actualPixels.width, actualPixels.height, actualPixels, baselinePixels)
    }

    // allDiffsInsignificant is only true when analysis ran AND produced at least one region
    const allDiffsInsignificant =
        diffBoundingBoxes.length > 0 &&
        diffBoundingBoxes.every(r => !r.isVisuallySignificant)

    if (storeDiffs) {
        const isDifference = rawMisMatchPercentage > saveAboveTolerance
        const isDifferenceMessage = 'WARNING:\n There was a difference. Saved the difference to'
        const debugMessage = 'INFO:\n Debug mode is enabled. Saved the debug file to:'

        const rawDiff = data.getRawPixels()

        if (ignoredBoxes.length > 0) {
            for (const box of ignoredBoxes) {
                const overlay = createCanvas(box.right - box.left, box.bottom - box.top, 57, 170, 86, 255)
                setOpacity(overlay, 0.5)
                compositeImage(rawDiff, overlay, box.left, box.top)
            }
        }

        await savePngBuffer(encodeImage(rawDiff), diffFilePath)

        // Build the analysis block shown in the warning
        let analysisBlock = ''
        if (diffBoundingBoxes.length > 0) {
            analysisBlock = `\n\n Diff analysis — ${diffBoundingBoxes.length} region(s):\n${formatRegionSummary(diffBoundingBoxes)}`
            if (allDiffsInsignificant) {
                if (imageCompareOptions.ignoreVisuallyInsignificantDiffs) {
                    analysisBlock += '\n\n All diff regions are non-perceptible — result will be treated as 0% mismatch.'
                } else {
                    analysisBlock += '\n\n All diff regions appear to be rendering/anti-aliasing artifacts.'
                    analysisBlock += '\n Enable \'ignoreVisuallyInsignificantDiffs: true\' to auto-pass these diffs.'
                }
            }
        }

        log.warn(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 ${isDifference ? isDifferenceMessage : debugMessage}
 ${diffFilePath}${analysisBlock}
#####################################################################################`,
        )
    }

    return { diffBoundingBoxes, storeDiffs, allDiffsInsignificant }
}

export { processDiffPixels }
