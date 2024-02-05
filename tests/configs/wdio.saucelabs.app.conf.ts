import type { Options } from '@wdio/types'
import { config as sharedSauceConfig } from './wdio.saucelabs.shared.conf.ts'
import { sauceIosSimApp } from './sauce.ios.sims.app.ts'
import { sauceAndroidEmusApp } from './sauce.android.emus.app.js'

const buildIdentifier = process.env.CI
    ? `App-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB}`
    : `Local App-build-${new Date().getTime()}`

export const config: Options.Testrunner = {
    ...sharedSauceConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'sims'
            ? sauceIosSimApp({
                buildName: buildIdentifier,
            })
            : []),
        ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'emu'
            ? sauceAndroidEmusApp({
                buildName: buildIdentifier,
            })
            : []),
    ],
}
