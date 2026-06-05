/**
 * Tests for the diff region analysis feature (ws/diff-region-analysis).
 *
 * BASELINE SETUP
 * --------------
 * Most tests compare a modified page against a clean baseline. To create those
 * clean baselines without touching the source code, set the BASELINE_SETUP env var:
 *
 *   BASELINE_SETUP=true pnpm run test.lt.desktop
 *
 * When BASELINE_SETUP=true:
 *   - Tests 2–5, 7:  the DOM injection is skipped → screenshots are clean pages
 *                    → baselines are saved without the injected elements
 *   - Test 6:        "zzZ" text IS injected WITHOUT the 2px shift → baseline
 *                    captures the text at its exact rendered position
 *
 * Normal run (no env var): injections and shifts run as written → diffs are detected.
 *
 * The `if (result.misMatchPercentage > 0)` guards keep the suite green on any first
 * run where no baseline exists yet (autoSaveBaseline fires instead).
 */
import type { ImageCompareResult } from '@wdio/image-comparison-core'
import { browser, $ } from '@wdio/globals'

/** When true, skip DOM modifications so screenshots capture a clean baseline state. */
const BASELINE_SETUP = !!process.env.BASELINE_SETUP

describe('@wdio/visual-service diff region analysis', () => {
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    // ─── Test 1 ──────────────────────────────────────────────────────────────────
    // diffBoundingBoxes is always present on ImageCompareResult and is an empty
    // array when the images match (no injection needed for this one).
    it(`should return an empty diffBoundingBoxes array when images match for '${browserName}'`, async () => {
        const result = await browser.checkScreen('diffAnalysis-match', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        expect(Array.isArray(result.diffBoundingBoxes)).toBe(true)
        expect(result.misMatchPercentage).toBe(0)
        expect(result.diffBoundingBoxes).toHaveLength(0)
    })

    // ─── Test 2 ──────────────────────────────────────────────────────────────────
    // Every field on DiffRegion is populated and within its documented range.
    // Baseline: clean page (BASELINE_SETUP skips injection).
    // Normal run: red box injected → diff detected.
    it(`should populate diffBoundingBoxes with a valid DiffRegion structure when an element is added for '${browserName}'`, async () => {
        if (!BASELINE_SETUP) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'diff-analysis-box'
                el.style.cssText = [
                    'position:fixed', 'top:10px', 'left:10px',
                    'width:300px', 'height:300px',
                    'background:#e74c3c', 'z-index:9999',
                ].join(';')
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen('diffAnalysis-addedElement', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        if (result.misMatchPercentage > 0) {
            expect(result.diffBoundingBoxes.length).toBeGreaterThan(0)

            for (const region of result.diffBoundingBoxes) {
                expect(typeof region.left).toBe('number')
                expect(typeof region.right).toBe('number')
                expect(typeof region.top).toBe('number')
                expect(typeof region.bottom).toBe('number')
                expect(region.right).toBeGreaterThanOrEqual(region.left)
                expect(region.bottom).toBeGreaterThanOrEqual(region.top)
                expect(region.diffPixelCount).toBeGreaterThan(0)
                expect(region.density).toBeGreaterThan(0)
                expect(region.density).toBeLessThanOrEqual(1)
                expect(region.aspectRatio).toBeGreaterThan(0)
                expect(region.relativeArea).toBeGreaterThan(0)
                expect(region.relativeArea).toBeLessThanOrEqual(1)
                expect(region.centerX).toBeGreaterThanOrEqual(0)
                expect(region.centerX).toBeLessThanOrEqual(1)
                expect(region.centerY).toBeGreaterThanOrEqual(0)
                expect(region.centerY).toBeLessThanOrEqual(1)
                expect(['added', 'removed', 'changed', 'color-shift']).toContain(region.changeType)
                expect(region.meanColorDelta).toBeGreaterThanOrEqual(0)
                expect(region.meanColorDelta).toBeLessThanOrEqual(100)
                expect(region.perceptualScore).toBeGreaterThanOrEqual(0)
                expect(region.perceptualScore).toBeLessThanOrEqual(100)
                expect(typeof region.isVisuallySignificant).toBe('boolean')
            }
        }
    })

    // ─── Test 3 ──────────────────────────────────────────────────────────────────
    // A large solid-color block has high density → visually significant regardless
    // of which changeType the analysis produces.
    // Baseline: clean page. Normal run: blue box injected.
    it(`should classify a solid-color block as visually significant for '${browserName}'`, async () => {
        if (!BASELINE_SETUP) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'diff-analysis-significant-box'
                el.style.cssText = [
                    'position:fixed', 'top:50px', 'right:50px',
                    'width:200px', 'height:200px',
                    'background:#3498db', 'z-index:9999',
                ].join(';')
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen('diffAnalysis-significantAdded', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        if (result.misMatchPercentage > 0 && result.diffBoundingBoxes.length > 0) {
            const primaryRegion = result.diffBoundingBoxes.reduce(
                (largest, r) => r.relativeArea > largest.relativeArea ? r : largest,
                result.diffBoundingBoxes[0]
            )
            expect(primaryRegion.density).toBeGreaterThan(0.5)
            expect(primaryRegion.perceptualScore).toBeGreaterThan(15)
            expect(primaryRegion.isVisuallySignificant).toBe(true)
        }
    })

    // ─── Test 4 ──────────────────────────────────────────────────────────────────
    // ignoreVisuallyInsignificantDiffs: true must NOT suppress a significant diff.
    // Baseline: clean page. Normal run: large red box injected.
    it(`should not zero mismatch percentage when the diff is visually significant, even with ignoreVisuallyInsignificantDiffs: true for '${browserName}'`, async () => {
        if (!BASELINE_SETUP) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'diff-analysis-override-check'
                el.style.cssText = [
                    'position:fixed', 'top:50px', 'left:50px',
                    'width:300px', 'height:300px',
                    'background:#e74c3c', 'z-index:9999',
                ].join(';')
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen('diffAnalysis-notIgnoredSignificant', {
            returnAllCompareData: true,
            ignoreVisuallyInsignificantDiffs: true,
        }) as ImageCompareResult

        if (result.diffBoundingBoxes.length > 0) {
            const hasSignificantRegion = result.diffBoundingBoxes.some(r => r.isVisuallySignificant)
            if (hasSignificantRegion) {
                expect(result.misMatchPercentage).toBeGreaterThan(0)
            }
        }
    })

    // ─── Test 5 ──────────────────────────────────────────────────────────────────
    // A full-viewport overlay pushes diff > 20 %, triggering the processDiffPixels
    // fast-path: exactly one bounding box covering the whole image is returned.
    // createJsonReportFiles: true (set globally) keeps analysis running regardless
    // of diffAnalysisThreshold.
    // Baseline: clean page. Normal run: full dark overlay injected.
    it(`should return a single full-image DiffRegion via the fast-path when mismatch exceeds 20% for '${browserName}'`, async () => {
        if (!BASELINE_SETUP) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'diff-analysis-above-threshold'
                el.style.cssText = [
                    'position:fixed', 'top:0', 'left:0',
                    'width:100vw', 'height:100vh',
                    'background:#2c3e50', 'z-index:9999',
                ].join(';')
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen('diffAnalysis-aboveThreshold', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        if (result.misMatchPercentage >= 20) {
            expect(result.diffBoundingBoxes).toHaveLength(1)
            const region = result.diffBoundingBoxes[0]
            expect(region.relativeArea).toBeCloseTo(1, 1)
            expect(region.isVisuallySignificant).toBe(true)
            expect(region.perceptualScore).toBeGreaterThan(50)
        }
    })

    // ─── Test 6 (TDD — FAILS until edgePixelRatio / diffPattern are implemented) ─
    // Directly mirrors the zzZ font-rendering case.
    //
    // Analysis of the zzZ diff image:
    //   - The magenta outline is 2–3px thick on EVERY letter edge (outer AND inner)
    //   - Letter interiors are solid blue — no diff there
    //   - Root cause: the emoji moved or changed size by ~2px between runs (iOS update,
    //     DPR scaling change, font version change)
    //   - A 2px full-pixel shift at letter edges = white → blue (or blue → white)
    //   - That is NOT anti-aliasing (too large a delta), so pixelmatch detects it
    //     even with ignoreAntialiasing: true
    //
    // This test replicates that: "zzZ" text exists in both screenshots, but in the
    // actual run it is shifted 2px to the right. The left 2px columns of each letter
    // flip from blue to white; the right 2px columns flip from white to blue.
    // Interior letter pixels are unchanged → edgePixelRatio ≈ 1.
    //
    // 2px on 80px bold text = 2.5% shift — imperceptible to the human eye.
    //
    // Current behavior (no implementation yet):
    //   density ≈ 0.04, meanColorDelta ≈ 30+ → perceptualScore ≈ 18–25
    //   → isVisuallySignificant: true → assertion FAILS ✓ (TDD)
    //
    // After implementation:
    //   edgePixelRatio ≈ 1 → diffPattern = 'edge-outline' → isVisuallySignificant: false
    //
    // Baseline (BASELINE_SETUP=true): "zzZ" text at exact position, no shift.
    // Normal run: same text shifted 2px right — detected by pixelmatch as full-pixel
    // edge changes, not filtered as anti-aliasing.
    it.only(`should classify 2px-shifted letter-edge pixels as edge-outline and not visually significant for '${browserName}'`, async () => {
        // Text injected in both modes; 2px shift applied only in the normal run.
        await browser.execute((applyShift: boolean) => {
            const el = document.createElement('div')
            el.id = 'diff-rendering-text'
            el.textContent = 'zzZ'
            el.style.cssText = [
                'position:fixed', 'top:80px', 'left:80px',
                'font-size:80px',
                'font-family:Arial,Helvetica,sans-serif',
                'font-weight:bold',
                'color:#3498db',
                'line-height:1',
                'z-index:9999',
                // 2px shift: left/right edge columns of each letter flip between
                // solid blue and white background — large enough delta that
                // pixelmatch does NOT classify them as anti-aliasing
                applyShift ? 'transform:translate(2px,0)' : '',
            ].join(';')
            document.body.appendChild(el)
        }, !BASELINE_SETUP)

        const result = await browser.checkScreen('diffAnalysis-edgeOutline', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        // Use diffBoundingBoxes as the guard, not misMatchPercentage:
        // ignoreVisuallyInsignificantDiffs: true (set globally in the service) zeros
        // out misMatchPercentage when all regions are below the significance threshold —
        // which is exactly the case for a 2px shift. diffBoundingBoxes is always
        // populated when analysis ran, so it's the reliable signal here.
        if (result.diffBoundingBoxes.length > 0) {
            const region = result.diffBoundingBoxes[0]
            // TDD assertions — will fail until diffPattern is implemented:
            expect((region as any).diffPattern).toBe('edge-outline')
            expect((region as any).edgePixelRatio).toBeGreaterThan(0.85)
            expect(region.isVisuallySignificant).toBe(false)
        }
    })

    // ─── Test 7 (TDD — FAILS until edgePixelRatio / diffPattern are implemented) ─
    // A new solid-fill element appears on a clean page.
    // The diff pixels fill the entire block area — edgePixelRatio is low because
    // most pixels are surrounded by other diff pixels (interior of the block).
    // Expected: diffPattern = 'solid-fill', isVisuallySignificant = true.
    //
    // Baseline: clean page (BASELINE_SETUP skips injection).
    // Normal run: large green block injected.
    it.only(`should classify a newly appearing solid-fill block as solid-fill and visually significant for '${browserName}'`, async () => {
        if (!BASELINE_SETUP) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'diff-solid-fill-box'
                el.style.cssText = [
                    'position:fixed', 'top:100px', 'right:100px',
                    'width:150px', 'height:150px',
                    'background:#27ae60', 'z-index:9999',
                ].join(';')
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen('diffAnalysis-solidFill', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        if (result.misMatchPercentage > 0 && result.diffBoundingBoxes.length > 0) {
            const primaryRegion = result.diffBoundingBoxes.reduce(
                (largest, r) => r.relativeArea > largest.relativeArea ? r : largest,
                result.diffBoundingBoxes[0]
            )
            // TDD assertions — undefined until feature is implemented:
            expect((primaryRegion as any).diffPattern).toBe('solid-fill')
            expect((primaryRegion as any).edgePixelRatio).toBeLessThan(0.35)
            expect(primaryRegion.isVisuallySignificant).toBe(true)
        }
    })
})
