import { join } from 'node:path'
import type {
    DeviceOrientation,
    ExtendedSauceLabsCapabilities,
} from '../types/types.ts'

export function sauceIosSimWeb({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')
    // For all screen sizes see
    // https://github.com/wswebcreation/webdriver-image-comparison/blob/main/lib/helpers/constants.ts
    // The strategy for selecting which devices to use it to:
    // - Support the latest 3 major iOS versions
    // - For the latest iOS version check all screen sizes from the constants file for the latest OS in landscape and portrait
    // - only check the released devices for latest-1 and latest -2 for a phone and a tablet in portrait due to risk on landscape
    // - add missing smaller screen sizes for the latest-1 and latest-2
    const iOS15Devices = [
        // 736
        'iPhone 8 Plus Simulator',
        // 812
        'iPhone 13 mini Simulator',
        // 844
        'iPhone 13 Pro Simulator', // Same as the iPhone 13
        // 926
        'iPhone 13 Pro Max Simulator',
        // 1080
        'iPad (9th generation) Simulator',
        // 1024
        'iPad mini (6th generation) Simulator',
    ]
    const iOS16Devices = [
        // 844
        'iPhone 14 Simulator',
        // 852
        'iPhone 14 Pro Simulator',
        // 926
        'iPhone 14 Plus Simulator',
        // 932
        'iPhone 14 Pro Max Simulator',
        // No new iPads were released with iOS 16
    ]
    const iOS17Devices = [
        // 667
        'iPhone SE (3rd generation) Simulator',
        // 812
        'iPhone XS Simulator',
        // 844
        'iPhone 14 Simulator',
        // 852
        'iPhone 15 Simulator', // or iPhone 15 Pro
        // 896
        'iPhone 11 Simulator',
        // 926
        'iPhone 12 Pro Max Simulator',
        // 932
        'iPhone 15 Pro Max Simulator', // or iPhone 15 Plus
        // 1024
        'iPad mini (5th generation) Simulator',
        // 1080
        'iPad (10th generation) Simulator',
        // 1112
        'iPad Pro (10.5 inch) Simulator',
        // 1133
        'iPad mini (6th generation) Simulator',
        // 1180
        'iPad Air (4th generation) Simulator',
        // 1194
        'iPad Pro (11 inch) (3rd generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (5th generation) Simulator',
    ]

    return [
        ...(['PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS15Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '15.5',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            appiumVersion: '2.0.0',
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                        wdioIcsCommands: [
                            'checkScreen',
                            // 'checkElement', // Disabled because it's flaky on Sauce Labs
                            'checkFullPageScreen',
                        ],
                    })
                )
            )
            .flat(1),
        ...(['PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS16Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '16.2',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            appiumVersion: '2.0.0',
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                        wdioIcsCommands: [
                            'checkScreen',
                            // 'checkElement', // Disabled because it's flaky on Sauce Labs
                            'checkFullPageScreen',
                        ],
                    })
                )
            )
            .flat(1),
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS17Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '17.0',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            appiumVersion: '2.1.3',
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                        wdioIcsCommands: [
                            'checkScreen',
                            // 'checkElement', // Disabled because it's flaky on Sauce Labs
                            'checkFullPageScreen',
                        ],
                    })
                )
            )
            .flat(1),
    ]
}

function createCaps({
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands = [],
    deviceName,
    mobileSpecs,
    orientation,
    platformVersion,
    sauceOptions,
}:{
    wdioIcsCommands?: string[],
    appiumVersion?: string,
    deviceName: string,
    mobileSpecs: string,
    orientation: DeviceOrientation,
    platformVersion: string,
    sauceOptions: ExtendedSauceLabsCapabilities,
}) {
    return {
        browserName: 'safari',
        platformName: 'ios',
        'appium:deviceName': deviceName,
        'appium:platformVersion': platformVersion,
        'appium:orientation': orientation,
        'appium:automationName': 'XCUITest',
        'wdio-ics:options': {
            logName: `${deviceName
                .split(' ')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join('')}${
                orientation.charAt(0).toUpperCase() +
                orientation.slice(1).toLowerCase()
            }${platformVersion.split('.')[0]}`.replace(
                /(\s+|\(+|\)+|Simulator)/g,
                ''
            ),
            commands: wdioIcsCommands,
        },
        'sauce:options': {
            ...sauceOptions,
        },
        specs: [mobileSpecs],
    }
}
