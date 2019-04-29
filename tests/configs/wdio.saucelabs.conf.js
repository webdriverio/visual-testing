const { join } = require('path');
const { config } = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

const basicSpecs = join(process.cwd(), './tests/specs/basics.spec.js');
const deskSpecs = join(process.cwd(), './tests/specs/desktop.spec.js');
const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js');
const tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
const defaultBrowserSauceOptions = {
    tunnelIdentifier,
    screenResolution: '1600x1200',
    seleniumVersion: '3.141.59',
};
const defaultAppiumSauceOptions = {
    tunnelIdentifier,
};
const chromeOptions = {
    'goog:chromeOptions': {
        'w3c': true,
    },
};

// =========================
// Sauce RDC specific config
// =========================
config.user = process.env.SAUCE_USERNAME;
config.key = process.env.SAUCE_ACCESS_KEY;
// config.key = process.env.SAUCE_ACCESS_KEY_EU;
// config.region = 'eu';

// ============
// Capabilities
// ============
config.capabilities = [
    // /**
    //  * iOS
    //  */
    // {
    //     deviceName: 'iPad Pro (12.9 inch) (2nd generation) Simulator',
    //     browserName: 'safari',
    //     platformName: 'IOS',
    //     platformVersion: '12.0',
    //     specs: [ mobileSpecs ],
    //     'appium:options': {
    //         logName: 'iPadPro12.9.2nd',
    //         ...defaultAppiumSauceOptions,
    //     },
    //     // logName: 'iPadPro12.9.2nd',
    // },
    // {
    //     deviceName: 'iPad Air Simulator',
    //     browserName: 'safari',
    //     logName: 'iPadAirSimulator',
    //     platformName: 'ios',
    //     platformVersion: '12.2',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'safari',
    //     deviceName: 'iPhone 8 Simulator',
    //     logName: 'iPhone8Simulator',
    //     platformName: 'ios',
    //     platformVersion: '11.3',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'safari',
    //     deviceName: 'iPhone X Simulator',
    //     logName: 'iPhoneXSimulator',
    //     platformName: 'ios',
    //     platformVersion: '12.2',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // // {
    // // 	deviceName: 'iPad Pro (12.9 inch) (3rd generation) Simulator',
    // // 	browserName: 'safari',
    // // 	logName: 'iPadPro12.9.3rdGeneration',
    // // 	platformName: 'ios',
    // // 	platformVersion: '12.2',
    // // 	specs: [ mobileSpecs ],
    // // 	...defaultCapabilities,
    // // },
    //
    // /**
    //  * Android with native Webscreenshot
    //  */
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Google Pixel GoogleAPI Emulator',
    //     logName: 'GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot',
    //     platformName: 'Android',
    //     platformVersion: '8.1',
    //     specs: [ mobileSpecs ],
    //     nativeWebScreenshot: true,
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Google Pixel GoogleAPI Emulator',
    //     logName: 'GooglePixelGoogleAPIEmulator7.1NativeWebScreenshot',
    //     platformName: 'Android',
    //     platformVersion: '7.1',
    //     specs: [ mobileSpecs ],
    //     nativeWebScreenshot: true,
    //     ...defaultCapabilities,
    // },
    // // @TODO: There is an issue with taking an element screenshot
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Android GoogleAPI Emulator',
    //     logName: 'AndroidGoogleApiEmulator6.0NativeWebScreenshot',
    //     platformName: 'Android',
    //     platformVersion: '6.0',
    //     specs: [ mobileSpecs ],
    //     nativeWebScreenshot: true,
    //     ...defaultCapabilities,
    // },
    // // Not supporting Android Tablets now with nativeWebScreenshot
    // // {
    // // 	browserName: 'chrome',
    // // 	deviceName: 'Google Pixel C GoogleAPI Emulator',
    // // 	logName: 'GooglePixelCTablet7.1NativeWebScreenshot',
    // // 	platformName: 'Android',
    // // 	platformVersion: '7.1',
    // // 	tunnelIdentifier,
    // // 	shardTestFiles,
    // // 	specs: [ mobileSpecs ],
    // // 	nativeWebScreenshot: true,
    // // },
    //
    // /**
    //  * Android with chrome driver screenshots
    //  */
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Google Pixel GoogleAPI Emulator',
    //     logName: 'GooglePixelGoogleAPIEmulator8.1ChromeDriver',
    //     platformName: 'Android',
    //     platformVersion: '8.1',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Google Pixel GoogleAPI Emulator',
    //     logName: 'GooglePixelGoogleAPIEmulator7.1ChromeDriver',
    //     platformName: 'Android',
    //     platformVersion: '7.1',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Android GoogleAPI Emulator',
    //     logName: 'AndroidGoogleApiEmulator6.0ChromeDriver',
    //     platformName: 'Android',
    //     platformVersion: '6.0',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    // {
    //     browserName: 'chrome',
    //     deviceName: 'Google Pixel C GoogleAPI Emulator',
    //     logName: 'GooglePixelCTablet7.1ChromeDriver',
    //     platformName: 'Android',
    //     platformVersion: '7.1',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
    // },
    //
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
        browserVersion: 'latest',
        specs: [ deskSpecs ],
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
        // 'sauce:options': {
        //     logName: 'SierraSafari11',
        //     ...defaultBrowserSauceOptions,
        // },
    },
    {
        browserName: 'safari',
        platformName: 'macOS 10.14',
        browserVersion: '12.0',
        specs: [ deskSpecs ],
        'sauce:options': {
            logName: 'MojaveSafari12',
            ...defaultBrowserSauceOptions,
        },
    }
];

// ===================
// Image compare setup
// ===================
config.services = [
    'sauce',
    [ WdioImageComparisonService.default, {
        baselineFolder: join(process.cwd(), './tests/sauceLabsBaseline/'),
        debug: true,
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        savePerInstance: true,
        autoSaveBaseline: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
    } ],
];

exports.config = config;
