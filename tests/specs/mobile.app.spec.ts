import { driver } from '@wdio/globals'

/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('@wdio/visual-service mobile app', () => {
    // Get the commands that need to be executed
    // 0 means all, otherwise it will only execute the commands that are specified
    const wdioIcsCommands = driver.requestedCapabilities['wdio-ics:options'].commands
    const deviceName = driver.requestedCapabilities.deviceName
    const orientation = driver.requestedCapabilities.orientation
    const platformVersion = driver.requestedCapabilities.platformVersion

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

        if (driver.isIOS || (driver.isAndroid && parseFloat(platformVersion) >= 13)) {
            it(`should compare a webview screenshot successful for '${deviceName}' in ${orientation}-mode`, async () => {
                await $('~Webview').click()
                await driver.pause(2000)
                await driver.switchContext({ title: /.*WebdriverIO.*/ })
                await driver.pause(2000)
                await driver.url('https://guinea-pig.webdriver.io/image-compare.html')
                const result = await browser.checkScreen('web-app', {
                    ignore: [$('.navbar__brand')],
                    hideElements: [$('.hero__title')]
                }
                ) as number
                // Rest the context because the rest will be for native
                await driver.switchContext('NATIVE_APP')

                await expect(result < 0.05 ? 0 : result).toEqual(0)
            })
        }
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
