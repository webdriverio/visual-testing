import { join } from 'node:path'
import { config as sharedConfig } from './wdio.local.appium.shared.conf.ts'

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
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
        iOSCaps('iPhone 15 Pro', 'LANDSCAPE', '17.5', ['checkFullPageScreen']),
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
