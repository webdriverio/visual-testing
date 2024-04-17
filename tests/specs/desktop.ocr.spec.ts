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
            element: $('.hero__subtitle'),
        })

        expect(ocrText).toMatchSnapshot()
    })

    it('should get the position of a text on the screen based on OCR', async function() {
        const elementPosition = await driver.ocrGetElementPositionByText({
            element: $('.DocSearch'),
            text: 'Search',
        })

        expect(elementPosition).toMatchSnapshot()
    })

    it('should click on an element based on text on the screen based on OCR', async function() {
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

    it('should click on an element based on text on the screen based on OCR with relative position data', async function () {
        await driver.ocrClickOnText({
            element: $('.buttons_pzbO > a:nth-child(2)'),
            text: 'WebdriverIO?',
            relativePosition: {
                left: 150,
            }
        })

        await expect(browser).toHaveUrl('https://webdriver.io/docs/gettingstarted')
    })

    it('should set a value on an element based on text on the screen based on OCR', async function() {
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
        expect(ocrText).toContain('specfileretries')
    })

    it.only('should wait on text on the screen based on OCR', async function() {
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
