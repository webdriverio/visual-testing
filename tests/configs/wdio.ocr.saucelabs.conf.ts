import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedSauceConfig } from './wdio.saucelabs.shared.conf.ts'

const buildName = process.env.CI
    ? `OCR-${process.env.GITHUB_WORKFLOW} - ${process.env.GITHUB_JOB}`
    : `Local OCR-build-${new Date().getTime()}`

export const config: Options.Testrunner = {
    ...sharedSauceConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 11',
            'sauce:options': {
                build: buildName,
                screenResolution: '1600x1200',
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
        ...sharedSauceConfig.services || [],
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
