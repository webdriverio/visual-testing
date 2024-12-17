import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
    // ===================
    // Test Configurations
    // ===================
    specFileRetries: 2,
    // ==========================
    // LambdaTest specific config
    // ==========================
    user: process.env.LAMBDATEST_USERNAME,
    key: process.env.LAMBDATEST_ACCESS_KEY,
    // ============
    // Capabilities
    // ============
    capabilities: [],
    // ========
    // Services
    // ========
    services: [
        'lambdatest',
        // ===================
        // Image compare setup
        // ===================
        [
            'visual',
            {
                addIOSBezelCorners: true,
                baselineFolder: join(
                    process.cwd(),
                    './tests/lambdaTestBaseline/'
                ),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                blockOutSideBar: true,
                createJsonReportFiles: true,
                rawMisMatchPercentage: process.env.RAW_MISMATCH || false,
                enableLayoutTesting: true,
            },
        ],
    ],
}
