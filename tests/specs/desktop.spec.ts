import { browser, expect } from '@wdio/globals'

describe('wdio-image-comparison-service desktop', () => {
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
        await expect(
            await browser.checkElement(
                await $('.hero__title-logo'),
                'wdioLogo',
                {
                    removeElements: [await $('nav.navbar')]
                }
            )
        ).toEqual(0)
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(
            await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                    await $('.DocSearch-Button'),
                ],
            })
        ).toEqual(0)
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(await browser.checkTabbablePage('tabbable', {
            hideAfterFirstScroll: [
                await $('nav.navbar'),
                await $('.DocSearch-Button'),
            ],
        })).toEqual(0)
    })
})
