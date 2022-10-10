const { join } = require('path')
const { config } = require('./wdio.shared.conf')
const WdioImageComparisonService = require('../../build')

// =========================
// Appium Configuration
// =========================
config.port = 4723

// ==================
// Specify Test Files
// ==================
config.specs = [join(process.cwd(), './tests/specs/mobile.spec.js')]
config.specFileRetries = 0

// ============
// Capabilities
// ============
config.capabilities = [
    // iOSCaps('iPhone 14', 'PORTRAIT', '16.0'),
    // iOSCaps('iPhone 14', 'LANDSCAPE', '16.0'),
    // iOSCaps('iPhone 14 Plus', 'PORTRAIT', '16.0'),
    // iOSCaps('iPhone 14 Plus', 'LANDSCAPE', '16.0'),
    // iOSCaps('iPhone 14 Pro', 'PORTRAIT', '16.0'),
    // iOSCaps('iPhone 14 Pro', 'LANDSCAPE', '16.0'),
    iOSCaps('iPhone 14 Pro Max', 'PORTRAIT', '16.0'),
    // iOSCaps('iPhone 14 Pro Max', 'LANDSCAPE', '16.0'),
]

// ===================
// Image compare setup
// ===================
config.services = [
    [
        WdioImageComparisonService.default,
        {
            addIOSBezelCorners: true,
            baselineFolder: join(process.cwd(), './tests/localBaseline/'),
            formatImageName: '{tag}-{logName}-{width}x{height}',
            screenshotPath: join(process.cwd(), '.tmp/'),
            savePerInstance: true,
            autoSaveBaseline: true,
            blockOutStatusBar: true,
            blockOutToolBar: true,
            blockOutSideBar: true,
            logLevel: 'debug',
        },
    ],
]

function iOSCaps(deviceName, orientation, osVersion) {
    return {
        browserName: 'Safari',
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': deviceName,
        'appium:platformVersion': osVersion,
        'appium:orientation': orientation,
        'appium:newCommandTimeout': 240,
        'appium:language': 'en',
        'appium:locale': 'en',
        'appium:noReset': true,
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
            }${osVersion.split('.')[0]}`.replace(
                /(\s+|\(+|\)+|Simulator)/g,
                ''
            ),
            // The commands that need to be executed, none means all,
            // otherwise an array of strings with the commands that
            // need to be executed
            wdioIcsCommands: [],
        },
    }
}

exports.config = config
