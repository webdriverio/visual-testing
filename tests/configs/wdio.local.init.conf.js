const { config } = require('./wdio.local.desktop.conf');

// ============
// Capabilities
// ============
config.capabilities = [
    {
        browserName: 'chrome',
        specs: [
            './tests/specs/init.spec.js',
        ],
        'goog:chromeOptions': {
            args: [ 'disable-infobars' ],
        },
        'wdio-ics:options': {
            logName: 'chrome-latest',
        },
    },
];

exports.config = config;
