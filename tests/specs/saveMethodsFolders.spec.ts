import { browser, expect } from '@wdio/globals'
import { join } from 'node:path'

describe('@wdio/visual-service save methods folder options', () => {
    const testOptions = {
        returnAllCompareData: true,
        actualFolder: join(process.cwd(), './.tmp/saveActual'),
        testFolder: './.tmp',
    }

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    describe('saveFullPageScreen method with folder options', () => {
        it('should set folders using method options', async () => {
            const results = await browser.saveFullPageScreen(
                'saveFullPageFolderOptions',
                {
                    ...testOptions,
                    hideAfterFirstScroll: [
                        await $('nav.navbar'),
                    ],
                }
            )

            expect(results.path).toMatch(
                testOptions.actualFolder.replace('./', '')
            )
        })

        it('should set folders using default options', async () => {
            const results = await browser.saveFullPageScreen(
                'saveFullPageDefaultOptions',
                {
                    hideAfterFirstScroll: [
                        await $('nav.navbar'),
                    ],
                }
            )

            expect(results.path).toMatch('.tmp')
        })
    })

    describe('saveScreen method with folder options', () => {
        it('should set folders using saveScreen method options', async () => {
            const results = await browser.saveScreen(
                'saveScreenFolderOptions',
                testOptions
            )

            expect(results.path).toMatch(
                testOptions.actualFolder.replace('./', '')
            )
        })

        it('should set folders using saveScreen default options', async () => {
            const results = await browser.saveScreen(
                'saveScreenDefaultOptions',
                {}
            )

            expect(results.path).toMatch('.tmp')
        })
    })

    describe('saveElement method with folder options', () => {
        it('should set folders using saveElement method options', async () => {
            const results = await browser.saveElement(
                await $('.hero__title-logo'),
                'saveElementFolderOptions',
                {
                    ...testOptions,
                    removeElements: [await $('nav.navbar')],
                }
            )

            expect(results.path).toMatch(
                testOptions.actualFolder.replace('./', '')
            )
        })

        it('should set folders using saveElement default options', async () => {
            const results = await browser.saveElement(
                await $('.hero__title-logo'),
                'saveElementDefaultOptions',
                {
                    removeElements: [await $('nav.navbar')]
                }
            )

            expect(results.path).toMatch('.tmp')
        })
    })
})
