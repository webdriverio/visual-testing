import type { Capabilities } from '@wdio/types'
import type { ClassOptions } from '@wdio/image-comparison-core'
import { BaseClass } from '@wdio/image-comparison-core'
import { prepareStorybook, cleanupStorybook } from './storybook/hooks.js'
import generateVisualReport from './reporter.js'

export default class VisualLauncher extends BaseClass {
    #options: ClassOptions

    constructor(options: ClassOptions) {
        super(options)
        this.#options = options
    }

    async onPrepare(config: WebdriverIO.Config, capabilities: Capabilities.TestrunnerCapabilities) {
        if (this.#options.clearRuntimeFolder) {
            this._clearRuntimeFolders()
        }

        await prepareStorybook(config, capabilities, this.#options, this.folders)
    }

    async onComplete() {
        cleanupStorybook()

        if (this.#options.createJsonReportFiles) {
            new generateVisualReport(
                { directoryPath: this.folders.actualFolder }
            ).generate()
        }
    }
}
