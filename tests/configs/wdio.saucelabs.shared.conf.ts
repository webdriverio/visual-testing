import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { setValue, getValue } from '@wdio/shared-store-service'
import { default as SauceLabs, type Job } from 'saucelabs'
import { config as sharedConfig } from './wdio.shared.conf.ts'
import type { RetriesSpecs } from '../types/types.ts'

const SPEC_FILE_RETRIES = 'specFileRetries'

export const config: Options.Testrunner = {
    ...sharedConfig,
    // =====================
    // Sauce specific config
    // =====================
    user: process.env.SAUCE_USERNAME_WDIO_ICS,
    key: process.env.SAUCE_ACCESS_KEY_WDIO_ICS,
    region: 'eu',
    // ============
    // Capabilities
    // ============
    capabilities: [],
    // ========
    // Services
    // ========
    services: [
        'sauce',
        'shared-store',
        // ===================
        // Image compare setup
        // ===================
        [
            'visual',
            {
                addIOSBezelCorners: true,
                baselineFolder: join(
                    process.cwd(),
                    './tests/sauceLabsBaseline/'
                ),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                blockOutSideBar: true,
                logLevel: 'debug',
                rawMisMatchPercentage: process.env.RAW_MISMATCH || false,
                enableLayoutTesting: true,
            },
        ],
    ],
    // =====
    // Hooks
    // =====
    onPrepare: async (config) => {
        const specFileRetries = config.specFileRetries
        if (specFileRetries !== undefined) {
            await setValue(SPEC_FILE_RETRIES, specFileRetries)
        }
    },
    // If a test fails the first time and succeeds the second them, then our build would still be marked as failed.
    // That's why we've implemented an after-hook that will
    // - check after each spec file if the test failed (result === 1)
    // - store it in a global scope
    // - check if the test has been executed for the second time (the retry) and if so, it will check if the status is
    //   passed (result === 0), then it will update the the previous failed status to passed and change the name
    after: async (result, _capabilities, specs) => {
        const specFileRetries = (await getValue(SPEC_FILE_RETRIES)) as number
        // Get the spec name path
        const specFileNamePath = specs[0]
        const RETRIED_SPECS_KEY = 'retriedSpecs'
        const retriedSpecs: RetriesSpecs[] = []

        // If the retriedSpecs array was not already created, then create it
        if (!(await getValue(RETRIED_SPECS_KEY))) {
            await setValue(RETRIED_SPECS_KEY, [])
        }

        // The test failed and should be retried
        // Store the retry spec on the global scope
        if (specFileRetries && specFileRetries > 0 && result === 1) {
            Array.prototype.push.apply(
                retriedSpecs,
                (await getValue(RETRIED_SPECS_KEY)) as RetriesSpecs[]
            )
            retriedSpecs.push({
                sessionId: browser.sessionId,
                specFileNamePath,
            })
            browser.sharedStore.set(RETRIED_SPECS_KEY, retriedSpecs)
        }

        // When the test succeeds
        if (result === 0) {
            // Find the test that failed before
            const matchingSession = (
                (await getValue(RETRIED_SPECS_KEY)) as RetriesSpecs[]
            ).find(
                (retriedSpec) =>
                    retriedSpec.specFileNamePath === specFileNamePath
            )
            // If there is a matching session
            if (matchingSession) {
                // Then update the test in Sauce Labs with the API
                // @ts-ignore
                const api = new SauceLabs.default({
                    user: process.env.SAUCE_USERNAME_WDIO_ICS as string,
                    key: process.env.SAUCE_ACCESS_KEY_WDIO_ICS as string,
                    region: 'eu',
                })
                // We need to get the name of the job to be able to pre and post fix it
                const jobData = await api.getJob(
                    process.env.SAUCE_USERNAME_WDIO_ICS as string,
                    matchingSession.sessionId
                )

                // Only update the job name and status if it hasn't been updated previously
                // The change that this will happen is very small, but this is a fail save
                if (
                    jobData.name &&
                    !jobData.name.includes('Succeeded after retry')
                ) {
                    // Pre and post fix the job name
                    const body: Job = {
                        id: matchingSession.sessionId,
                        name: `❌ - ${jobData.name} - Succeeded after retry`,
                        passed: true,
                    }
                    // Now update the job
                    await api.updateJob(
                        process.env.SAUCE_USERNAME_WDIO_ICS as string,
                        matchingSession.sessionId,
                        body
                    )
                }
            }
        }
    },
}
