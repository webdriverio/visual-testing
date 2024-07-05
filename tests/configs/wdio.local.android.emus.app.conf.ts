import { join } from 'node:path'
import { config as sharedConfig } from './wdio.local.appium.shared.conf.ts'

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
    // ==================
    // Specify Test Files
    // ==================
    specs: [join(process.cwd(), './tests/specs/mobile.app.spec.ts')],
    specFileRetries: 0,
    // ============
    // Capabilities
    // ============
    capabilities: [
        // androidCaps('Pixel_2_XL_Android_9_API_28', 'PORTRAIT', '9.0'),
        // androidCaps('Pixel_2_XL_Android_9_API_28', 'PORTRAIT', '9.0', true),
        // androidCaps('Pixel_3_XL_Android_10_API_29', 'PORTRAIT', '10.0', ),
        // androidCaps('Pixel_3_XL_Android_10_API_29', 'PORTRAIT', '10.0', true),
        // androidCaps('Pixel_4_XL_Android_11_API_30', 'PORTRAIT', '11.0'),
        // androidCaps('Pixel_4_XL_Android_11_API_30', 'PORTRAIT', '11.0', true),
        // androidCaps('Pixel_5_Android_12_API_32', 'PORTRAIT', '12.0'),
        // androidCaps('Pixel_5_Android_12_API_32', 'PORTRAIT', '12.0', true),
        // androidCaps('Pixel_6_Pro_Android_13_API_33', 'PORTRAIT', '13.0'),
        // androidCaps('Pixel_6_Pro_Android_13_API_33', 'PORTRAIT', '13.0', true),
        androidCaps('Pixel_7_Pro_Android_14_API_34', 'PORTRAIT', '14.0'),
        // androidCaps('Pixel_7_Pro_Android_14_API_34', 'PORTRAIT', '14.0', true),
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
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        'appium:deviceName': deviceName,
        'appium:platformVersion': osVersion,
        'appium:app': join(
            process.cwd(),
            'apps',
            // Change this name according to the app version you downloaded
            'android.wdio.native.app.v1.0.8.apk'
        ),
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
