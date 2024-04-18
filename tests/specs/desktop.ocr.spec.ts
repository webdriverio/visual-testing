import { browser } from '@wdio/globals'

describe('@wdio/visual-service:ocr desktop', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io/')
        await $('.hero__title').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it('should get text of an image based on OCR', async function() {
        const ocrText = await driver.ocrGetText({
            haystack: $('.hero__subtitle'),
        })

        expect(ocrText).toMatchSnapshot()
    })

    it('should get the position of matching text on the screen based on OCR', async function() {
        const elementPosition = await driver.ocrGetElementPositionByText({
            haystack: $('.DocSearch'),
            text: 'Search',
        })

        expect(elementPosition).toMatchSnapshot()
    })

    it('should click on an input field based on text inside of an haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.DocSearch'),
            text: 'Search',
        })

        // This is to validate that the click actually worked and opened the search form
        const ocrText = await driver.ocrGetText({
            haystack: $('.DocSearch-Form')
        })

        expect(ocrText).toContain('docs')
    })

    it('should click click on a button based on text inside of a haystack of an element with relative position data', async function () {
        await driver.ocrClickOnText({
            haystack: $('.buttons_pzbO > a:nth-child(2)'),
            text: 'WebdriverIO?',
            relativePosition: {
                left: 150,
            }
        })

        await expect(browser).toHaveUrl('https://webdriver.io/docs/gettingstarted')
    })

    it('should click on a button based on text inside of a haystack of coordinates', async function () {
        await driver.ocrClickOnText({
            contrast: 1,
            haystack: { height: 44, width: 1108, x: 129, y: 590 },
            text: 'WebdriverIO?',
        })

        await expect(browser).toHaveUrl('https://webdriver.io/docs/why-webdriverio')
    })

    it('should set a value in an input field based on finding text inside of a haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.DocSearch'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            haystack: $('.DocSearch-Form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await driver.pause(1000)

        const ocrText = await driver.ocrGetText({ haystack: $('.DocSearch-Form') })
        expect(ocrText).toContain('specfileretries')
    })

    it('should wait on text inside of a haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.DocSearch'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            haystack: $('.DocSearch-Form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await driver.ocrWaitForTextDisplayed({
            haystack: $('.DocSearch-Dropdown'),
            text: 'specFileRetries',
        })
    })
})
