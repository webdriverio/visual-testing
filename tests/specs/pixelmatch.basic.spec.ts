import { browser, expect } from '@wdio/globals'
import {
    checkPixelmatchFixture,
    checkPixelmatchFixtureWithData,
    findPngPixelsMatchingColor,
    forgivingIncludeAaPixelmatchOptions,
    forgivingThresholdPixelmatchOptions,
    getDiffPath,
    isPixelmatchBaselineSetup,
    readPngPixel,
    setupPixelmatchFixture,
    strictPixelmatchOptions,
} from '../helpers/pixelmatchFixture.ts'

/**
 * LambdaTest-only pixelmatch option checks.
 *
 * Workflow:
 * 1. pnpm build
 * 2. BASELINE_SETUP=true LT_ENV=desktop pnpm test.lambdatest.desktop --spec ./tests/specs/pixelmatch.basic.spec.ts
 *    Creates baselines from the clean fixture (no DOM delta).
 * 3. LT_ENV=desktop pnpm test.lambdatest.desktop --spec ./tests/specs/pixelmatch.basic.spec.ts
 *    Strict checks expect a mismatch; forgiving method pixelmatch checks expect 0.
 *
 * Re-run step 2 after fixture changes. Delete any baselines that were auto-saved from a delta run before copying.
 *
 * Not covered here (unit tests only):
 * - `alpha` — forwarded to pixelmatch in compareImages.test.ts; it only affects grayscale
 *   blending for similar pixels inside pixelmatch, and saved diffs composite non-highlight
 *   pixels from the actual screenshot, so E2E cannot observe a meaningful alpha difference.
 * - `checkerboard` — forwarded to pixelmatch in compareImages.test.ts; it only changes how
 *   semi-transparent pixels are compared internally, which needs controlled fixture pixels
 *   rather than a remote browser canvas.
 * - `ignore*` exclusivity, service-level compareOptions, and option merge — options.test.ts
 *   and executeImageCompare.test.ts.
 */
