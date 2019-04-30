const { join } = require('path');

exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',

    // ============
    // Capabilities
    // ============
    maxInstances: 100,
    // For the rest see the specific configs

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'silent',
    baseUrl: 'https://wswebcreation.github.io/protractor-image-comparison/',
    waitforTimeout: 15000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    framework: 'jasmine',
    reporters: [ 'spec' ],
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000,
    },

    // =====
    // Hooks
    // =====
    beforeSession: () => {
        require('@babel/register');
    },

    before: (capabilities) => {
        // Add a default logname to the browserobject that is used in the basic specs
        browser.logName = capabilities.logName
            || (capabilities[ 'sauce:options' ] ? capabilities[ 'sauce:options' ].logName : null)
            || (capabilities[ 'appium:options' ] ? capabilities[ 'appium:options' ].logName : null)
            || '';

        // Set the default screensize
        if (!browser.isMobile) {
            browser.setWindowSize(1366, 768);
        }
    },
}
