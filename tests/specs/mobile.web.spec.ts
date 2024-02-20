import { browser, expect } from '@wdio/globals'

/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('@wdio/visual-service mobile web', () => {
    // Get the commands that need to be executed
    // 0 means all, otherwise it will only execute the commands that are specified
    // @ts-ignore
    const wdioIcsCommands = driver.requestedCapabilities['wdio-ics:options'].commands
    // @ts-ignore
    const deviceName = driver.requestedCapabilities.deviceName
    // @ts-ignore
    const platformName = driver.requestedCapabilities.platformName.toLowerCase() === 'android' ? 'Android' : 'iOS'
    // @ts-ignore
    const platformVersion = driver.requestedCapabilities.platformVersion
    // @ts-ignore
    const orientation = driver.requestedCapabilities.orientation.toLowerCase()

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
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
        it(`should compare a screen successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async () => {
            // This is normally a bad practice, but a mobile screenshot is normally around 1M pixels
            // We're accepting 0.05%, which is 500 pixels, to be a max difference
            const result = await browser.checkScreen('screenshot') as number
            if (result > 0 && result < 0.05) {
                console.log(`\n\n\n'Screenshot for ${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode has a difference of ${result}%\n\n\n`)
            }
            await expect(result < 0.05 ? 0 : result).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkElement')
    ) {
        it(`should compare an element successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async () => {
            await expect(
                await browser.checkElement(
                    await $('.hero__title-logo'),
                    'wdioLogo',
                    {
                        removeElements: [await $('nav.navbar')]
                    }
                )
            ).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkFullPageScreen')
    ) {
        it(`should compare a full page screenshot successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async () => {
            // This is normally a bad practice, but a mobile full page screenshot is normally around 4M pixels
            // We're accepting 0.05%, which is 2000 pixels, to be a max difference
            const result = await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
            }) as number
            if (result > 0 && result < 0.05) {
                console.log(`\n\n\nFull page layout screenshot for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode has a difference of ${result}%\n\n\n`)
            }
            await expect(result < 0.05 ? 0 : result).toEqual(0)
        })
    }
})
