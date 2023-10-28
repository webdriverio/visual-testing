import { join } from 'node:path'
import type { DeviceOrientation, ExtendedSauceLabsCapabilities } from '../types/types.ts'

export function sauceAndroidEmus({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js')
    const chromeDriverPhones = (
        ['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[]
    )
        .map((orientation) =>
            ['8.1', '9.0', '10.0', '11.0', '12.0'].map((platformVersion) =>
                createCaps({
                    deviceName:
                        platformVersion === '8.1'
                            ? 'Samsung Galaxy S9 WQHD GoogleAPI Emulator'
                            : 'Google Pixel 3 XL GoogleAPI Emulator',
                    platformVersion: platformVersion,
                    orientation: orientation,
                    mobileSpecs,
                    sauceOptions: {
                        build: buildName,
                        deviceOrientation: orientation,
                    },
                })
            )
        )
        .flat(1)
    const nativeWebScreenshotPhones = (
        ['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[]
    )
        .map((orientation) =>
            ['8.1', '9.0', '10.0', '11.0', '12.0'].map((platformVersion) =>
                createCaps({
                    deviceName:
                        platformVersion === '8.1'
                            ? 'Samsung Galaxy S9 WQHD GoogleAPI Emulator'
                            : 'Google Pixel 3 XL GoogleAPI Emulator',
                    platformVersion: platformVersion,
                    orientation: orientation,
                    mobileSpecs,
                    nativeWebScreenshot: true,
                    sauceOptions: {
                        build: buildName,
                        deviceOrientation: orientation,
                    },
                })
            )
        )
        .flat(1)
    const chromeDriverTablets = (
        ['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[]
    )
        .map((orientation) =>
            ['8.1', '11.0', '12.0'].map((platformVersion) => {
                let tabletType = ''

                switch (platformVersion) {
                case '8.1':
                    tabletType = 'S3'
                    break
                    // 9 and 10 are not available
                case '11.0':
                    tabletType = 'S6'
                    break
                case '12.0':
                    tabletType = 'S7 Plus'
                    break
                default:
                    tabletType = ''
                }

                return createCaps({
                    deviceName: `Galaxy Tab ${tabletType} GoogleAPI Emulator`,
                    platformVersion: platformVersion,
                    orientation: orientation,
                    mobileSpecs,
                    sauceOptions: {
                        build: buildName,
                        deviceOrientation: orientation,
                    },
                })
            })
        )
        .flat(1)
    // // There is no Android 10 for Tablets
    // const nativeWebScreenshotTablets = (['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
    //     .map((orientation) =>
    //         ['8.1', '11.0', '12.0'].map((platformVersion) => {
    //             let tabletType = ''

    //             switch (platformVersion) {
    //                 case '8.1':
    //                     tabletType = 'S3'
    //                     break
    //                 // 9 and 10 are not available
    //                 case '11.0':
    //                     tabletType = 'S6'
    //                     break
    //                 case '12.0':
    //                     tabletType = 'S7 Plus'
    //                     break
    //                 default:
    //                     tabletType = ''
    //             }

    //             return createCaps({
    //                 deviceName: `Galaxy Tab ${tabletType} GoogleAPI Emulator`,
    //                 platformVersion: platformVersion,
    //                 orientation: orientation,
    //                 mobileSpecs,
    //                 nativeWebScreenshot: true,
    //                 sauceOptions: {
    //                     build: buildName,
    //                     deviceOrientation: orientation,
    //                 },
    //             })
    //         })
    //     )
    //     .flat(1)

    return [
        /**
         * Android phones
         */
        ...chromeDriverPhones,
        ...nativeWebScreenshotPhones,

        /**
         * Android Tablets
         */
        ...chromeDriverTablets,
        // ...nativeWebScreenshotTablets,
    ]
}

function createCaps({
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands = [],
    deviceName,
    mobileSpecs,
    nativeWebScreenshot = false,
    orientation,
    platformVersion,
    sauceOptions,
}: {
    wdioIcsCommands?: string[];
    deviceName: string;
    mobileSpecs: string;
    nativeWebScreenshot?: boolean;
    orientation: string;
    platformVersion: string;
    sauceOptions: ExtendedSauceLabsCapabilities;
}): {
    browserName: string;
    platformName: string;
    'appium:deviceName': string;
    'appium:platformVersion': string;
    'appium:orientation': string;
    'appium:automationName': string;
    'wdio-ics:options': {
        logName: string;
        commands: string[];
    };
    'sauce:options': ExtendedSauceLabsCapabilities;
    specs: string[];
} {
    const driverScreenshotType = nativeWebScreenshot
        ? 'NativeWebScreenshot'
        : 'ChromeDriver'
    return {
        browserName: 'chrome',
        platformName: 'Android',
        'appium:deviceName': deviceName,
        'appium:platformVersion': platformVersion,
        'appium:orientation': orientation,
        ...(nativeWebScreenshot ? { 'appium:nativeWebScreenshot': true } : {}),
        'appium:automationName': 'UIAutomator2',
        'wdio-ics:options': {
            logName: `Emulator${deviceName.replace(
                /(\s+|\(+|\)+|Emulator)/g,
                ''
            )}${orientation.charAt(0).toUpperCase()}${orientation
                .slice(1)
                .toLowerCase()}${driverScreenshotType}${platformVersion}`,
            commands: wdioIcsCommands,
        },
        'sauce:options': sauceOptions,
        specs: [mobileSpecs],
    }
}
