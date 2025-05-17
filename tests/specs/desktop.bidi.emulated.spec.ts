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

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchFullPageSnapshot('bidiEmulatedFullPage')
    })
})
