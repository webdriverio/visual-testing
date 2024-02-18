import { browser, expect } from '@wdio/globals'

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

    it(`should compare an element successful with a baseline for '${browserName}'`, async () => {
        // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
        if (browserName === 'safari-16') {
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect($('.hero__title-logo')).toMatchElementSnapshot('wdioLogo', {
            removeElements: [await $('nav.navbar')]
        })
    })

    it(`should compare an element layout successful with a baseline for '${browserName}'`, async () => {
        // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
        if (browserName === 'safari-16') {
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect($('nav.navbar')).toMatchElementSnapshot('wdioLayoutNavBar', {
            enableLayoutTesting: true,
        })
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchFullPageSnapshot('fullPage', {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should compare a full page layout screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchFullPageSnapshot('fullPageLayout', {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
            enableLayoutTesting: true,
        })
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchTabbablePageSnapshot('tabbable', {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should compare a tabbable layout screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(browser).toMatchTabbablePageSnapshot('tabbableLayout', {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
            enableLayoutTesting: true,
        })
    })
})
