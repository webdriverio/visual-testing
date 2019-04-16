const { join } = require('path');
const { config } = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

const basicSpecs = join(process.cwd(), './tests/specs/basics.spec.js');
const deskSpecs = join(process.cwd(), './tests/specs/desktop.spec.js');
const mobileSpecs = join(process.cwd(), './tests/specs/mobile.spec.js');
const screenResolution = '1600x1200';
const defaultCapabilities = {
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
};

// =========================
// Sauce RDC specific config
// =========================
config.user = process.env.SAUCE_USERNAME;
config.key = process.env.SAUCE_ACCESS_KEY_EU;
config.region = 'eu';

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
    //     logName: 'iPadPro12.9.2nd',
    //     platformName: 'ios',
    //     platformVersion: '12.0',
    //     specs: [ mobileSpecs ],
    //     ...defaultCapabilities,
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

    /**
     * Desktop browsers
     */
    {
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest',
        logName: 'chrome-latest',
        specs: [ basicSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    {
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest',
        logName: 'chrome-latest',
        specs: [ deskSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    {
        browserName: 'firefox',
        platform: 'Windows 10',
        version: 'latest',
        logName: 'Firefox latest',
        specs: [ deskSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    {
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: 'latest',
        logName: 'IE11',
        specs: [ deskSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    {
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: 'latest',
        logName: 'Microsoft Edge latest',
        specs: [ deskSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    {
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '11.0',
        logName: 'SierraSafari11',
        specs: [ deskSpecs ],
        screenResolution,
        ...defaultCapabilities,
    },
    // {
    //     browserName: 'safari',
    //     platform: 'macOS 10.13',
    //     version: '12.0',
    //     logName: 'HiSierraSafari12',
    //     specs: [ deskSpecs ],
    //     screenResolution,
    //     ...defaultCapabilities,
    // }
];

// ===================
// Image compare setup
// ===================
config.services = [
    'sauce',
    [ WdioImageComparisonService.default, {
        baselineFolder: join(process.cwd(), './tests/sauceLabsBaseline/'),
        debug: false,
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        savePerInstance: true,
        autoSaveBaseline: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
    } ],
];

exports.config = config;
