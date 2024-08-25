import { config as localDesktopConfig } from './wdio.local.desktop.conf.ts'

export const config: Omit<WebdriverIO.Config, 'capabilities'> = {
    ...localDesktopConfig,
    // =====
    // Specs
    // =====
    specs: ['../specs/init.spec.ts'],
}
