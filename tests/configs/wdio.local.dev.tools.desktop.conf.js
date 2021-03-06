const {join} = require('path');
const {config} = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');

// ===================
// Automation protocol
// ===================
config.automationProtocol = 'devtools';

// ============
// Capabilities
// ============
config.capabilities = [
    {
        browserName: 'chrome',
        'goog:chromeOptions': {
            headless: true,
        },
        'wdio-ics:options': {
            logName: 'chrome-dev-tools-headless',
        },
    },
];

// ============
// Capabilities
// ============
config.specs = [
    './tests/specs/basics.spec.js',
    './tests/specs/desktop.spec.js',
];

// ===================
// Image compare setup
// ===================
config.services = [
    'devtools',
    [WdioImageComparisonService.default, {
        baselineFolder: join(process.cwd(), './localBaseline/'),
        debug: true,
        formatImageName: '{tag}-{logName}-{width}x{height}',
        screenshotPath: join(process.cwd(), '.tmp/'),
        savePerInstance: true,
        blockOutStatusBar: true,
        blockOutToolBar: true,
        clearRuntimeFolder: true,
    }],
];

exports.config = config;
