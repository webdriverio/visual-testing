/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('wdio-image-comparison-service mobile', () => {
    const deviceName = driver.capabilities.deviceName
    const orientation = driver.capabilities.orientation
    // Get the commands that need to be executed
    // 0 means all, otherwise it will only execute the commands that are specified
    const wdioIcsCommands = driver.capabilities['wdio-ics:options'].commands

    beforeEach(async () => {
        await browser.url('')
        await $('.uk-button:nth-child(1)').waitForDisplayed()
        await browser.pause(3000)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(
        async () => await browser.executeScript('window.scrollTo(0, 0);', [])
    )

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkScreen')
    ) {
        it(`should compare a screen successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await expect(await browser.checkScreen('screenshot')).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkElement')
    ) {
        it(`should compare an element successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await expect(
                await browser.checkElement(
                    await $('.uk-button:nth-child(1)'),
                    'firstButtonElement'
                )
            ).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkFullPageScreen')
    ) {
        it(`should compare a full page screenshot successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await expect(
                await browser.checkFullPageScreen('fullPage', {
                    fullPageScrollTimeout: '1500',
                })
            ).toEqual(0)
        })
    }
})
