import { browser, expect } from '@wdio/globals'

describe('@wdio/visual-service desktop bidi emulated', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('bidiEmulatedWdioLogo')
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function () {
        await expect(browser).toMatchScreenSnapshot('bidiEmulatedViewportScreenshot')
    })

    // NOTE: Bidi screenshots are not supported in emulated mode, it will fallback to the legacy API automatically
    // This is a bug in the bidi protocol, it should be fixed in the future
    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchFullPageSnapshot('bidiLegacyEmulatedFullPage', { hideAfterFirstScroll: [await $('nav.navbar')] })
    })

    it(`should compare an element successful with a baseline for '${browserName}' with the legacy API`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('legacyEmulatedWdioLogo', {
            enableLegacyScreenshotMethod: true,
            // We need to remove the navbar otherwise it will be in the screenshot
            removeElements: [await $('nav.navbar')]
        })
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}' with the legacy API`, async function () {
        await expect(browser).toMatchScreenSnapshot('legacyEmulatedViewportScreenshot', { enableLegacyScreenshotMethod: true })
    })
})
