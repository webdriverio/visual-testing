import {join} from 'path';

export function sauceAndroidEmus({buildName}) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js');

    return [
        /**
         * Android with nativeWebScreenshot
         */
        {
            deviceName: 'Google Pixel GoogleAPI Emulator',
            browserName: 'chrome',
            logName: 'GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot',
            platformName: 'Android',
            platformVersion: '8.1',
            appiumVersion: '1.18.1',
            specs: [ mobileSpecs ],
            nativeWebScreenshot: true,
            build: buildName,
        },
        ...['9.0', '10.0', '11.0'].map(platformVersion => ({
            deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
            browserName: 'chrome',
            logName: `EmulatorGooglePixel3XLGoogleAPI${platformVersion}NativeWebScreenshot`,
            platformName: 'Android',
            platformVersion: platformVersion,
            specs: [ mobileSpecs ],
            nativeWebScreenshot: true,
            build: buildName,
        })),

        /**
         * Android with chrome driver screenshots
         */
        {
            deviceName: 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
            browserName: 'chrome',
            logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI7.1ChromeDriver',
            platformName: 'Android',
            platformVersion: '7.1',
            appiumVersion: '1.18.1',
            specs: [ mobileSpecs ],
            build: buildName,
        },
        {
            deviceName: 'Google Pixel GoogleAPI Emulator',
            browserName: 'chrome',
            logName: 'GooglePixelGoogleAPIEmulator8.1ChromeDriver',
            platformName: 'Android',
            platformVersion: '8.1',
            appiumVersion: '1.18.1',
            specs: [ mobileSpecs ],
            build: buildName,
        },
        ...['9.0', '10.0', '11.0'].map(platformVersion => ({
            deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
            browserName: 'chrome',
            logName: `EmulatorGooglePixel3XLGoogleAPI${platformVersion}ChromeDriver`,
            platformName: 'Android',
            platformVersion: platformVersion,
            specs: [ mobileSpecs ],
            build: buildName,
        })),

        /**
         * Not supporting Android Tablets
         */
    ]
}
