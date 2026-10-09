import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { browser } from '@wdio/globals'

// A local page with a committed font, so the OCR results are the same on every machine and in CI.
// The cloud OCR job runs desktop.ocr.spec.ts on a website, because a cloud browser can not open a local file.
const fixture = (name: string) => pathToFileURL(join(process.cwd(), 'tests/fixtures/ocr', name)).href

describe('@wdio/visual-service:ocr desktop on a local page', () => {
    beforeEach(async () => {
        await browser.url(fixture('index.html'))
        // Without the committed font, the OCR would read the fallback font of the machine
        await browser.waitUntil(
            // load() returns no font face when the font file can not be loaded
            () => browser.execute(async () => (await document.fonts.load('24px "IBM Plex Sans"')).length > 0),
            { timeoutMsg: 'The IBM Plex Sans font of the OCR fixture did not load' },
        )
    })

    it('should get text of an image based on OCR', async function() {
        const ocrText = await driver.ocrGetText({
            haystack: $('.subtitle'),
        })

        expect(ocrText).toMatch(/^Next-gen browser and mobile automation test framework for Node[.,]js$/)
    })

    it('should get the position of matching text on the screen based on OCR', async function () {
        const string = 'Search'
        const elementPosition = await driver.ocrGetElementPositionByText({
            haystack: $('.search-button'),
            text: string,
        })
        const position = {
            left: expect.any(Number),
            top: expect.any(Number),
            right: expect.any(Number),
            bottom: expect.any(Number),
        }

        expect(elementPosition.filePath).toMatch(/desktop-\d+\.png$/)
        expect(elementPosition.dprPosition).toEqual(expect.objectContaining(position))
        expect(elementPosition.originalPosition).toEqual(expect.objectContaining(position))
        expect(elementPosition.matchedString).toEqual(string)
        expect(elementPosition.score).toEqual(100)
        expect(elementPosition.searchValue).toEqual(string)
    })

    it('should click on a button based on text inside of a haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.search-button'),
            text: 'Search',
        })

        // The click opens the search form
        await expect($('.search-form')).toBeDisplayed()
        const ocrText = await driver.ocrGetText({
            haystack: $('.search-form'),
        })
        expect(ocrText).toContain('docs')
    })

    it('should click on a button based on text inside of a haystack of an element with relative position data', async function () {
        // The center of "WebdriverIO?" minus 250 pixels is on the "Get Started" button, at the left
        await driver.ocrClickOnText({
            haystack: $('.why'),
            text: 'WebdriverIO?',
            relativePosition: {
                left: 250,
                above: 10,
            },
        })

        await expect(browser).toHaveUrl(fixture('get-started.html'))
    })

    it('should click on a button based on text inside of a haystack of coordinates', async function () {
        // The coordinates of the "Why WebdriverIO?" button, see .why in style.css
        await driver.ocrClickOnText({
            haystack: { x: 600, y: 410, width: 264, height: 84 },
            text: 'WebdriverIO?',
        })

        await expect(browser).toHaveUrl(fixture('why-webdriverio.html'))
    })

    it('should set a value in an input field based on finding text inside of a haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.search-button'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            haystack: $('.search-form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await expect($('.search-form input')).toHaveValue('specfileretries')
        const ocrText = await driver.ocrGetText({ haystack: $('.search-form') })
        expect(ocrText).toContain('specfileretr')
    })

    it('should wait on text inside of a haystack that is an element', async function() {
        await driver.ocrClickOnText({
            haystack: $('.search-button'),
            text: 'Search',
        })

        await driver.ocrSetValue({
            haystack: $('.search-form'),
            text: 'docs',
            value: 'specfileretries',
        })

        await driver.ocrWaitForTextDisplayed({
            haystack: $('.search-results'),
            text: 'specFileRetries',
        })
    })
})
