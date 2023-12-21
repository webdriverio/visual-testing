import type { Options } from '@wdio/types'
import { config as localDevToolsDesktopConfig } from './wdio.local.dev.tools.desktop.conf.ts'

export const config: Options.Testrunner = {
    ...localDevToolsDesktopConfig,
    // =====
    // Specs
    // =====
    specs: ['../specs/init.spec.ts'],
}
