import { join, normalize } from 'node:path'
import { rmSync } from 'node:fs'
import logger from '@wdio/logger'
import { defaultOptions } from './helpers/options.js'
import { FOLDERS } from './helpers/constants.js'
import type { Folders } from './base.interfaces.js'
import type { ClassOptions, DefaultOptions } from './helpers/options.interfaces.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core')

export default class BaseClass {
    defaultOptions: DefaultOptions
    folders: Folders

    constructor(options: ClassOptions) {
        // Determine default options
        this.defaultOptions = defaultOptions(options)

        // Setup folder structure
        this.folders = this._setupFolders(options)

        // Clear runtime folders if requested
        if (options.clearRuntimeFolder) {
            this._clearRuntimeFolders()
        }
    }

    /**
     * Setup the folder structure for screenshots
     * @private
     */
    private _setupFolders(options: ClassOptions): Folders {
        const baselineFolder = typeof options.baselineFolder === 'function'
            ? options.baselineFolder(options)
            : normalize(options.baselineFolder || FOLDERS.DEFAULT.BASE)

        const baseFolder = typeof options.screenshotPath === 'function'
            ? options.screenshotPath(options)
            : normalize(options.screenshotPath || FOLDERS.DEFAULT.SCREENSHOTS)

        return {
            actualFolder: join(baseFolder, FOLDERS.ACTUAL),
            baselineFolder,
            diffFolder: join(baseFolder, FOLDERS.DIFF),
        }
    }

    /**
     * Clear the runtime folders (actual and diff)
     * @private
     */
    private _clearRuntimeFolders(): void {
        log.info('\x1b[33m\n##############################\n!!CLEARING RUNTIME FOLDERS!!\n##############################\x1b[0m')

        try {
            rmSync(this.folders.actualFolder, { recursive: true, force: true })
            log.debug(`Cleared actual folder: ${this.folders.actualFolder}`)
        } catch (error) {
            log.warn(`Failed to clear actual folder ${this.folders.actualFolder}:`, error)
        }

        try {
            rmSync(this.folders.diffFolder, { recursive: true, force: true })
            log.debug(`Cleared diff folder: ${this.folders.diffFolder}`)
        } catch (error) {
            log.warn(`Failed to clear diff folder ${this.folders.diffFolder}:`, error)
        }
    }
}
