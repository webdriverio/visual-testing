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

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchScreenSnapshot('viewportScreenshot')
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

    it(`should not store an actual image for '${browserName}' when the diff is below the threshold`, async function() {
        const result = await browser.checkScreen('examplePageFail', {
            returnAllCompareData: true,
        }) as ImageCompareResult

        expect(result.misMatchPercentage).toBeLessThanOrEqual(50)
        expect(fileExists(result.folders.actual)).toBe(false)
    })
})
