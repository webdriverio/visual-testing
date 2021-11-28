const {join} = require('path');
const {config} = require('./wdio.shared.conf');
const WdioImageComparisonService = require('../../build/');
const {sauceIosSim} = require("./sauce.ios.sims");
const {sauceAndroidEmus} = require("./sauce.android.emus");
const {sauceDesktopBrowsers} = require("./sauce.desktop.browsers");

const buildIdentifier = process.env.CI ? `${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB}` : `Local build-${new Date().getTime()}`;

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
    ...sauceIosSim({
        buildName: buildIdentifier,
    }),
    /**
     * Android
     */
    ...sauceAndroidEmus({
        buildName: buildIdentifier,
    }),
    /**
     * Desktop browser
     */
    ...sauceDesktopBrowsers({
        buildName: buildIdentifier,
    }),
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
        n: true,
        logLevel: 'debug',
    }],
];

exports.config = config;
