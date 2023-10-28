import type { Options } from '@wdio/types'
import { join } from 'node:path'
import WdioImageComparisonService from '../../build/index.js'
import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: Options.Testrunner = {
    ...sharedConfig,
    // ===================
    // Automation protocol
    // ===================
    automationProtocol: 'devtools',
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
                // @TODO: Getting this error, not during runtime, but in VSCode
                // Need to figure out why this is happening
                // ```
                // Type '{ args: string[]; }' is not assignable to type 'WebdriverIO'.
                //  Object literal may only specify known properties, and 'args' does not exist in type 'WebdriverIO'.ts(2322)
                // Capabilities.d.ts(87, 5): The expected type comes from this index signature.
                // ```
                // @ts-ignore
                args: ['disable-infobars', '--headless'],
            },
            'wdio-ics:options': {
                logName: 'chrome-dev-tools-headless',
            },
        },
    ],
    // =====
    // Specs
    // =====
    specs : [
        '../specs/basics.spec.ts',
        '../specs/desktop.spec.ts',
    ],
    // ========
    // Services
    // ========
    services : [
        'devtools',
        // ===================
        // Image compare setup
        // ===================
        [
            WdioImageComparisonService,
            {
                baselineFolder: join(process.cwd(), './localBaseline/'),
                debug: true,
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                clearRuntimeFolder: true,
            },
        ],
    ]
}
