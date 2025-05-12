import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

const chromeArgs = [
    'disable-infobars',
    process.argv.includes('--disableHeadless') ? '' : '--headless'
].filter(arg => arg !== '')

export const config: WebdriverIO.Config = {
    ...sharedConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            // @TODO: Getting this error, not during runtime, but in VSCode
            // Need to figure out why this is happening
            // ```
            // Type 'string' is not assignable to type 'WebdriverIO'.ts(2322)
            // Capabilities.d.ts(87, 5): The expected type comes from this index signature.
            // (property) WebdriverIO.Capabilities.browserName?: string | undefined
            // ```
            // @ts-ignore
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: chromeArgs,
            },
            'wdio-ics:options': {
                logName: 'local-chrome-latest',
            },
        },
    ],
    // =====
    // Specs
    // =====
    specs: [
        '../specs/basics.spec.ts',
        '../specs/desktop.spec.ts',
        '../specs/desktop.bidi.emulated.spec.ts',
        '../specs/matcher.spec.ts',
        '../specs/checkMethodsFolders.spec.ts',
        '../specs/saveMethodsFolders.spec.ts',
    ],
    // ========
    // Services
    // ========
    services: [
        // ===================
        // Image compare setup
        // ===================
        [
            'visual',
            {
                baselineFolder: join(process.cwd(), './localBaseline/'),
                debug: true,
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                createJsonReportFiles: true,
                clearRuntimeFolder: true,
                enableLayoutTesting: true,
            },
        ]
    ],
}
