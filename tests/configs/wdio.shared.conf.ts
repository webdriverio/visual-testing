import type { Options } from '@wdio/types'

export const config: Options.Testrunner = {
    //
    // ====================
    // Runner Configuration
    // ====================
    // WebdriverIO supports running e2e tests as well as unit and component tests.
    runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true,
        },
    },
    // ============
    // Capabilities
    // ============
    maxInstances: 20,
    // For the rest see the specific configs
    capabilities: [],

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'silent',
    baseUrl: 'https://wswebcreation.github.io/protractor-image-comparison/',
    waitforTimeout: 15000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 0,
    framework: 'mocha',
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        timeout: 10 * 60 * 1000,
    },
    reporters: ['spec'],
    specFileRetries: 2,
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
