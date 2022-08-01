const { join } = require('path')

module.exports = function sauceAndroidEmus({ buildName }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js')
    const chromeDriverDevices = ['LANDSCAPE', 'PORTRAIT']
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

    return [
        /**
         * Android phones with nativeWebScreenshot
         */
        // ...['8.1', '9.0', '10.0', '11.0', '12.0'].map((platformVersion) => ({
        //     browserName: 'chrome',
        //     platformName: 'Android',
        //     'appium:deviceName':
        //         // Android 8.1 needs to be aon a different phone
        //         platformVersion === '8.1'
        //             ? 'Samsung Galaxy S9 WQHD GoogleAPI Emulator'
        //             : 'Google Pixel 3 XL GoogleAPI Emulator',
        //     'appium:platformVersion': platformVersion,
        //     'appium:automationName': 'UIAutomator2',
        //     'appium:orientation': 'PORTRAIT',
        //     'appium:nativeWebScreenshot': true,
        //     'wdio-ics:options': {
        //         logName:
        //             // Android 8.1 needs to be aon a different phone
        //             platformVersion === '8.1'
        //                 ? `EmulatorSamsungGalaxyS9WQHD${platformVersion}NativeWebScreenshot`
        //                 : `EmulatorGooglePixel3XLGoogleAPI${platformVersion}NativeWebScreenshot`,
        //     },
        //     'sauce:options': {
        //         build: buildName,
        //     },
        //     specs: [mobileSpecs],
        // })),

        /**
         * Android phones with ChromeDriver screenshots
         */
        ...chromeDriverDevices,

        /**
         * Not supporting Android Tablets
         */
    ]
}

function createCaps({
    deviceName,
    mobileSpecs,
    nativeWebScreenshot = false,
    orientation,
    platformVersion,
    sauceOptions,
}) {
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
        },
        'sauce:options': sauceOptions,
        specs: [mobileSpecs],
    }
}
