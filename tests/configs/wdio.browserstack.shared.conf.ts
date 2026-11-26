import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'
import type { VisualServiceOptions } from '@wdio/visual-service'

// @TODO: migrate BrowserStack to WebdriverIO v10 and test it again.
// - `@wdio/browserstack-service` has no v10 version yet (latest is 9.39.3 on 2026-10-04), so this
//   repository still installs the v9 service, which brings in `webdriverio@9`.
// - WebdriverIO v10 requires Appium 3, but `browserstack.real.device.conf.ts` asks for Appium 2.15.0.
// - CI does not run this config. It was added in #971 to check the webview overlay fix (#969) on a real device.
// When BrowserStack ships a v10 service: update the dependency, set an Appium 3 version, and run
// `pnpm test.bs.real.device` with BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY.

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
    // ===================
    // Test Configurations
    // ===================
    specFileRetries: 3,
    // Wait for 8 min, then a new session should be created
    // and the queue should be empty
    connectionRetryTimeout: 8 * 60 * 1000,
    // ============================
    // Browserstack specific config
    // ============================
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    // ============
    // Capabilities
    // ============
    capabilities: [],
    // ========
    // Services
    // ========
    services: [
        'browserstack',
        // ===================
        // Image compare setup
        // ===================
        [
            'visual',
            {
                addIOSBezelCorners: true,
                baselineFolder: join(
                    process.cwd(),
                    'tmp/browserstackBaseline/'
                ),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                blockOutSideBar: true,
                createJsonReportFiles: true,
                rawMisMatchPercentage: !!process.env.RAW_MISMATCH || false,
                enableLayoutTesting: true,
            } satisfies VisualServiceOptions,
        ],
    ],
}
