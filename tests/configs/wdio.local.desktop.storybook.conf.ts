import { join } from 'node:path'
import { config as sharedConfig } from './wdio.shared.conf.ts'
import type { VisualServiceOptions } from '@wdio/visual-service'

export const config: WebdriverIO.Config  = {
    ...sharedConfig,
    logLevel: 'silent',
    capabilities: [],
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
                // debug: true,
                // storybook: {
                //     /**
                //      * Demo storybook URLs with a lot of components
                //      */
                //     // url: 'https://www.bbc.co.uk/iplayer/storybook/',
                //     // url: 'https://angular.carbondesignsystem.com/',
                //     // url: 'https://govuk-react.github.io/govuk-react/',
                //     // skipStories: ['example-button--secondary', 'example-button--small']
                //     // skipStories: 'example-button--secondary,example-button--small'
                //     // skipStories: '/.*button.*/gm'
                // }
            } satisfies VisualServiceOptions,
        ]
    ],
}
