import { join } from 'node:path'
import { config as sharedLambdaTestConfig } from './wdio.lambdatest.shared.conf.ts'

const buildName = process.env.CI
    ? `OCR-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB}`
    : `Local OCR-build-${new Date().getTime()}`

export const config: WebdriverIO.Config  = {
    ...sharedLambdaTestConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            'LT:Options': {
                platformName: 'Windows 10',
                build: buildName,
                project: '@wdio/ocr-service',
                // @ts-expect-error
                w3c: true,
                resolution: '1600x1200',
                queueTimeout: 900,
            },
            'goog:chromeOptions': {
                args: ['--force-dark-mode'],
            },
        },

    ],
    // =====
    // Specs
    // =====
    specs: [
        '../specs/desktop.ocr.spec.ts',
    ],
    // ========
    // Services
    // ========
    services: [
        ...sharedLambdaTestConfig.services || [],
        // ===================
        // OCR compare setup
        // ===================
        [
            'ocr',
            {
                imagesFolder: join(process.cwd(), '.tmp/'),
            },
        ]
    ],
}
