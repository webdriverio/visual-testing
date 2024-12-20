import { config as sharedLambdaTestConfig } from './wdio.lambdatest.shared.conf.ts'
import { lambdaTestIosSimWeb } from './lambdatest.ios.sims.web.ts'
import { lambdaTestAndroidEmusWeb } from './lambdatest.android.emus.web.js'
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
        ...(!process.env.LT_ENV || process.env.LT_ENV === 'sims'
            ? lambdaTestIosSimWeb({
                buildName: buildIdentifier,
            })
            : []),
        ...(!process.env.LT_ENV || process.env.LT_ENV === 'emu'
            ? lambdaTestAndroidEmusWeb({
                buildName: buildIdentifier,
            })
            : []),
        ...(!process.env.LT_ENV || process.env.LT_ENV === 'desktop'
            ? lambdaDesktopBrowsers({
                buildName: buildIdentifier,
            })
            : []),
    ],
}
