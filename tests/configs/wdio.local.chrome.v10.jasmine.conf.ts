import { config as v10Config } from './wdio.local.chrome.v10.conf.ts'

/**
 * Same as `wdio.local.chrome.v10.conf.ts`, with the Jasmine framework (Jasmine 6 in WebdriverIO v10)
 */
export const config: WebdriverIO.Config = {
    ...v10Config,
    specs: ['../specs/v10.jasmine.spec.ts'],
    framework: 'jasmine',
    jasmineOpts: {
        defaultTimeoutInterval: 60000,
    },
}
