import { join } from 'node:path'
import { rmSync } from 'node:fs'
import { config as sharedConfig } from './wdio.shared.conf.ts'

/**
 * Runs on a local headless Chrome, so it needs no cloud credentials and also runs for pull requests from forks.
 * The specs create their baselines in the same run.
 */
const baselineFolder = join(process.cwd(), '.tmp/v10-e2e/baseline')

export const config: WebdriverIO.Config = {
    ...sharedConfig,
    baseUrl: undefined,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
        },
        'wdio-ics:options': {
            logName: 'local-chrome-v10',
        },
    }],
    specs: ['../specs/v10.browsingContexts.spec.ts'],
    // Chrome runs headless, so no display server is needed on Linux
    displayServerEnabled: false,
    services: [[
        'visual',
        {
            baselineFolder,
            // No {width}x{height}: a tab in the background reports another window size (outerHeight), so a
            // check in a background tab would get another file name and save a new baseline instead of comparing
            formatImageName: '{tag}-{logName}',
            screenshotPath: join(process.cwd(), '.tmp/v10-e2e/'),
            savePerInstance: true,
            autoSaveBaseline: true,
        },
    ]],
    onPrepare: () => {
        rmSync(baselineFolder, { recursive: true, force: true })
    },
}
