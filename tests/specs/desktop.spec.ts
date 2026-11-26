import type { ImageCompareResult } from '@wdio/image-comparison-core'
import { browser, expect } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

const isBaselineSetup = process.env.BASELINE_SETUP === 'true'

describe('@wdio/visual-service desktop', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`
    // Desktop Safari puts the macOS window shadow in the first pixel row of a screenshot. The color of this row
    // is not the same on all LambdaTest machines (gray or black), so the screen comparisons do not compare it.
    const isSafari = `${browser.capabilities.browserName}`.toLowerCase() === 'safari'
    const getSafariWindowShadowBlockOut = async () => isSafari
        ? { blockOut: [{ x: 0, y: 0, width: await browser.execute(() => window.innerWidth), height: 1 }] }
        : {}

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        const scrollYBefore = await browser.execute(() => window.scrollY)
        await expect($('.hero__title-logo')).toMatchElementSnapshot('wdioLogo', {
            removeElements: [await $('nav.navbar')]
        })
        // The element screenshot scrolls the element into view, then it must scroll back, also to the top (#1229)
        await expect(await browser.execute(() => window.scrollY)).toEqual(scrollYBefore)
    })

    it(`should compare an element screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        await $('.features_vqN4').scrollIntoView()

        // Block 1 introduces visual differences to verify ignore regions. Skipped when BASELINE_SETUP=true.
        if (!isBaselineSetup) {
            await browser.execute(() => {
                document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
                    (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
                })
            })
        }

        await expect($('.features_vqN4')).toMatchElementSnapshot(
            'ignoredElementsElementScreenshot',
            {
                // Block 2 ignores the modified regions. Skipped when BASELINE_SETUP=true.
                ...(!isBaselineSetup ? {
                    ignore: [
                        await $$('.feature_G9wp h3'),
                    ],
                } : {}),
                hideElements: [await $('nav.navbar')]
            }
        )
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchScreenSnapshot('viewportScreenshot', await getSafariWindowShadowBlockOut())
    })

    it(`should compare a viewport screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        // Block 1 introduces visual differences to verify ignore regions. Skipped when BASELINE_SETUP=true.
        if (!isBaselineSetup) {
            await browser.execute(() => {
                document.querySelectorAll('.navbar__items--right a.navbar__item,  .feature_G9wp').forEach(link => {
                    (link as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
                })
            })
        }

        await expect(browser).toMatchScreenSnapshot(
            'ignoredElementsViewportScreenshot',
            {
                ...await getSafariWindowShadowBlockOut(),
                // Block 2 ignores the modified regions. Skipped when BASELINE_SETUP=true.
                ...(!isBaselineSetup ? {
                    ignore: [
                        await $$('.navbar__items--right a.navbar__item'),
                        await $$('.feature_G9wp'),
                    ],
                } : {}),
            }
        )
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function () {
        await expect(browser).toMatchFullPageSnapshot('fullPage', {
            ...await getSafariWindowShadowBlockOut(),
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should compare a full page screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        // Block 1 introduces visual differences to verify ignore regions. Skipped when BASELINE_SETUP=true.
        if (!isBaselineSetup) {
            await browser.execute(() => {
                document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
                    (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
                })
            })
        }

        await expect(browser).toMatchFullPageSnapshot('ignoredElementsFullPageScreenshot', {
            ...await getSafariWindowShadowBlockOut(),
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
            // Block 2 ignores the modified regions. Skipped when BASELINE_SETUP=true.
            ...(!isBaselineSetup ? {
                ignore: [
                    await $$('.feature_G9wp h3'),
                ],
            } : {}),
        })
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchTabbablePageSnapshot('tabbable', {
            ...await getSafariWindowShadowBlockOut(),
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should not store an actual image for '${browserName}' when the diff is below the threshold (#1115)`, async function () {
        const tag = 'noActualStoredOnDiff'

        // Introduces a small diff below the threshold. Skipped when BASELINE_SETUP=true.
        if (!isBaselineSetup) {
            await browser.execute(() => {
                const el = document.createElement('div')
                el.id = 'test-diff-element'
                el.style.cssText = 'position:fixed;top:10px;left:10px;width:500px;height:500px;background:red;z-index:9999;'
                document.body.appendChild(el)
            })
        }

        const result = await browser.checkScreen(tag, {
            returnAllCompareData: true,
        }) as ImageCompareResult

        if (!isBaselineSetup) {
            expect(result.misMatchPercentage).toBeGreaterThan(0)
            expect(result.misMatchPercentage).toBeLessThanOrEqual(70)
            expect(fileExists(result.folders.actual)).toBe(false)
        }
    })
})
