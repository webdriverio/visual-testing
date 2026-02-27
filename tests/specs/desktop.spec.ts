import type { ImageCompareResult } from '@wdio/image-comparison-core'
import { browser, expect } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

describe('@wdio/visual-service desktop', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('wdioLogo', {
            removeElements: [await $('nav.navbar')]
        })
    })

    it.only(`should compare an element screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        await $('.features_vqN4').scrollIntoView()

        // When running a new set of images then first comment out block 1 and 2. Then run the test.
        // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
        // If so, then uncomment block 2 and check if pass with the same arguments.
        // Block 1
        // await browser.execute(() => {
        //     document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
        //         (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
        //     })
        // })

        await expect($('.features_vqN4')).toMatchElementSnapshot(
            'ignoredElementsElementScreenshot',
            {
                // Block 2
                // ignore: [
                //     await $$('.feature_G9wp h3'),
                // ],
                // Don't comment this out, it's needed to hide the navbar
                hideElements: [await $('nav.navbar')]
            }
        )
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchScreenSnapshot('viewportScreenshot')
    })

    it(`should compare a viewport screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        // When running a new set of images then first comment out block 1 and 2. Then run the test.
        // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
        // If so, then uncomment block 2 and check if pass with the same arguments.
        // Block 1
        await browser.execute(() => {
            document.querySelectorAll('.navbar__items--right a.navbar__item,  .feature_G9wp').forEach(link => {
                (link as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
            })
        })

        await expect(browser).toMatchScreenSnapshot(
            'ignoredElementsViewportScreenshot',
            {
                // Block 2
                ignore: [
                    await $$('.navbar__items--right a.navbar__item'),
                    await $$('.feature_G9wp'),
                ],
            }
        )
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function () {
        await expect(browser).toMatchFullPageSnapshot('fullPage', {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchTabbablePageSnapshot('tabbable', {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should not store an actual image for '${browserName}' when the diff is below the threshold (#1115)`, async function () {
        const tag = 'noActualStoredOnDiff'

        await browser.execute(() => {
            const el = document.createElement('div')
            el.id = 'test-diff-element'
            el.style.cssText = 'position:fixed;top:10px;left:10px;width:500px;height:500px;background:red;z-index:9999;'
            document.body.appendChild(el)
        })

        const result = await browser.checkScreen(tag, {
            returnAllCompareData: true,
        }) as ImageCompareResult

        expect(result.misMatchPercentage).toBeGreaterThan(0)
        expect(result.misMatchPercentage).toBeLessThanOrEqual(70)
        expect(fileExists(result.folders.actual)).toBe(false)
    })
})
