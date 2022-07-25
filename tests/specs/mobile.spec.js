/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('wdio-image-comparison-service mobile', () => {
    beforeEach(async () => {
        await browser.url('')
        await $('.uk-button:nth-child(1)').waitForDisplayed()
        await browser.pause(3000)
    })

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(
        async () => await browser.executeScript('window.scrollTo(0, 0);', [])
    )

    describe('compare element', () => {
        it('should compare successful with a baseline', async () => {
            await expect(
                await browser.checkElement(
                    await $('.uk-button:nth-child(1)'),
                    'firstButtonElement'
                )
            ).toEqual(0)
        })
    })

    describe('compare full page', () => {
        it('should compare successful with a mobile baseline', async () => {
            await expect(
                await browser.checkFullPageScreen('fullPage', {
                    fullPageScrollTimeout: '1500',
                })
            ).toEqual(0)
        })
    })
})
