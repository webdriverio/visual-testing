import type { Options } from '@wdio/types'
import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: Options.Testrunner = {
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
