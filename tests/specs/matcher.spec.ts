import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { browser, expect } from '@wdio/globals'

describe('@wdio/visual-service matcher', () => {
    // we don't run this test in multi remote mode
    const caps = browser.capabilities as WebdriverIO.Capabilities
    const browserName = `${caps.browserName}-${caps.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute(() => window.scrollTo(0, 0)))

    it(`should match an element successful with a baseline for '${browserName}'`, async () => {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('wdioLogo', 0, {
            removeElements: [await $('nav.navbar')]
        })
    })

    it(`should match a full page screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchFullPageSnapshot('fullPage', 0, {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should match a tabbable screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0, {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ]
        })
    })

    it(`should NOT save actual image when mismatch is within threshold (#1111) for '${browserName}'`, async () => {
        const tag = 'threshold-test-1111'
        const actualFolder = join(process.cwd(), '.tmp/actual')
        const subtitle = await $('.hero__subtitle')
        const getActualImageCount = () => {
            try {
                return readdirSync(actualFolder).filter(f => f.includes(tag)).length
            } catch {
                return 0
            }
        }

        // 1. Save the original subtitle as baseline
        await browser.saveElement(subtitle, tag)

        // 2. Manipulate the subtitle to create a small text difference
        await browser.execute(
            'arguments[0].innerHTML = "Test Demo Page";',
            subtitle
        )

        const beforeCount = getActualImageCount()

        // 3. Run the matcher with a threshold (90%) higher than the expected mismatch
        await expect(subtitle).toMatchElementSnapshot(tag, 90)

        const afterCount = getActualImageCount()

        // 4. With the fix: no new actual image should be saved when mismatch is within threshold
        expect(afterCount).toBe(beforeCount)
    })
})
