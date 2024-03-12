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

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // @ts-ignore
            this.retries(2)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect($('.hero__title-logo')).toMatchElementSnapshot('wdioLogo', {
            removeElements: [await $('nav.navbar')]
        })
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function() {
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // @ts-ignore
            this.retries(2)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect(browser).toMatchScreenSnapshot('viewportScreenshot')
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function() {
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // @ts-ignore
            this.retries(2)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect(browser).toMatchFullPageSnapshot('fullPage', {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async function() {
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // @ts-ignore
            this.retries(2)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }
        await expect(browser).toMatchTabbablePageSnapshot('tabbable', {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
            ],
        })
    })
})
