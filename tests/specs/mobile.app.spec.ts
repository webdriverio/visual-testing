import { driver } from '@wdio/globals'

/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('@wdio/visual-service mobile app', () => {
    // Get the commands that need to be executed
    // 0 means all, otherwise it will only execute the commands that are specified
    // @ts-ignore
    const wdioIcsCommands = driver.requestedCapabilities['wdio-ics:options'].commands
    // @ts-ignore
    const deviceName = driver.requestedCapabilities.deviceName
    // @ts-ignore
    const orientation = driver.requestedCapabilities.orientation

    beforeEach(async () => {
        await $('~Home-screen').waitForDisplayed()
    })

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkScreen')
    ) {
        it(`should compare a screen successful for '${deviceName}' in ${orientation}-mode`, async () => {
            console.log('checkScreen')

            // open safari or chrome on Android
            // await (driver.isIOS ? driver.execute('mobile: launchApp', { bundleId: 'com.apple.mobilesafari' }) : driver.startActivity('com.android.chrome', 'com.google.android.apps.chrome.Main'))
            // await driver.pause(5000)
            // const contexts = await driver.getContexts()
            // console.log('driver.getContexts()', contexts)
            // // ts-ignore
            // await driver.switchContext(contexts[1])
            // await driver.pause(5000)
            // console.log('driver.getContext() = ', await driver.getContext())

            //afterCommand: function (commandName, args, result, error) {

            // This is normally a bad practice, but a mobile screenshot is normally around 1M pixels
            // We're accepting 0.05%, which is 500 pixels, to be a max difference
            // const result = await browser.checkScreen('screenshot') as number
            // await expect(result < 0.05 ? 0 : result).toEqual(0)

            await driver.checkScreen('wdio-screen')
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkElement')
    ) {
        it(`should compare an element successful for '${deviceName}' in ${orientation}-mode`, async () => {
            console.log('checkElement')
            // NOTE: The iOS image will be with text and logo, Android only text. This is expected
            const selector = driver.isIOS
                ? '-ios class chain:**/XCUIElementTypeOther[`name == "WEBDRIVER"`]'
                : '//android.widget.TextView[@text="WEBDRIVER"]'
            // await expect(
            await driver.checkElement(
                await $(selector),
                'wdio-text'
            )
            // ).toEqual(0)
        })
    }
})
