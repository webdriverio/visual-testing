import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: Omit<WebdriverIO.Config, 'capabilities'>  = {
    ...sharedConfig,
    logLevel: 'silent',
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: [
        'storybook',
    ],
    // services: [['visual', {}]],
}
