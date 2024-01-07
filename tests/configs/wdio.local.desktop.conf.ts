import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: Options.Testrunner = {
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
                autoSaveBaseline: true,
                savePerInstance: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                clearRuntimeFolder: true,
            },
        ],
        'chromedriver',
    ],
}
