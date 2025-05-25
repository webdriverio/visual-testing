import type { Capabilities } from '@wdio/types'
import { join } from 'node:path'
import { config as sharedBrowserStackConfig } from './wdio.browserstack.shared.conf.ts'

const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')

export const config: WebdriverIO.Config = {
    ...sharedBrowserStackConfig,
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            'bstack:options': {
                osVersion: '18',
                deviceName: 'iPhone 14',
                projectName: 'ProjectName',
                buildName: 'BuildName',
                sessionName: 'SessionName',
                appiumVersion: '2.15.0',
                realMobile: 'true',
                debug: 'true',
                networkLogs: 'true',
                consoleLogs: 'verbose',
                deviceOrientation: 'PORTRAIT',
            },
            browserName: 'iPhone-14',
            platformName: 'iOS',
            specs: [mobileSpecs],
            'wdio-ics:options': {
                logName: 'browserstack-real-device-iPhone-14',
                commands: [
                    // 'checkScreen',
                    // 'checkFullPageScreen',
                    'checkElement',
                ],
            },
        } as Capabilities.BrowserStackCapabilities,
    ],
}
