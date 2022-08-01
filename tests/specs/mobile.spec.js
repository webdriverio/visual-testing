/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('wdio-image-comparison-service mobile', () => {
    const deviceName = driver.capabilities.deviceName
    const orientation = driver.capabilities.orientation

    beforeEach(async () => {
        await browser.url('')
        await $('.uk-button:nth-child(1)').waitForDisplayed()
        await browser.pause(3000)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(
        async () => await browser.executeScript('window.scrollTo(0, 0);', [])
    )

    it(`should compare a screen successful for '${deviceName}' in ${orientation}-mode`, async () => {
        await expect(await browser.checkScreen('screenshot')).toEqual(0)
    })

    it(`should compare an element successful for '${deviceName}' in ${orientation}-mode`, async () => {
        await expect(
            await browser.checkElement(
                await $('.uk-button:nth-child(1)'),
                'firstButtonElement'
            )
        ).toEqual(0)
    })

    it(`should compare a full page screenshot successful for '${deviceName}' in ${orientation}-mode`, async () => {
        await expect(
            await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: '1500',
            })
        ).toEqual(0)
    })
})
