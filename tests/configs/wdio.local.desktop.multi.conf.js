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
                logName: 'chrome-latest',
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
                logName: 'chrome-latest',
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

exports.config = config;
