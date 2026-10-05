import { browser, expect, multiRemoteBrowser } from '@wdio/globals'
import { fileExists } from '../helpers/fileExists.ts'

describe('@wdio/visual-service check that multi remote is working', () => {
    const resolution = '1366x768'
    // WebdriverIO v10 does not store the instances as properties of the multiremote browser
    const getChromeBrowserOne = () => multiRemoteBrowser.getInstance('chromeBrowserOne')
    const getChromeBrowserTwo = () => multiRemoteBrowser.getInstance('chromeBrowserTwo')

    beforeEach(async () => {
        await getChromeBrowserOne().url('')
        await getChromeBrowserOne().pause(500)

        await getChromeBrowserTwo().url('')
        await getChromeBrowserTwo().pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => {
        await getChromeBrowserOne().execute(
            'window.scrollTo(0, 0);',
            []
        )
        await getChromeBrowserTwo().execute(
            'window.scrollTo(0, 0);',
            []
        )
    })

    it('take a screenshot of each browser', async () => {
        const tag = 'homepage'
        const imageDataOne =
            await getChromeBrowserOne().saveScreen(tag)
        const imageDataTwo =
            await getChromeBrowserTwo().saveScreen(tag)

        const logNameOne =
            'wdio-ics:options' in
            getChromeBrowserOne().requestedCapabilities
                ? getChromeBrowserOne().requestedCapabilities[
                    'wdio-ics:options'
                // @ts-ignore
                ]?.logName
                : ''
        const filePathOne = `${imageDataOne.path}/${tag}-${logNameOne}-${resolution}.png`

        expect(fileExists(filePathOne)).toBe(true)

        const logNameTwo =
            'wdio-ics:options' in
            getChromeBrowserTwo().requestedCapabilities
                ? getChromeBrowserTwo().requestedCapabilities[
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

    // https://github.com/webdriverio/visual-testing/issues/1238
    describe('element commands and matchers', () => {
        const selector = '.hero__title-logo'

        it('compares a multiremote element on each instance with the matcher', async () => {
            await expect(multiRemoteBrowser.$(selector)).toMatchElementSnapshot('multiremote-element', 0)
        })

        it('compares the element of one instance with the matcher', async () => {
            await expect(getChromeBrowserOne().$(selector)).toMatchElementSnapshot('instance-element', 0)
        })

        it('runs the multiremote element command on each instance with the element of that instance', async () => {
            const results = await multiRemoteBrowser.checkElement(await multiRemoteBrowser.$(selector), 'multiremote-check-element', {})

            expect(results).toEqual({ chromeBrowserOne: 0, chromeBrowserTwo: 0 })
        })

        it('runs the element command of one instance on that instance only', async () => {
            const imageData = await getChromeBrowserTwo().saveElement(await getChromeBrowserTwo().$(selector), 'instance-save-element')

            // The multiremote command gives the image data of each instance, the command of an instance gives one
            expect(imageData.fileName).toBe(`instance-save-element-chrome-latest-two-${resolution}.png`)
        })
    })
})
