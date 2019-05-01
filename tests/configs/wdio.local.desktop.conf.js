const { join } = require('path');
const { config } = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

// ============
// Capabilities
// ============
config.capabilities = [
    {
        browserName: 'chrome',
        specs: [
            './tests/specs/basics.spec.js',
            './tests/specs/desktop.spec.js',
        ],
        'goog:chromeOptions': {
            args: [ 'disable-infobars' ],
        },
        'wdio-ics:options': {
            logName: 'chrome-latest',
        },
    },
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
        savePerInstance: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
    } ],
    'selenium-standalone'
];

exports.config = config;
