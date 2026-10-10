import { join } from 'node:path'
import { config as sharedConfig } from './wdio.local.appium.shared.conf.ts'

// The simulator name and iOS version, for example in CI: IOS_DEVICE_NAME="iPhone 16 Pro" IOS_PLATFORM_VERSION=18.5
const iosDeviceName = process.env.IOS_DEVICE_NAME ?? 'iPhone 15 Pro'
const iosPlatformVersion = process.env.IOS_PLATFORM_VERSION ?? '17.5'

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
    // On a new CI simulator the first session takes about 3 minutes (WebDriverAgent start, Safari preparation)
    ...(process.env.CI ? { connectionRetryTimeout: 10 * 60 * 1000 } : {}),
    // ==================
    // Specify Test Files
    // ==================
    specs: [join(process.cwd(), './tests/specs/mobile.web.spec.ts')],
    specFileRetries: 0,
    // ============
    // Capabilities
    // ============
    capabilities: [
        // iOSCaps('iPhone 15 Pro', 'PORTRAIT', '17.5', ['checkFullPageScreen']),
        iOSCaps(iosDeviceName, 'LANDSCAPE', iosPlatformVersion, ['checkFullPageScreen']),
        // iOSCaps('iPhone 16 Pro', 'PORTRAIT', '18.2'),
    ],
}

function iOSCaps(
    deviceName: string,
    orientation: string,
    osVersion: string,
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    // Options are: 'checkScreen', 'checkElement', 'checkFullPageScreen'
    wdioIcsCommands: string[] = []
) {
    return {
        browserName: 'Safari',
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': deviceName,
        'appium:platformVersion': osVersion,
        'appium:orientation': orientation,
        'appium:newCommandTimeout': 240,
        'appium:language': 'en',
        'appium:locale': 'en',
        // In CI the simulator is booted without a window; without this, Appium restarts it with a window, which is slow
        // and the web inspector of a new CI simulator reports Safari late, so give Appium more time to find the page
        ...(process.env.CI ? {
            'appium:isHeadless': true,
            'appium:wdaLaunchTimeout': 180 * 1000,
            'appium:webviewConnectTimeout': 60 * 1000,
            'appium:webviewConnectRetries': 120,
            // Appium reuses the WebDriverAgent of the previous session, which can have stopped: start a new one
            'appium:useNewWDA': true,
        } : {}),
        'wdio-ics:options': {
            logName: `${deviceName
                .split(' ')
                .map(
                    (word:string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join('')}${
                orientation.charAt(0).toUpperCase() +
                orientation.slice(1).toLowerCase()
            }${osVersion.split('.')[0]}`.replace(
                /(\s+|\(+|\)+|Simulator)/g,
                ''
            ),
            commands: wdioIcsCommands,
        },
    }
}
