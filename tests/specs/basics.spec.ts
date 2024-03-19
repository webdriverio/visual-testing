import { join } from 'node:path'
import { browser, expect } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

describe('@wdio/visual-service basics', () => {
    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    describe('save methods', () => {
        it('should do a save screen', async () => {
            const { fileName, path } = await browser.saveScreen('examplePage')
            const filePath = join(path as string, fileName as string)

            expect(fileExists(filePath)).toBe(true)
        })

        it('should do a save element', async () => {
            const { fileName, path } = await browser.saveElement(
                await $('.hero__title-logo'),
                'wdioLogo',
                {
                    removeElements: [await $('nav.navbar')]
                }
            )
            const filePath = join(path as string, fileName as string)

            expect(fileExists(filePath)).toBe(true)
        })

        it('should save a fullpage screenshot', async () => {
            const { fileName, path } = await browser.saveFullPageScreen('fullPage', {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
            })
            const filePath = join(path as string, fileName as string)

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

            await expect(await browser.checkScreen(tag, { enableLayoutTesting: false })).toBeGreaterThan(0)
        })
    })
})
