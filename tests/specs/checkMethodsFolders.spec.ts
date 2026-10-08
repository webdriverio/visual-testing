import { browser, expect } from '@wdio/globals'
import { join } from 'node:path'

describe('@wdio/visual-service check methods folder options', () => {
    const baselineFolder = 'sauce:options' in browser.capabilities
        ? 'tests/sauceLabsBaseline'
        : 'localBaseline'

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    // These tests check the folders, not the image. Each test saves its own baseline first, so it does not depend on
    // `autoSaveBaseline` (which is off in CI for the cloud configs)

    describe('checkFullPageScreen method with folder options', () => {
        it('should set all folders using method options', async () => {
            const testOptions = {
                actualFolder: join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: join(
                    process.cwd(),
                    `./${baselineFolder}/checkBaseline`
                ),
                diffFolder: join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true,
            }
            await browser.saveFullPageScreen('fullPageCheckFolders', {
                actualFolder: testOptions.baselineFolder,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
            })
            await browser.execute('window.scrollTo(0, 0);', [])
            const results: any = await browser.checkFullPageScreen(
                'fullPageCheckFolders',
                {
                    ...testOptions,
                    hideAfterFirstScroll: [
                        await $('nav.navbar'),
                    ],
                }
            )

            expect(results.folders.actual).toMatch(
                testOptions.actualFolder.replace('./', '')
            )

            expect(results.folders.baseline).toMatch(
                testOptions.baselineFolder.replace('./', '')
            )
            // expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        })
    })

    describe('checkScreen method with folder options', () => {
        it('should set all folders using checkScreen method options', async () => {
            const testOptions = {
                actualFolder: join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: join(
                    process.cwd(),
                    `./${baselineFolder}/checkBaseline`
                ),
                diffFolder: join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true,
            }
            await browser.saveScreen('screenCheckFolders', { actualFolder: testOptions.baselineFolder })
            const results: any = await browser.checkScreen(
                'screenCheckFolders',
                testOptions
            )

            expect(results.folders.actual).toMatch(
                testOptions.actualFolder.replace('./', '')
            )

            expect(results.folders.baseline).toMatch(
                testOptions.baselineFolder.replace('./', '')
            )
            // expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        })
    })

    describe('checkElement method with folder options', () => {
        it('should set all folders using checkElement method options', async () => {
            const testOptions = {
                actualFolder: join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: join(
                    process.cwd(),
                    `./${baselineFolder}/checkBaseline`
                ),
                diffFolder: join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true,
                removeElements: [await $('nav.navbar')],

            }
            await browser.saveElement(await $('.hero__title-logo'), 'elementCheckFolders', {
                actualFolder: testOptions.baselineFolder,
                removeElements: testOptions.removeElements,
            })
            const results: any = await browser.checkElement(
                await $('.hero__title-logo'),
                'elementCheckFolders',
                testOptions
            )

            expect(results.folders.actual).toMatch(
                testOptions.actualFolder.replace('./', '')
            )

            expect(results.folders.baseline).toMatch(
                testOptions.baselineFolder.replace('./', '')
            )
            //expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        })
    })
})
