const { join } = require('path');
const { config } = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

// ============
// Capabilities
// ============
config.capabilities = {
    chromeBrowserOne: {
        capabilities: {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    'disable-infobars',
                    '--headless',
                ],
            },
            'wdio-ics:options': {
                logName: 'chrome-latest-one',
            },
        }
    },
    chromeBrowserTwo: {
        capabilities: {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    'disable-infobars',
                    '--headless',
                ],
            },
            'wdio-ics:options': {
                logName: 'chrome-latest-two',
            },
        }
    },
};

// ============
// Capabilities
// ============
config.specs= [
    './tests/specs/multiremote.spec.js'
];

// ===================
// Image compare setup
// ===================
config.services = [
    [ WdioImageComparisonService.default, {
        baselineFolder: join(process.cwd(), './localBaseline/'),
        debug: true,
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        autoSaveBaseline: false,
        savePerInstance: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
    } ],
    'selenium-standalone'
];

// =====
// Hooks
// =====
function getLogName(capabilities) {
    return capabilities.logName
        || (capabilities[ 'sauce:options' ] ? capabilities[ 'sauce:options' ].logName : null)
        || (capabilities[ 'appium:options' ] ? capabilities[ 'appium:options' ].logName : null)
        || (capabilities[ 'wdio-ics:options' ] ? capabilities[ 'wdio-ics:options' ].logName : null)
        || ''
}

config.before = (capabilities) => {
    // Add a default logname to each browser object that is used in the spec
    chromeBrowserOne.logName =  getLogName(capabilities.chromeBrowserOne.capabilities)
    chromeBrowserTwo.logName =  getLogName(capabilities.chromeBrowserTwo.capabilities)

    // Set the default screensize
    //Note: browser.setWindowSize does not execute on each browser unlike some of the other commands.
    if (!chromeBrowserOne.isMobile) {
        chromeBrowserOne.setWindowSize(1366, 768)
    }

    if (!chromeBrowserTwo.isMobile) {
        chromeBrowserTwo.setWindowSize(1366, 768)
    }
};

exports.config = config;
