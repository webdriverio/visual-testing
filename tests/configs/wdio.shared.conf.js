exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: "local",

    // ============
    // Capabilities
    // ============
    maxInstances: 20,
    // For the rest see the specific configs

    // ===================
    // Test Configurations
    // ===================
    logLevel: "silent",
    baseUrl: "https://wswebcreation.github.io/protractor-image-comparison/",
    waitforTimeout: 15000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    framework: "jasmine",
    reporters: ["spec"],
    jasmineOpts: {
        defaultTimeoutInterval: 180000,
    },
    specFileRetries: 2,
    specFileRetriesDelay: 0,
    autoCompileOpts: {
        autoCompile: true,
    },

    // =====
    // Hooks
    // =====
    before: async (capabilities) => {
        // Add a default log name to the browserobject that is used in the basic specs
        browser.logName =
            capabilities.logName ||
            (capabilities["sauce:options"]
                ? capabilities["sauce:options"].logName
                : null) ||
            (capabilities["appium:options"]
                ? capabilities["appium:options"].logName
                : null) ||
            (capabilities["wdio-ics:options"]
                ? capabilities["wdio-ics:options"].logName
                : null) ||
            "";

        // Set the default screensize
        if (!browser.isMobile) {
            await browser.setWindowSize(1366, 768);
        }
    },
};
