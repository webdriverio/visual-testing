import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

const chromeArgs = [
    'disable-infobars',
    process.argv.includes('--disableHeadless') ? '' : '--headless'
].filter(arg => arg !== '')

export const config: Options.Testrunner = {
    ...sharedConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: chromeArgs,
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
        // ===================
        // OCR compare setup
        // ===================
        // 'ocr',
        [
            'ocr',
            {
                imagesFolder: join(process.cwd(), '.tmp/'),
            },
        ]
    ],
}
