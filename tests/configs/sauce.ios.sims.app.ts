import { join } from 'node:path'
import type {
    DeviceOrientation,
    ExtendedSauceLabsCapabilities,
} from '../types/types.ts'

export function sauceIosSimApp({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.app.spec.ts')
    // For all screen sizes see
    // https://github.com/wswebcreation/webdriver-image-comparison/blob/main/lib/helpers/constants.ts
    // We will use a mixture of iOS 14, 15 and 16 devices
    // We will not support iPads for now
    const iOS14Devices = [
        // 667
        'iPhone 8 Simulator',
        // 736
        'iPhone 8 Plus Simulator',
    ]
    const iOS15Devices = [
        // 812
        'iPhone XS Simulator',
        // 896
        'iPhone 11 Simulator',
    ]
    const iOS16Devices = [
        // 844
        'iPhone 12 Simulator',
        // 926
        'iPhone 12 Pro Max Simulator',
    ]

    return [
        ...(['PORTRAIT'] as DeviceOrientation[])
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
        ...(['PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS15Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '15.5',
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
        ...(['PORTRAIT'] as DeviceOrientation[])
            .map((orientation) =>
                iOS16Devices.map((device) =>
                    createCaps({
                        deviceName: device,
                        platformVersion: '16.2',
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
        platformName: 'ios',
        'appium:app': 'https://github.com/webdriverio/native-demo-app/releases/download/v1.0.8/ios.simulator.wdio.native.app.v1.0.8.zip',
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
            appiumVersion: '2.0.0',
        },
        specs: [mobileSpecs],
    }
}
