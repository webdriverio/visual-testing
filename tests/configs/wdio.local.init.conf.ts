import type { Options } from '@wdio/types'
import { config as localDesktopConfig } from './wdio.local.desktop.conf.ts'

export const config: Options.Testrunner = {
    ...localDesktopConfig,
    // =====
    // Specs
    // =====
    specs: ['../specs/init.spec.ts'],
}
