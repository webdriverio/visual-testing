import { browser, expect } from '@wdio/globals'

describe('@wdio/visual-service matcher', () => {
    // we don't run this test in multi remote mode
    const caps = browser.capabilities as WebdriverIO.Capabilities
    const browserName = `${caps.browserName}-${caps.browserVersion}`

    beforeEach(async () => {
        await browser.url('/')
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
})
