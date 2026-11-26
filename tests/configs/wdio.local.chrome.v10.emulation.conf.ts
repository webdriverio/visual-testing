import { join } from 'node:path'
import { rmSync } from 'node:fs'
import { config as v10Config } from './wdio.local.chrome.v10.conf.ts'

/**
 * Chrome mobile emulation with `mobileEmulation.deviceName` in a WebDriver BiDi session.
 * WebdriverIO applies the emulation itself, the visual service must not change it.
 */
const baselineFolder = join(process.cwd(), '.tmp/v10-e2e/emulation/baseline')

export const config: WebdriverIO.Config = {
    ...v10Config,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless=new', '--disable-gpu', '--hide-scrollbars'],
            mobileEmulation: { deviceName: 'iPhone 12 Pro' },
        },
        'wdio-ics:options': {
            logName: 'local-chrome-v10-emulation',
        },
    }],
    specs: ['../specs/v10.emulation.spec.ts'],
    // The shared `before` hook sets a desktop window size, which would replace the size of the emulated device
    before: undefined,
    services: [[
        'visual',
        {
            baselineFolder,
            formatImageName: '{tag}-{logName}-{width}x{height}',
            screenshotPath: join(process.cwd(), '.tmp/v10-e2e/emulation/'),
            savePerInstance: true,
            autoSaveBaseline: true,
        },
    ]],
    onPrepare: () => {
        rmSync(baselineFolder, { recursive: true, force: true })
    },
}
