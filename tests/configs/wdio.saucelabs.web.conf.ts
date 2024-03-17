import type { Options } from '@wdio/types'
import { config as sharedSauceConfig } from './wdio.saucelabs.shared.conf.ts'
import { sauceIosSimWeb } from './sauce.ios.sims.web.ts'
import { sauceAndroidEmusWeb } from './sauce.android.emus.web.js'
import { sauceDesktopBrowsers } from './sauce.desktop.browsers.js'

const buildIdentifier = process.env.CI
    ? `Web-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB} - ${new Date().getTime()}`
    : `Local Web-build-${new Date().getTime()}`

export const config: Options.Testrunner = {
    ...sharedSauceConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'sims'
            ? sauceIosSimWeb({
                buildName: buildIdentifier,
            })
            : []),
        ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'emu'
            ? sauceAndroidEmusWeb({
                buildName: buildIdentifier,
            })
            : []),
        ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'desktop'
            ? sauceDesktopBrowsers({
                buildName: buildIdentifier,
            })
            : []),
    ],
}
