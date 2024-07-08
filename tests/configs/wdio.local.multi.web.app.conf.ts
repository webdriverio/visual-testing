import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'
console.log(join(
    process.cwd(),
    'apps',
    // Change this name according to the app version you downloaded
    'android.wdio.native.app.v1.0.8.apk'
),)

export const config: Options.Testrunner = {
    ...sharedConfig,
    // ============
    // Capabilities
    // ============
    capabilities: {
        chromeBrowserOne: {
            capabilities: {
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
                    args: [
                        'disable-infobars',
                        '--headless',
                    ],
                },
                'wdio-ics:options': {
                    // @TODO: I need to check how I can add the `logName` to the `wdio-ics:options`
                    // @ts-ignore
                    logName: 'chrome-latest-one',
                },
            },
        },
        androidApp: {
            hostname: '127.0.0.1',
            port: 4723,
            capabilities: {
                platformName: 'Android',
                'appium:automationName': 'UIAutomator2',
                'appium:deviceName': 'Pixel_7_Pro_Android_14_API_34',
                'appium:platformVersion': '14.0',
                'appium:app': join(
                    process.cwd(),
                    'apps',
                    // Change this name according to the app version you downloaded
                    'android.wdio.native.app.v1.0.8.apk'
                ),
                'appium:orientation': 'PORTRAIT',
                'appium:newCommandTimeout': 240,
                'wdio-ics:options': {
                    logName: 'Pixel7Pro14_app'
                },
            },
        },
    },
    // =====
    // Specs
    // =====
    specs: ['../specs/multiremote.web.app.spec.ts'],
    // ========
    // Services
    // =======
    services: [
        [
            // ===================
            // Image compare setup
            // ===================
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
                enableLayoutTesting: true,
            },
        ],
    ],
    // =====
    // Hooks
    // =====
    before: async () => {
        // Set the default screensize
        //Note: browser.setWindowSize does not execute on each browser unlike some of the other commands.
        if (multiremotebrowser.chromeBrowserOne) {
            await multiremotebrowser.chromeBrowserOne.setWindowSize(1366, 768)
        }
    },
}

