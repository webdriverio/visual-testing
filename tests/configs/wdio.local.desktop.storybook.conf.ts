import type { Options } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'

export const config: Options.Testrunner = {
    ...sharedConfig,
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
                baselineFolder: join(process.cwd(), './__snapshots__/'),
                debug: true,
                // storybook: {
                //     /**
                //      * Demo storybook URLs with a lot of components
                //      */
                //     // url: 'https://www.bbc.co.uk/iplayer/storybook/',
                //     // url: 'https://angular.carbondesignsystem.com/',
                // }
            },
        ]
    ],
}
