const { join } = require('path')
const SauceLabs = require('saucelabs')
const { config } = require('./wdio.shared.conf')
const WdioImageComparisonService = require('../../build/')
const sauceIosSim = require('./sauce.ios.sims')
const sauceAndroidEmus = require('./sauce.android.emus')
const sauceDesktopBrowsers = require('./sauce.desktop.browsers')

const buildIdentifier = process.env.CI
    ? `${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB}`
    : `Local build-${new Date().getTime()}`

// =========================
// Sauce RDC specific config
// =========================
config.user = process.env.SAUCE_USERNAME_WDIO_ICS
config.key = process.env.SAUCE_ACCESS_KEY_WDIO_ICS
config.region = 'eu'

// ============
// Capabilities
// ============
config.capabilities = [
    ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'sims'
        ? sauceIosSim({
            buildName: buildIdentifier,
        })
        : []),
    ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'emu'
        ? sauceAndroidEmus({
            buildName: buildIdentifier,
        })
        : []),
    ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'desktop'
        ? sauceDesktopBrowsers({
            buildName: buildIdentifier,
        })
        : []),
]

// ===================
// Image compare setup
// ===================
config.services = [
    'sauce',
    'shared-store',
    [
        WdioImageComparisonService.default,
        {
            addIOSBezelCorners: true,
            baselineFolder: join(process.cwd(), './tests/sauceLabsBaseline/'),
            formatImageName: '{tag}-{logName}-{width}x{height}',
            screenshotPath: join(process.cwd(), '.tmp/'),
            savePerInstance: true,
            autoSaveBaseline: true,
            blockOutStatusBar: true,
            blockOutToolBar: true,
            blockOutSideBar: true,
            logLevel: 'debug',
        },
    ],
]

// If a test fails the first time and succeeds the second them, then our build would still be marked as failed.
// That's why we've implemented an after-hook that will
// - check after each spec file if the test failed (result === 1)
// - store it in a global scope
// - check if the test has been executed for the second time (the retry) and if so, it will check if the status is
//   passed (result === 0), then it will update the the previous failed status to passed and change the name
config.after = async (result, _capabilities, specs) => {
    // Get the spec name path
    const specFileNamePath = specs[0]
    const RETRIED_SPECS_KEY = 'retriedSpecs'

    // If the retriedSpecs array was not already created, then create it
    if (!browser.sharedStore.get(RETRIED_SPECS_KEY)) {
        browser.sharedStore.set(RETRIED_SPECS_KEY, [])
    }

    // The test failed and should be retried
    // Store the retry spec on the global scope
    if (
        'specFileRetries' in browser.config &&
        browser.config.specFileRetries > 0 &&
        result === 1
    ) {
        const retriedSpecs = browser.sharedStore.get(RETRIED_SPECS_KEY)
        retriedSpecs.push({
            sessionId: browser.sessionId,
            specFileNamePath,
        })
        browser.sharedStore.set(RETRIED_SPECS_KEY, retriedSpecs)
    }

    // When the test succeeds
    if (result === 0) {
        // Find the test that failed before
        const matchingSession = browser.sharedStore
            .get(RETRIED_SPECS_KEY)
            .find(
                (retriedSpec) =>
                    retriedSpec.specFileNamePath === specFileNamePath
            )
        // If there is a matching session
        if (matchingSession) {
            // Then update the test in Sauce Labs with the API
            const api = new SauceLabs({
                user: browser.config.user,
                key: browser.config.key,
                region: browser.config.region,
            })
            // We need to get the name of the job to be able to pre and post fix it
            const jobData = await api.getJob(
                process.env.SAUCE_USERNAME,
                matchingSession.sessionId
            )

            // Only update the job name and status if it hasn't been updated previously
            // The change that this will happen is very small, but this is a fail save
            if (
                jobData.name &&
                !jobData.name.includes('Succeeded after retry')
            ) {
                // Pre and post fix the job name
                const body = {
                    name: `❌ - ${jobData.name} - Succeeded after retry`,
                    passed: true,
                }
                // Now update the job
                await api.updateJob(
                    process.env.SAUCE_USERNAME,
                    matchingSession.sessionId,
                    body
                )
            }
        }
    }
}

exports.config = config
