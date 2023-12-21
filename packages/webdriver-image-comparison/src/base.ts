import { join, normalize } from 'node:path'
import { removeSync } from 'fs-extra'
import { defaultOptions } from './helpers/options'
import { FOLDERS } from './helpers/constants'
import type { Folders } from './base.interface'
import type { ClassOptions, DefaultOptions } from './helpers/options.interface'

export default class BaseClass {
    defaultOptions: DefaultOptions
    folders: Folders

    constructor(options: ClassOptions) {
    // determine default options
        this.defaultOptions = defaultOptions(options)

        let baselineFolder
        let baseFolder

        baselineFolder = typeof options.baselineFolder === 'function' ? options.baselineFolder(options) : normalize(options.baselineFolder || FOLDERS.DEFAULT.BASE)

        baseFolder = typeof options.screenshotPath === 'function' ? options.screenshotPath(options) : normalize(options.screenshotPath || FOLDERS.DEFAULT.SCREENSHOTS)

        this.folders = {
            actualFolder: join(baseFolder, FOLDERS.ACTUAL),
            baselineFolder,
            diffFolder: join(baseFolder, FOLDERS.DIFF),
        }

        if (options.clearRuntimeFolder) {
            console.log('\n\n\n##############################')
            console.log('!!CLEARING!!')
            console.log('##############################\n\n\n')
            removeSync(this.folders.actualFolder)
            removeSync(this.folders.diffFolder)
        }
    }
}
