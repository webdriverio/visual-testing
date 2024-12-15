import { config as sharedLambdaTestConfig } from './wdio.lambdatest.shared.conf.ts'
// import { sauceIosSimWeb } from './sauce.ios.sims.web.ts'
// import { sauceAndroidEmusWeb } from './sauce.android.emus.web.js'
import { lambdaDesktopBrowsers } from './lambdatest.desktop.browsers.ts'

const buildIdentifier = process.env.CI
    ? `Web-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB} - ${new Date().getTime()}`
    : `Local Web-build-${new Date().getTime()}`

export const config: WebdriverIO.Config = {
    ...sharedLambdaTestConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        // ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'sims'
        //     ? sauceIosSimWeb({
        //         buildName: buildIdentifier,
        //     })
        //     : []),
        // ...(!process.env.SAUCE_ENV || process.env.SAUCE_ENV === 'emu'
        //     ? sauceAndroidEmusWeb({
        //         buildName: buildIdentifier,
        //     })
        //     : []),
        ...(!process.env.LT_ENV || process.env.LT_ENV === 'desktop'
            ? lambdaDesktopBrowsers({
                buildName: buildIdentifier,
            })
            : []),
    ],
}
