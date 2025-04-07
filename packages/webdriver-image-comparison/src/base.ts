import { join, normalize } from 'node:path'
import { rmSync } from 'node:fs'
import logger from '@wdio/logger'
import { defaultOptions } from './helpers/options.js'
import { FOLDERS } from './helpers/constants.js'
import type { Folders } from './base.interfaces.js'
import type { ClassOptions, DefaultOptions } from './helpers/options.interfaces.js'
import type { DeviceRectangles } from './methods/rectangles.interfaces.js'
import { ViewportContextManager } from './helpers/viewportContextManager.js'

const log = logger('@wdio/visual-service:webdriver-image-comparison')

export default class BaseClass {
    defaultOptions: DefaultOptions
    deviceRectangles: DeviceRectangles
    folders: Folders

    constructor(options: ClassOptions) {
        // determine default options
        this.defaultOptions = defaultOptions(options)

        const baselineFolder = typeof options.baselineFolder === 'function'
            ? options.baselineFolder(options)
            : normalize(options.baselineFolder || FOLDERS.DEFAULT.BASE)
        const baseFolder = typeof options.screenshotPath === 'function'
            ? options.screenshotPath(options)
            : normalize(options.screenshotPath || FOLDERS.DEFAULT.SCREENSHOTS)

        this.folders = {
            actualFolder: join(baseFolder, FOLDERS.ACTUAL),
            baselineFolder,
            diffFolder: join(baseFolder, FOLDERS.DIFF),
        }
        this.deviceRectangles = ViewportContextManager.getInstance().get()

        if (options.clearRuntimeFolder) {
            log.info('\x1b[33m\n##############################\n!!CLEARING!!\n##############################\x1b[0m')
            rmSync(this.folders.actualFolder, { recursive: true, force: true })
            rmSync(this.folders.diffFolder, { recursive: true, force: true })
        }
    }
}
