import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'
import type { VisualServiceOptions } from '@wdio/visual-service'

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
