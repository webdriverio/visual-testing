import { browser } from '@wdio/globals'

describe('@wdio/visual-service:ocr desktop', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('https://webdriver.io/')
        await $('.hero__title').waitForDisplayed()
        // There is an issue with Safari 16 on Sauce Labs, it doesn't always load the page correctly
        // this suite retry should result in a successful test run, otherwise the specFileRetries will retry the whole file
        // in a new session
        if (browserName === 'safari-16') {
            // This is like firing with a bazooka, but it's the only way to make it work
            // @ts-ignore
            this.retries(5)
            // For some reason the safari 16 browser on Sauce Labs doesn't load the page correctly for the first try
            await browser.url('https://webdriver.io/')
            await $('.hero__title').waitForDisplayed()
        }
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should get text of an image based on OCR '${browserName}'`, async function() {
        const ocrText = await driver.ocrGetText({
            element: $('.hero__subtitle'),
        })

        expect(ocrText).toMatchSnapshot()
    })

    it(`should get the position of a text on the screen based on OCR '${browserName}'`, async function() {
        const elementPosition = await driver.ocrGetElementPositionByText({
            element: $('.DocSearch'),
            text: 'Search',
        })

        expect(elementPosition).toMatchSnapshot()
    })

    it(`should click on an element based on text on the screen based on OCR '${browserName}'`, async function() {
        await driver.ocrClickOnText({
            element: $('.DocSearch'),
            text: 'Search',
        })

        // This is to validate that the click actually worked and opened the search form
        const ocrText = await driver.ocrGetText({
            element: $('.DocSearch-Form')
        })

        expect(ocrText).toContain('docs')
    })

    it(`should set a value on an element based on text on the screen based on OCR '${browserName}'`, async function() {
        await driver.ocrClickOnText({
            element: $('.DocSearch'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            element: $('.DocSearch-Form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await driver.pause(1000)

        const ocrText = await driver.ocrGetText({ element: $('.DocSearch-Form') })
        console.log(ocrText)
        expect(ocrText).toContain('specfileretries')
    })

    it(`should wait on text on the screen based on OCR '${browserName}'`, async function() {
        await driver.ocrClickOnText({
            element: $('.DocSearch'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            element: $('.DocSearch-Form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await driver.ocrWaitForTextDisplayed({
            element: $('.DocSearch-Dropdown'),
            text: 'specFileRetries',
        })
    })
})
