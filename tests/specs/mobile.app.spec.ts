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
        await relaunchApp()
        await $('~Home-screen').waitForDisplayed()
    })

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkScreen')
    ) {
        it(`should compare a screen successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await $('~Login').click()
            const result = await driver.checkScreen('app-forms', {
                ignore: [
                    $('~button-LOGIN'),
                    await $('~input-password'),
                    {
                        x: 150,
                        y: 250,
                        width: 100,
                        height: 100,
                    }
                ]
            }) as number

            // This is normally a bad practice, but a mobile screenshot is normally around 1M pixels
            // We're accepting 0.05%, which is 500 pixels, to be a max difference
            expect(result < 0.05 ? 0 : result).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkElement')
    ) {
        it(`should compare an element successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await $('~Login').click()
            const result = await driver.checkElement(
                $('~button-LOGIN'),
                'app-login-button',
            )

            expect(result).toEqual(0)
        })
        it(`should compare a resized element successful for '${deviceName}' in ${orientation}-mode`, async () => {
            await $('~Login').click()
            const result = await driver.checkElement(
                $('~button-LOGIN'),
                'app-login-button-resized',
                {
                    resizeDimensions: {
                        top: 80,
                        right: 10,
                        bottom: 40,
                        left: 90,
                    }
                }
            )

            expect(result).toEqual(0)
        })
    }
})

async function relaunchApp() {
    const PACKAGE_NAME = 'com.wdiodemoapp'
    const BUNDLE_ID = 'org.reactjs.native.example.wdiodemoapp'
    const appIdentifier = driver.isAndroid ? { 'appId': PACKAGE_NAME } : { 'bundleId': BUNDLE_ID }
    const terminateCommand = 'mobile: terminateApp'
    const launchCommand = `mobile: ${driver.isAndroid ? 'activateApp' : 'launchApp'}`

    await driver.execute(terminateCommand, appIdentifier)
    await driver.execute(launchCommand, appIdentifier)

}
