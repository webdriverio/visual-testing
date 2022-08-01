const { join } = require('path')

module.exports = function sauceIosSim({ buildName }) {
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

    return [
        // For some reason with iOS 13 the Landscape screenshot is not correct
        ...['LANDSCAPE', 'PORTRAIT']
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
        ...['LANDSCAPE', 'PORTRAIT']
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
        ...['LANDSCAPE', 'PORTRAIT']
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
    ]
}

function createCaps({
    deviceName,
    mobileSpecs,
    orientation,
    platformVersion,
    sauceOptions,
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
        },
        'sauce:options': sauceOptions,
        specs: [mobileSpecs],
    }
}
