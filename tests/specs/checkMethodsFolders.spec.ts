import { browser, expect } from '@wdio/globals'
import { join } from 'node:path'

describe('wdio-image-comparison-service check methods folder options', () => {
    const baselineFolder = 'sauce:options' in browser.capabilities
        ? 'tests/sauceLabsBaseline'
        : 'localBaseline'

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

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
            const results = await browser.checkFullPageScreen(
                'fullPageCheckFolders',
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
            const results = await browser.checkScreen(
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
            }
            const results = await browser.checkElement(
                await $('.uk-button:nth-child(1)'),
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
