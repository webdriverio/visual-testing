const { join } = require('path')

module.exports = function sauceAndroidEmus({ buildName }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js')

    return [
        /**
         * Android with nativeWebScreenshot
         */
        {
            'appium:deviceName': 'Google Pixel GoogleAPI Emulator',
            browserName: 'chrome',
            platformName: 'Android',
            'appium:platformVersion': '8.1',
            'appium:automationName': 'UIAutomator2',
            'appium:nativeWebScreenshot': true,
            'wdio-ics:options': {
                logName: 'GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot',
            },
            'sauce:options': {
                appiumVersion: '1.18.1',
                build: buildName,
            },
            specs: [mobileSpecs],
        },
        ...['9.0', '10.0', '11.0', '12.0'].map((platformVersion) => ({
            browserName: 'chrome',
            platformName: 'Android',
            'appium:deviceName': 'Google Pixel 3 XL GoogleAPI Emulator',
            'appium:platformVersion': platformVersion,
            'appium:automationName': 'UIAutomator2',
            'appium:nativeWebScreenshot': true,
            'wdio-ics:options': {
                logName: `EmulatorGooglePixel3XLGoogleAPI${platformVersion}NativeWebScreenshot`,
            },
            'sauce:options': {
                build: buildName,
            },
            specs: [mobileSpecs],
        })),

        /**
         * Android with chrome driver screenshots
         */
        {
            browserName: 'chrome',
            platformName: 'Android',
            'appium:deviceName': 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
            'appium:platformVersion': '7.1',
            'appium:automationName': 'UIAutomator2',
            'wdio-ics:options': {
                logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI7.1ChromeDriver',
            },
            'sauce:options': {
                appiumVersion: '1.18.1',
                build: buildName,
            },
            specs: [mobileSpecs],
        },
        {
            browserName: 'chrome',
            platformName: 'Android',
            'appium:deviceName': 'Google Pixel GoogleAPI Emulator',
            'appium:platformVersion': '8.1',
            'appium:automationName': 'UIAutomator2',
            'wdio-ics:options': {
                logName: 'GooglePixelGoogleAPIEmulator8.1ChromeDriver',
            },
            'sauce:options': {
                appiumVersion: '1.18.1',
                build: buildName,
            },
            specs: [mobileSpecs],
        },
        ...['9.0', '10.0', '11.0', '12.0'].map((platformVersion) => ({
            browserName: 'chrome',
            platformName: 'Android',
            'appium:deviceName': 'Google Pixel 3 XL GoogleAPI Emulator',
            'appium:platformVersion': platformVersion,
            'appium:automationName': 'UIAutomator2',
            'wdio-ics:options': {
                logName: `EmulatorGooglePixel3XLGoogleAPI${platformVersion}ChromeDriver`,
            },
            'sauce:options': {
                build: buildName,
            },
            specs: [mobileSpecs],
        })),

        /**
         * Not supporting Android Tablets
         */
    ]
}
