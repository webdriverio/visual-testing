import { join } from 'node:path'
import type {
    DeviceOrientation,
    ExtendedSauceLabsCapabilities,
} from '../types/types.ts'

export function sauceIosSim({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js')
    // For all screen sizes see
    // https://github.com/wswebcreation/webdriver-image-comparison/blob/main/lib/helpers/constants.ts
    const iOS13Devices = [
        // 667
        'iPhone 8 Simulator',
        // 736
        'iPhone 8 Plus Simulator',
        // 812
        'iPhone XS Simulator',
        // 844 => not available for iOS 13
        // 896
        'iPhone 11 Simulator',
        // 926 => not available for iOS 13
        // 1024
        'iPad Air 2 Simulator',
        // 1080
        'iPad (5th generation) Simulator',
        // 1112
        'iPad Pro (10.5 inch) Simulator',
        // 1133 => not available for iOS 13
        // 1180 => not available for iOS 13
        // 1194
        'iPad Pro (11 inch) (2nd generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (4th generation) Simulator',
    ]
    const iOS14Devices = [
        // 667
        'iPhone 8 Simulator',
        // 736
        'iPhone 8 Plus Simulator',
        // 812
        'iPhone XS Simulator',
        // 844
        'iPhone 12 Simulator',
        // 896
        'iPhone 11 Simulator',
        // 926
        'iPhone 12 Pro Max Simulator',
        // 1024
        'iPad Air 2 Simulator',
        // 1080
        'iPad (5th generation) Simulator',
        // 1112
        'iPad Pro (10.5 inch) Simulator',
        // 1133 => not available for iOS 14
        // 1180
        'iPad Air (4th generation) Simulator',
        // 1194
        'iPad Pro (11 inch) (3rd generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (1st generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (5th generation) Simulator',
    ]
    const iOS15Devices = [
        // 667
        'iPhone 8 Simulator',
        // 736
        'iPhone 8 Plus Simulator',
        // 812
        'iPhone XS Simulator',
        // 844
        'iPhone 12 Simulator',
        // 896
        'iPhone 11 Simulator',
        // 926
        'iPhone 12 Pro Max Simulator',
        // 1024
        'iPad Air 2 Simulator',
        // 1080
        'iPad (5th generation) Simulator',
        // 1112
        'iPad Pro (10.5 inch) Simulator',
        // 1133
        'iPad mini (6th generation) Simulator',
        // 1180
        'iPad Air (4th generation) Simulator',
        // 1194
        'iPad Pro (11 inch) (3rd generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (1st generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (5th generation) Simulator',
    ]
    const iOS16Devices = [
        // 667
        'iPhone 8 Simulator',
        // 736
        'iPhone 8 Plus Simulator',
        // 812
        'iPhone XS Simulator',
        // 844
        'iPhone 12 Simulator',
        // 896
        'iPhone 11 Simulator',
        // 926
        'iPhone 12 Pro Max Simulator',
        // 1024
        'iPad mini (5th generation) Simulator',
        // 1080
        'iPad (5th generation) Simulator',
        // 1112
        'iPad Pro (10.5 inch) Simulator',
        // 1133
        'iPad mini (6th generation) Simulator',
        // 1180
        'iPad Air (4th generation) Simulator',
        // 1194
        'iPad Pro (11 inch) (3rd generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (1st generation) Simulator',
        // 1366
        'iPad Pro (12.9 inch) (5th generation) Simulator',
    ]
    const iOS16BezelDevices = [
        // iPhones
        'iPhone X Simulator',
        // 'iPhone XS Simulator', // => already done for 812
        'iPhone XS Max Simulator',
        'iPhone XR Simulator',
        // 'iPhone 11 Simulator', // => already done for 896
        'iPhone 11 Pro Simulator',
        'iPhone 11 Pro Max Simulator',
        // 'iPhone 12 Simulator', // => already done for 926
        'iPhone 12 Mini Simulator',
        'iPhone 12 Pro Simulator',
        // 'iPhone 12 Pro Max Simulator', // => already done for 844
        'iPhone 13 Simulator',
        'iPhone 13 Mini Simulator',
        'iPhone 13 Pro Simulator',
        'iPhone 13 Pro Max Simulator',
        'iPhone 14 Simulator',
        'iPhone 14 Plus Simulator',
        'iPhone 14 Pro Simulator',
        'iPhone 14 Pro Max Simulator',
        // iPads
        'iPad mini (5th generation) Simulator',
        'iPad mini (6th generation) Simulator',
        'iPad Air (4th generation) Simulator',
        'iPad Air (5th generation) Simulator',
        'iPad Pro (11 inch) (1st generation) Simulator',
        'iPad Pro (11 inch) (2nd generation) Simulator',
        'iPad Pro (11 inch) (3rd generation) Simulator',
        'iPad Pro (12.9 inch) (3rd generation) Simulator',
        'iPad Pro (12.9 inch) (4th generation) Simulator',
        'iPad Pro (12.9 inch) (5th generation) Simulator',
    ]

    return [
        // For some reason with iOS 13 the Landscape screenshot is not correct
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS13Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '13.4',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                    })
                )
            )
            .flat(1),
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS14Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '14.5',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                    })
                )
            )
            .flat(1),
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS15Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '15.4',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                    })
                )
            )
            .flat(1),
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS16Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '16',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            appiumVersion: '2.0.0-beta44',
                            deviceOrientation: orientation,
                        },
                        wdioIcsCommands: [
                            'checkElement',
                            'checkFullPageScreen',
                        ],
                    })
                )
            )
            .flat(1),
        ...(['LANDSCAPE', 'PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS16BezelDevices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '16',
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            appiumVersion: '2.0.0-beta44',
                            deviceOrientation: orientation,
                        },
                        wdioIcsCommands: ['checkScreen'],
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
        'sauce:options': sauceOptions,
        specs: [mobileSpecs],
    }
}
