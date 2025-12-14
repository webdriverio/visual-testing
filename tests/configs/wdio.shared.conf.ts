export const config: Omit<WebdriverIO.Config, 'capabilities'> = {
    //
    // ====================
    // Runner Configuration
    // ====================
    // WebdriverIO supports running e2e tests as well as unit and component tests.
    runner: 'local',
    // ============
    // Capabilities
    // ============
    maxInstances: 25,

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'silent',
    baseUrl: 'http://guinea-pig.webdriver.io/image-compare.html',
    waitforTimeout: 15000,
    connectionRetryTimeout: 180 * 1000,
    connectionRetryCount: 0,
    framework: 'mocha',
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        timeout: 10 * 60 * 1000,
    },
    reporters: ['dot'],
    specFileRetriesDelay: 0,

    // =====
    // Hooks
    // =====
    before: async (_capabilities, _specs, browser) => {
        // Set the default screensize
        if (!browser.isMobile) {
            await browser.setWindowSize(1366, 768)
        }
    },
}
