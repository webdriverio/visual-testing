const fileExists = require('../helpers/fileExists')

describe('wdio-image-comparison-service basics', () => {
    const logName = browser.capabilities['sauce:options']
        ? browser.capabilities['sauce:options'].logName
        : browser.capabilities['wdio-ics:options']
        ? browser.capabilities['wdio-ics:options'].logName
        : browser.capabilities.logName
    const resolution = '1366x768'

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    describe('save methods', () => {
        it('should do a save screen', async () => {
            const tag = 'examplePage'
            const imageData = await browser.saveScreen('examplePage', {
                empty: null,
            })
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(
                true,
                `File : "${filePath}" could not be found`
            )
        })

        it('should do a save element', async () => {
            const tag = 'firstButtonElement'
            const imageData = await browser.saveElement(
                await $('.uk-button:nth-child(1)'),
                tag,
                { empty: null }
            )
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(
                true,
                `File : "${filePath}" could not be found`
            )
        })

        it('should save a fullpage screenshot', async () => {
            const tag = 'fullPage'
            const imageData = await browser.saveFullPageScreen(tag, {
                fullPageScrollTimeout: '1500',
            })
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`

            expect(fileExists(filePath)).toBe(
                true,
                `File : "${filePath}" could not be found`
            )
        })
    })

    describe('check methods', () => {
        it('should fail comparing with a baseline', async () => {
            const tag = 'examplePageFail'

            await browser.execute(
                'arguments[0].innerHTML = "Test Demo Page";',
                await $('h1.uk-heading-large')
            )

            await expect(await browser.checkScreen(tag)).toBeGreaterThan(0)
        })
    })
})
