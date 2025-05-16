import { browser, expect } from '@wdio/globals'

describe('@wdio/visual-service desktop bidi emulated', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    before(async function() {
        await browser.emulate('device', 'Galaxy S9 +')
    })

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('bidiEmulatedWdioLogo')
    })

    it.only(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchScreenSnapshot('bidiEmulatedViewportScreenshot')
    })

    // Disabled because of the issue with the full page screenshot for Bidi in emulated mode
    // It's not taking the full page screenshot, but stitching the images together in a wrong way
    // it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function() {
    //     await expect(browser).toMatchFullPageSnapshot('bidiEmulatedFullPage')
    // })
})
