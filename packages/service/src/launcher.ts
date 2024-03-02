import { rmdirSync } from 'node:fs'
import logger from '@wdio/logger'
import { SevereServiceError } from 'webdriverio'
import type { Capabilities, Options } from '@wdio/types'
import type { ClassOptions } from 'webdriver-image-comparison'
import { BaseClass } from 'webdriver-image-comparison'
import { createStorybookCapabilities, createTestFiles, getArgvValue, isStorybookMode, scanStorybook } from './utils.js'

const log = logger('@wdio/visual-service')

export default class VisualLauncher extends BaseClass  {
    #config: WebdriverIO.Config
    #options: ClassOptions

    constructor(
        options: ClassOptions,
        _: WebdriverIO.Capabilities,
        config: WebdriverIO.Config
    ) {
        super(options)
        this.#config = config
        this.#options = options
    }

    async onPrepare (
        config: Options.Testrunner,
        capabilities: Capabilities.RemoteCapabilities
    ) {
        const isStorybook = isStorybookMode()
        const isCucumberFramework = config.framework === 'cucumber'

        if (isCucumberFramework && isStorybook) {
            throw new SevereServiceError('\n\nRunning Storybook in combination with the cucumber framework adapter is not supported yet\n\n')
        } else if (isStorybook) {
            log.info('Running `@wdio/visual-service` in Storybook mode.')

            const { storiesJson, tempDir } = await scanStorybook(config, log, this.#options)

            // Determine some run options
            const maxInstances = config?.maxInstances ?? 1
            const numShardsOption = this.#options?.storybook?.numShards
            const numShardsArgv = getArgvValue('--numShards', value => parseInt(value, 10))
            const numShards =  Math.min(numShardsOption || numShardsArgv || 1, maxInstances)
            const clipOption = this.#options?.storybook?.clip
            const clipArgv = getArgvValue('--clip', value => value !== 'false')
            const clip = clipOption ?? clipArgv ?? true
            const clipSelectorOption = this.#options?.storybook?.clipSelector
            const clipSelectorArgv = getArgvValue('--clipSelector', value => value)
            const clipSelector = clipSelectorOption ?? clipSelectorArgv ?? '#storybook-root > :first-child'

            // Create the test files
            createTestFiles({
                clip,
                clipSelector,
                directoryPath: tempDir,
                log,
                numShards,
                storiesJson,
            })

            // Create the capabilities
            createStorybookCapabilities(capabilities, log)
        }
    }

    async onComplete () {
        const tempDir = process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER
        if (tempDir) {
            log.info(`Cleaning up temporary folder for storybook specs: ${tempDir}`)
            try {
                rmdirSync(tempDir, { recursive: true })
                log.info(`Temporary folder for storybook specs has been removed: ${tempDir}`)
            } catch (err) {
                log.error(`Failed to remove temporary folder for storybook specs: ${tempDir} due to: ${(err as Error).message}`)
            }

            // Remove the environment variables
            delete process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER
            delete process.env.VISUAL_STORYBOOK_NUM_SHARDS
        }
    }
}
