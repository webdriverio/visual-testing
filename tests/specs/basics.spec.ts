import { browser, expect } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

describe('wdio-image-comparison-service basics', () => {
    let logName: string
    const resolution = '1366x768'

    before(() => {
        logName =
            'wdio-ics:options' in browser.requestedCapabilities
                ? // @ts-ignore
                browser.requestedCapabilities['wdio-ics:options']?.logName
                : ''
    })

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    describe('save methods', () => {
        it('should do a save screen', async () => {
            const tag = 'examplePage'
            const imageData = await browser.saveScreen('examplePage')
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(true)
        })

        it('should do a save element', async () => {
            const tag = 'wdioLogo'
            const imageData = await browser.saveElement(
                await $('.hero__title-logo'),
                tag,
                {
                    removeElements: [await $('nav.navbar')]
                }
            )
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(true)
        })

        it('should save a fullpage screenshot', async () => {
            const tag = 'fullPage'
            const imageData = await browser.saveFullPageScreen(tag, {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
            })
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(true)
        })
    })

    describe('check methods', () => {
        it('should fail comparing with a baseline', async () => {
            const tag = 'examplePageFail'

            await browser.execute(
                'arguments[0].innerHTML = "Test Demo Page";',
                await $('.hero__subtitle')
            )

            await expect(await browser.checkScreen(tag)).toBeGreaterThan(0)
        })
    })
})
