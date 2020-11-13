const {join} = require('path');
const {config} = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

const basicSpecs = join(process.cwd(), './tests/specs/basics.spec.js');
const saveMethodFolderSpecs = join(process.cwd(), './tests/specs/saveMethodsFolders.spec.js');
const checkMethodFolderSpecs = join(process.cwd(), './tests/specs/checkMethodsFolders.spec.js');
const deskSpecs = join(process.cwd(), './tests/specs/desktop.spec.js');
const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js');
const buildIdentifier = process.env.TRAVIS_JOB_NUMBER || `Local build-${new Date().getTime()}`;
const defaultBrowserSauceOptions = {
    build: buildIdentifier,
    screenResolution: '1600x1200',
    seleniumVersion: '3.141.59',
};
const chromeOptions = {
    'goog:chromeOptions': {},
};

// =========================
// Sauce RDC specific config
// =========================
config.user = process.env.SAUCE_USERNAME_WDIO_ICS;
config.key = process.env.SAUCE_ACCESS_KEY_WDIO_ICS;
config.region = 'eu';

// ============
// Capabilities
// ============
config.capabilities = [
    /**
     * iOS
     */
    {
        deviceName: 'iPad Pro (12.9 inch) (2nd generation) Simulator',
        browserName: 'safari',
        automationName: 'XCUITest',
        platformVersion: '12.4',
        platformName: 'IOS',
        specs: [mobileSpecs],
        logName: 'iPadPro12.9.2nd',
        build: buildIdentifier,
    },
    {
        deviceName: 'iPad (7th generation) Simulator',
        browserName: 'safari',
        automationName: 'XCUITest',
        platformVersion: '13.4',
        platformName: 'IOS',
        specs: [mobileSpecs],
        logName: 'iPad13.7th',
        build: buildIdentifier,
    },
    {
        deviceName: 'iPad Air Simulator',
        browserName: 'safari',
        logName: 'iPadAirSimulator',
        platformName: 'ios',
        platformVersion: '12.4',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    // // @TODO: need to fix the homebar on the iPad pro, this needs to be fixed in the
    // // webdriver-image-comparison module
    // {
    // 	deviceName: 'iPad Pro (12.9 inch) (3rd generation) Simulator',
    // 	browserName: 'safari',
    // 	logName: 'iPadPro12.9.3rdGeneration',
    // 	platformName: 'ios',
    // 	platformVersion: '13.2',
    // 	specs: [ mobileSpecs ],
    // 	build: buildIdentifier,
    // },
    {
        deviceName: 'iPhone 8 Simulator',
        browserName: 'safari',
        logName: 'iPhone8Simulator',
        platformName: 'ios',
        platformVersion: '11.3',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    {
        deviceName: 'iPhone X Simulator',
        browserName: 'safari',
        logName: 'iPhoneXSimulator',
        platformName: 'ios',
        platformVersion: '12.4',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    {
        deviceName: 'iPhone XS Simulator',
        browserName: 'safari',
        logName: 'iPhoneXsSimulator',
        platformName: 'ios',
        platformVersion: '13.4',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },

    /**
     * Android with native Webscreenshot
     */
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI11.0NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '11.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI10.0NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI9.0NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '9.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '8.1',
        appiumVersion: '1.18.1',
        specs: [mobileSpecs],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    /**
     * Not supporting Android Tablets now with nativeWebScreenshot
     */
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Samsung Galaxy Tab A 10 GoogleAPI Emulator',
    //     logName: 'EmulatorSamsungGalaxyTabA10GoogleAPIEmulator7.1NativeWebScreenshot',
    //     platformName: 'Android',
    //     platformVersion: '7.1',
    //     appiumVersion: '1.15.0',
    //     specs: [ mobileSpecs ],
    //     nativeWebScreenshot: true,
    //     build: buildIdentifier,
    // },
    /**
     * Not supporting Android Tablets now with nativeWebScreenshot
     */
    // {
    // 	browserName: 'chrome',
    // 	deviceName: 'Google Pixel C GoogleAPI Emulator',
    // 	logName: 'GooglePixelCTablet7.1NativeWebScreenshot',
    // 	platformName: 'Android',
    // 	platformVersion: '7.1',
    //  appiumVersion: '1.15.0',
    // 	build: buildIdentifier,
    // 	specs: [ mobileSpecs ],
    // 	nativeWebScreenshot: true,
    // },
    /**
     * Android with chrome driver screenshots
     */
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI11.0ChromeDriver',
        platformName: 'Android',
        platformVersion: '11.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI10.0ChromeDriver',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorGooglePixel3XLGoogleAPI9.0ChromeDriver',
        platformName: 'Android',
        platformVersion: '9.0',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    {
        deviceName: 'Google Pixel GoogleAPI Emulator',
        browserName: 'chrome',
       logName: 'GooglePixelGoogleAPIEmulator8.1ChromeDriver',
       platformName: 'Android',
       platformVersion: '8.1',
       appiumVersion: '1.18.1',
       specs: [mobileSpecs],
       build: buildIdentifier,
    },
    {
        deviceName: 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
        browserName: 'chrome',
        logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI7.1ChromeDriver',
        platformName: 'Android',
        platformVersion: '7.1',
        appiumVersion: '1.18.1',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    /**
     * Not supporting Android Tablets now with nativeWebScreenshot
     */
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Samsung Galaxy Tab A 10 GoogleAPI Emulator',
    //     logName: 'EmulatorSamsungGalaxyTabA10GoogleAPIEmulator7.1ChromeDriver',
    //     platformName: 'Android',
    //     platformVersion: '7.1',
    //     appiumVersion: '1.15.0',
    //     specs: [ mobileSpecs ],
    //     build: buildIdentifier,
    // },

    /**
     * Desktop browsers
     */
    {
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [ basicSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [checkMethodFolderSpecs],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [ saveMethodFolderSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'chrome',
        browserVersion: 'latest-2',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest-2',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'chrome',
        browserVersion: 'latest-1',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest-1',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'firefox',
        browserVersion: 'latest-2',
        platformName: 'Windows 10',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest-2',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'firefox',
        browserVersion: 'latest-1',
        platformName: 'Windows 10',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest-1',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'firefox',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'internet explorer',
        browserVersion: 'latest',
        platformName: 'Windows 8.1',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'IE11',
            ...defaultBrowserSauceOptions,
            iedriverVersion: '3.141.59',
        },
    },
    {
        browserName: 'MicrosoftEdge',
        browserVersion: '18.17763',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge 18',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        browserVersion: 'latest-2',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge latest-2',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        browserVersion: 'latest-1',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge latest-1',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        browserVersion: 'latest',
        platformName: 'Windows 10',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge latest',
            ...defaultBrowserSauceOptions,
        },
    },
    // Safari 11 is not W3C compliant,
    // see https://developer.apple.com/documentation/webkit/macos_webdriver_commands_for_safari_11_1_and_earlier
    {
        browserName: 'safari',
        version: '11.0',
        platform: 'macOS 10.12',
        specs: [ deskSpecs ],
        logName: 'SierraSafari11',
        ...defaultBrowserSauceOptions,
    },
    {
        browserName: 'safari',
        browserVersion: '13.0',
        platformName: 'macOS 10.13',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'HighSierraSafari13',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'safari',
        browserVersion: 'latest',
        platformName: 'macOS 10.14',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'MojaveSafariLatest',
            ...defaultBrowserSauceOptions,
        },
    }
];

// ===================
// Image compare setup
// ===================
config.services = [
    'sauce',
    [WdioImageComparisonService.default, {
        baselineFolder: join(process.cwd(), './tests/sauceLabsBaseline/'),
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        savePerInstance: true,
        autoSaveBaseline: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
        logLevel: 'debug',
    }],
];

exports.config = config;
