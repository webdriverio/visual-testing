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
    'goog:chromeOptions': {
        'w3c': true,
    },
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
        browserName: 'safari',
        automationName: 'XCUITest',
        deviceName: 'iPad Pro (12.9 inch) (2nd generation) Simulator',
        platformVersion: '12.0',
        platformName: 'IOS',
        specs: [mobileSpecs],
        logName: 'iPadPro12.9.2nd',
        build: buildIdentifier,
    },
    {
        browserName: 'safari',
        automationName: 'XCUITest',
        deviceName: 'iPad (7th generation) Simulator',
        platformVersion: '13.2',
        platformName: 'IOS',
        specs: [mobileSpecs],
        logName: 'iPad13.2.7th',
        build: buildIdentifier,
    },
    {
        deviceName: 'iPad Air Simulator',
        browserName: 'safari',
        logName: 'iPadAirSimulator',
        platformName: 'ios',
        platformVersion: '12.2',
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
        browserName: 'safari',
        deviceName: 'iPhone 8 Simulator',
        logName: 'iPhone8Simulator',
        platformName: 'ios',
        platformVersion: '11.3',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    {
        browserName: 'safari',
        deviceName: 'iPhone X Simulator',
        logName: 'iPhoneXSimulator',
        platformName: 'ios',
        platformVersion: '12.2',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    {
        browserName: 'safari',
        deviceName: 'iPhone XS Simulator',
        logName: 'iPhoneXsSimulator13.0',
        platformName: 'ios',
        platformVersion: '13.0',
        appiumVersion: '1.16.0',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },
    {
        browserName: 'safari',
        deviceName: 'iPhone XS Simulator',
        logName: 'iPhoneXsSimulator13.2',
        platformName: 'ios',
        platformVersion: '13.2',
        appiumVersion: '1.16.0',
        specs: [mobileSpecs],
        build: buildIdentifier,
    },

    /**
     * Android with native Webscreenshot
     */
    {
        browserName: 'chrome',
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        logName: 'EmulatorGooglePixel3XLGoogleAPI10.0NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.16.0',
        specs: [ mobileSpecs ],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    {
        browserName: 'chrome',
        deviceName: 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
        logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI9.0NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '9.0',
        appiumVersion: '1.15.0',
        specs: [ mobileSpecs ],
        nativeWebScreenshot: true,
        build: buildIdentifier,
    },
    {
        browserName: 'chrome',
        deviceName: 'Google Pixel GoogleAPI Emulator',
        logName: 'GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot',
        platformName: 'Android',
        platformVersion: '8.1',
        appiumVersion: '1.15.0',
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
        browserName: 'chrome',
        deviceName: 'Google Pixel 3 XL GoogleAPI Emulator',
        logName: 'EmulatorGooglePixel3XLGoogleAPI10.0ChromeDriver',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.16.0',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    {
        browserName: 'chrome',
        deviceName: 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
        logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI9.0ChromeDriver',
        platformName: 'Android',
        platformVersion: '9.0',
        appiumVersion: '1.15.0',
        specs: [ mobileSpecs ],
        build: buildIdentifier,
    },
    {
       browserName: 'chrome',
       deviceName: 'Google Pixel GoogleAPI Emulator',
       logName: 'GooglePixelGoogleAPIEmulator8.1ChromeDriver',
       platformName: 'Android',
       platformVersion: '8.1',
       appiumVersion: '1.15.0',
       specs: [mobileSpecs],
       build: buildIdentifier,
    },
    {
        browserName: 'chrome',
        deviceName: 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
        logName: 'EmulatorSamsungGalaxyS9WQHDGoogleAPI7.1ChromeDriver',
        platformName: 'Android',
        platformVersion: '7.1',
        appiumVersion: '1.15.0',
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
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest',
        specs: [ basicSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest',
        specs: [ checkMethodFolderSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest',
        specs: [ saveMethodFolderSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest-2',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest-2',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest-1',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest-1',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'googlechrome',
        platformName: 'Windows 10',
        browserVersion: 'latest',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'chrome-latest',
            ...defaultBrowserSauceOptions,
        },
        ...chromeOptions,
    },
    {
        browserName: 'firefox',
        platformName: 'Windows 10',
        browserVersion: 'latest-2',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest-2',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'firefox',
        platformName: 'Windows 10',
        browserVersion: 'latest-1',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest-1',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'firefox',
        platformName: 'Windows 10',
        browserVersion: 'latest',
        specs: [deskSpecs],
        'sauce:options': {
            logName: 'Firefox latest',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'internet explorer',
        platformName: 'Windows 8.1',
        browserVersion: 'latest',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'IE11',
            ...defaultBrowserSauceOptions,
            iedriverVersion: '3.141.59',
        },
    },
    {
        browserName: 'MicrosoftEdge',
        platformName: 'Windows 10',
        browserVersion: '18.17763',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge 18',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        platformName: 'Windows 10',
        browserVersion: 'latest-2',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge latest-2',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        platformName: 'Windows 10',
        browserVersion: 'latest-1',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'Microsoft Edge latest-1',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'MicrosoftEdge',
        platformName: 'Windows 10',
        browserVersion: 'latest',
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
        platform: 'macOS 10.12',
        version: '11.0',
        specs: [ deskSpecs ],
        logName: 'SierraSafari11',
        ...defaultBrowserSauceOptions,
    },
    {
        browserName: 'safari',
        platformName: 'macOS 10.13',
        browserVersion: '13.0',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'HighSierraSafari13',
            ...defaultBrowserSauceOptions,
        },
    },
    {
        browserName: 'safari',
        platformName: 'macOS 10.14',
        browserVersion: 'latest',
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
        debug: true,
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        savePerInstance: true,
        autoSaveBaseline: false,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
    }],
];

exports.config = config;
