import { browser } from '@wdio/globals'
import { config as sharedLambdaTestConfig } from './wdio.lambdatest.shared.conf.ts'
import { lambdaTestIosSimWeb } from './lambdatest.ios.sims.web.ts'
import { lambdaTestAndroidEmusWeb } from './lambdatest.android.emus.web.js'
import { lambdaDesktopBrowsers } from './lambdatest.desktop.browsers.ts'

const buildIdentifier = process.env.CI
    ? `Web-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB} - ${new Date().getTime()}`
    : `Local Web-build-${new Date().getTime()}`

// TODO(temporary): remove when the cause of the flaky Android 15 and 16 visual mismatches is known.
// Logs the browser data of each Android session once, to compare the sessions that pass and fail.
let isAndroidSessionLogged = false

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
    afterTest: async () => {
        if (isAndroidSessionLogged || !browser.isAndroid) {
            return
        }
        isAndroidSessionLogged = true
        const page = await browser.execute(() => ({
            userAgent: navigator.userAgent,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            visualViewport: `${window.visualViewport?.width}x${window.visualViewport?.height}`,
            screen: `${window.screen.width}x${window.screen.height}`,
            devicePixelRatio: window.devicePixelRatio,
        }))
        console.log(`[Android session] ${JSON.stringify({
            capabilities: browser.capabilities,
            page,
        })}`)
    },
}