describe('@wdio/visual-service pixelmatch compare options', () => {
    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    describe('threshold', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('threshold', !isPixelmatchBaselineSetup)
        })

        it('fails with strict method pixelmatch threshold', async () => {
            const mismatch = await checkPixelmatchFixture('pixelmatch-threshold-strict', {
                pixelmatch: strictPixelmatchOptions,
            })

            if (isPixelmatchBaselineSetup) {
                expect(mismatch).toBe(0)
                return
            }

            expect(mismatch).toBeGreaterThan(0)
        })

        it('passes when method pixelmatch threshold forgives the delta', async () => {
            const mismatch = await checkPixelmatchFixture('pixelmatch-threshold', {
                pixelmatch: forgivingThresholdPixelmatchOptions,
            })

            expect(mismatch).toBe(0)
        })
    })

    describe('includeAA', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('includeAA', !isPixelmatchBaselineSetup)
        })

        it('fails when method pixelmatch counts anti-aliasing pixels', async () => {
            const mismatch = await checkPixelmatchFixture('pixelmatch-includeAA-strict', {
                pixelmatch: strictPixelmatchOptions,
            })

            if (isPixelmatchBaselineSetup) {
                expect(mismatch).toBe(0)
                return
            }

            expect(mismatch).toBeGreaterThan(0)
        })

        it('passes when method pixelmatch forgives anti-aliasing pixels', async () => {
            const mismatch = await checkPixelmatchFixture('pixelmatch-includeAA', {
                pixelmatch: forgivingIncludeAaPixelmatchOptions,
            })

            expect(mismatch).toBe(0)
        })
    })

    describe('diffColor', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('colorDiff', !isPixelmatchBaselineSetup)
        })

        it('uses method pixelmatch diffColor in the saved diff image', async () => {
            const diffColor: [number, number, number] = [255, 0, 0]
            const result = await checkPixelmatchFixtureWithData('pixelmatch-diffColor', {
                pixelmatch: {
                    ...strictPixelmatchOptions,
                    diffColor,
                    aaColor: diffColor,
                    diffColorAlt: diffColor,
                },
            })

            if (isPixelmatchBaselineSetup) {
                expect(result.misMatchPercentage).toBe(0)
                return
            }

            expect(result.misMatchPercentage).toBeGreaterThan(0)
            expect(findPngPixelsMatchingColor(getDiffPath(result), diffColor).length).toBeGreaterThan(0)
        })
    })

    describe('aaColor', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('includeAA', !isPixelmatchBaselineSetup)
        })

        it('uses method pixelmatch aaColor in the saved diff image', async () => {
            const aaColor: [number, number, number] = [0, 255, 0]
            const diffColor: [number, number, number] = [255, 0, 0]
            const result = await checkPixelmatchFixtureWithData('pixelmatch-aaColor', {
                pixelmatch: {
                    ...strictPixelmatchOptions,
                    diffColor,
                    aaColor,
                    diffColorAlt: diffColor,
                },
            })

            if (isPixelmatchBaselineSetup) {
                expect(result.misMatchPercentage).toBe(0)
                return
            }

            expect(result.misMatchPercentage).toBeGreaterThan(0)

            const diffPath = getDiffPath(result)
            const aaMatches = findPngPixelsMatchingColor(diffPath, aaColor)
            const diffMatches = findPngPixelsMatchingColor(diffPath, diffColor)
            expect(aaMatches.length + diffMatches.length).toBeGreaterThan(0)
        })
    })

    describe('diffColorAlt', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('twoToneSwap', !isPixelmatchBaselineSetup)
        })

        it('uses method pixelmatch diffColorAlt in the saved diff image', async () => {
            const diffColor: [number, number, number] = [255, 0, 0]
            const diffColorAlt: [number, number, number] = [0, 0, 255]
            const result = await checkPixelmatchFixtureWithData('pixelmatch-diffColorAlt', {
                pixelmatch: {
                    ...strictPixelmatchOptions,
                    diffColor,
                    aaColor: diffColor,
                    diffColorAlt,
                },
            })

            if (isPixelmatchBaselineSetup) {
                expect(result.misMatchPercentage).toBe(0)
                return
            }

            expect(result.misMatchPercentage).toBeGreaterThan(0)
            const diffPath = getDiffPath(result)
            expect(findPngPixelsMatchingColor(diffPath, diffColor).length).toBeGreaterThan(0)
            expect(findPngPixelsMatchingColor(diffPath, diffColorAlt).length).toBeGreaterThan(0)
        })
    })

    describe('diffMask', () => {
        beforeEach(async () => {
            await setupPixelmatchFixture('diffMask', !isPixelmatchBaselineSetup)
        })

        it('uses raw pixelmatch output when method pixelmatch diffMask is true', async () => {
            const diffColor: [number, number, number] = [255, 0, 255]
            const compositedResult = await checkPixelmatchFixtureWithData('pixelmatch-diffMask-false', {
                pixelmatch: {
                    ...strictPixelmatchOptions,
                    diffColor,
                    aaColor: diffColor,
                    diffColorAlt: diffColor,
                    diffMask: false,
                },
            })
            const maskedResult = await checkPixelmatchFixtureWithData('pixelmatch-diffMask-true', {
                pixelmatch: {
                    ...strictPixelmatchOptions,
                    diffColor,
                    aaColor: diffColor,
                    diffColorAlt: diffColor,
                    diffMask: true,
                },
            })

            if (isPixelmatchBaselineSetup) {
                expect(compositedResult.misMatchPercentage).toBe(0)
                expect(maskedResult.misMatchPercentage).toBe(0)
                return
            }

            expect(compositedResult.misMatchPercentage).toBeGreaterThan(0)
            expect(maskedResult.misMatchPercentage).toBeGreaterThan(0)

            const backgroundSample = { x: 60, y: 60 }
            const compositedBackground = readPngPixel(getDiffPath(compositedResult), backgroundSample.x, backgroundSample.y)
            const maskedBackground = readPngPixel(getDiffPath(maskedResult), backgroundSample.x, backgroundSample.y)

            expect(compositedBackground[0]).toBeGreaterThan(200)
            expect(maskedBackground.slice(0, 3)).toEqual([0, 0, 0])
        })
    })
})
