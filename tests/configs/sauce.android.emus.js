const { join } = require('path')

module.exports = function sauceAndroidEmus({ buildName }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js')
    const chromeDriverDevices = ['LANDSCAPE', 'PORTRAIT']
        .map((orientation) =>
            ['8.1', '9.0', '10.0', '11.0', '12.0'].map((platformVersion) => ({
                browserName: 'chrome',
                platformName: 'Android',
                'appium:deviceName':
                    // Android 8.1 needs to be on a different phone
                    platformVersion === '8.1'
                        ? 'Samsung Galaxy S9 WQHD GoogleAPI Emulator'
                        : 'Google Pixel 3 XL GoogleAPI Emulator',
                'appium:platformVersion': platformVersion,
                'appium:automationName': 'UIAutomator2',
                'appium:orientation': orientation,
                'wdio-ics:options': {
                    logName:
                        // Android 8.1 needs to be on a different phone
                        (platformVersion === '8.1'
                            ? 'EmulatorSamsungGalaxyS9WQHDChromeDriver'
                            : 'EmulatorGooglePixel3XLGoogleAPIChromeDriver') +
                        orientation.charAt(0).toUpperCase() +
                        orientation.slice(1).toLowerCase() +
                        platformVersion,
                },
                'sauce:options': {
                    build: buildName,
                },
                specs: [mobileSpecs],
            }))
        )
        .flat(1)
    console.log('devices = ', JSON.stringify(chromeDriverDevices, null, 2))

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
