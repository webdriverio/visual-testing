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
        androidCaps('Pixel_8_Pro_Android_15_API_35', 'PORTRAIT', '15.0', true),
    ],
}

function androidCaps(
    deviceName: string,
    orientation: string,
    osVersion: string,
    nativeWebScreenshot: boolean = false,
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands: string[] = []
) {
    return {
        browserName: 'Chrome',
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        'appium:deviceName': deviceName,
        'appium:platformVersion': osVersion,
        'appium:orientation': orientation,
        'appium:newCommandTimeout': 240,
        ...(nativeWebScreenshot ? { 'appium:nativeWebScreenshot': true } : {}),
        'wdio-ics:options': {
            logName: `${deviceName
                .split(' ')
                .map(
                    (word:string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join('')}_${
                nativeWebScreenshot ? 'NativeWebScreenshot' : 'ChromeDriver'
            }_${
                orientation.charAt(0).toUpperCase() +
                orientation.slice(1).toLowerCase()
            }${osVersion.split('.')[0]}`.replace(
                /(\s+|\(+|\)+|Emulator)/g,
                ''
            ),
            commands: wdioIcsCommands,
        },
    }
}
