import { browser } from '@wdio/globals'

describe('@wdio/visual-service:ocr desktop', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should get text of an image based on OCR '${browserName}'`, async function() {
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // This is like firing with a bazooka, but it's the only way to make it work
            // @ts-ignore
            this.retries(5)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('')
            await $('.hero__title-logo').waitForDisplayed()
        }

        const ocrText = await driver.ocrGetText({ element: $('.hero__subtitle') })
        console.log('OCR Text:', ocrText)
    })
})
