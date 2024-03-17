import { browser, expect } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

describe('@wdio/visual-service check that multi remote is working', () => {
    const resolution = '1366x768'

    beforeEach(async () => {
        await multiremotebrowser.chromeBrowserOne.url('')
        await multiremotebrowser.chromeBrowserOne.pause(500)

        await multiremotebrowser.chromeBrowserTwo.url('')
        await multiremotebrowser.chromeBrowserTwo.pause(500)
    })

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(async () => {
        await multiremotebrowser.chromeBrowserOne.execute(
            'window.scrollTo(0, 0);',
            []
        )
        await multiremotebrowser.chromeBrowserTwo.execute(
            'window.scrollTo(0, 0);',
            []
        )
    })

    it('take a screenshot of each browser', async () => {
        const tag = 'homepage'
        const imageDataOne =
            await multiremotebrowser.chromeBrowserOne.saveScreen(tag)
        const imageDataTwo =
            await multiremotebrowser.chromeBrowserTwo.saveScreen(tag)

        const logNameOne =
            'wdio-ics:options' in
            multiremotebrowser.chromeBrowserOne.requestedCapabilities
                ? multiremotebrowser.chromeBrowserOne.requestedCapabilities[
                    'wdio-ics:options'
                // @ts-ignore
                ]?.logName
                : ''
        const filePathOne = `${imageDataOne.path}/${tag}-${logNameOne}-${resolution}.png`

        expect(fileExists(filePathOne)).toBe(true)

        const logNameTwo =
            'wdio-ics:options' in
            multiremotebrowser.chromeBrowserTwo.requestedCapabilities
                ? multiremotebrowser.chromeBrowserTwo.requestedCapabilities[
                    'wdio-ics:options'
                // @ts-ignore
                ]?.logName
                : ''
        const filePathTwo = `${imageDataTwo.path}/${tag}-${logNameTwo}-${resolution}.png`

        expect(fileExists(filePathTwo)).toBe(true)
    })

    it('take a screenshot of each browser using the global browser', async () => {
        const tag = 'homepage-multi'
        const imageDatasPromises = await browser.saveScreen(tag)

        const resolvedImageDatas = await Promise.all(Object.values(imageDatasPromises))
        const imageDatas = Object.fromEntries(Object.keys(imageDatasPromises).map((key, index) => [key, resolvedImageDatas[index]]))

        for (const [browserName, imageData] of Object.entries(imageDatas)) {
            // @ts-ignore
            const globalBrowser = global[browserName]

            const logName = 'wdio-ics:options' in globalBrowser.requestedCapabilities
                ? globalBrowser.requestedCapabilities['wdio-ics:options']?.logName
                : ''
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(true)
        }
    })
})
