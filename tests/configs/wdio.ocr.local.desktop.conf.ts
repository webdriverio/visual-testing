import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

const chromeArgs = [
    'disable-infobars',
    process.argv.includes('--disableHeadless') ? '' : '--headless'
].filter(arg => arg !== '')

export const config: WebdriverIO.Config  = {
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
    // Uncomment this to test with multiremote
    // capabilities: {
    //     myChromeBrowser: {
    //         capabilities: {
    //             browserName: 'chrome'
    //         }
    //     },
    //     myFirefoxBrowser: {
    //         capabilities: {
    //             browserName: 'firefox'
    //         }
    //     }
    // },
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
