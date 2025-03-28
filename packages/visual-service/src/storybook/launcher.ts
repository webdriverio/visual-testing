import { rmdirSync } from 'node:fs'
import logger from '@wdio/logger'
import { SevereServiceError } from 'webdriverio'
import type { Capabilities } from '@wdio/types'
import type { ClassOptions, CheckElementMethodOptions  } from 'webdriver-image-comparison'
import { BaseClass } from 'webdriver-image-comparison'
import {
    createStorybookCapabilities,
    createTestFiles,
    getArgvValue,
    isCucumberFramework,
    isStorybookMode,
    parseSkipStories,
    scanStorybook,
} from './utils.js'
import { CLIP_SELECTOR, NUM_SHARDS, V6_CLIP_SELECTOR } from '../constants.js'
import generateVisualReport from '../reporter.js'

const log = logger('@wdio/visual-service')

export default class VisualLauncher extends BaseClass  {
    #options: ClassOptions

    constructor(options: ClassOptions) {
        super(options)
        this.#options = options
    }

    async onPrepare (config: WebdriverIO.Config, capabilities: Capabilities.TestrunnerCapabilities) {
        const isStorybook = isStorybookMode()
        const framework = config.framework as string
        const isCucumber = isCucumberFramework(framework)

        if (isCucumber && isStorybook) {
            throw new SevereServiceError('\n\nRunning Storybook in combination with the cucumber framework adapter is not supported.\nOnly Jasmine and Mocha are supported.\n\n')
        } else if (isStorybook) {
            log.info('Running `@wdio/visual-service` in Storybook mode.')

            const { storiesJson, storybookUrl, tempDir } = await scanStorybook(config, this.#options)
            // Set an environment variable so it can be used in the onComplete hook
            process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER = tempDir
            // Add the storybook URL to the environment variables
            process.env.VISUAL_STORYBOOK_URL = storybookUrl

            // Check the capabilities
            // Multiremote capabilities are not supported
            if (typeof capabilities === 'object' && !Array.isArray(capabilities)) {
                throw new SevereServiceError('\n\nRunning Storybook in combination with Multiremote is not supported.\nRemove your `capabilities` property from your config or assign an empty array to it like `capabilities: [],`.\n\n')
            }

            // Clear the capabilities
            capabilities.length = 0
            log.info('Clearing the current capabilities.')

            // Get compare options from config
            const compareOptions: CheckElementMethodOptions = {
                blockOutSideBar: this.#options.blockOutSideBar,
                blockOutStatusBar: this.#options.blockOutStatusBar,
                blockOutToolBar: this.#options.blockOutToolBar,
                ignoreAlpha: this.#options.ignoreAlpha,
                ignoreAntialiasing: this.#options.ignoreAntialiasing,
                ignoreColors: this.#options.ignoreColors,
                ignoreLess: this.#options.ignoreLess,
                ignoreNothing: this.#options.ignoreNothing,
                rawMisMatchPercentage: this.#options.rawMisMatchPercentage,
                returnAllCompareData: this.#options.returnAllCompareData,
                saveAboveTolerance: this.#options.saveAboveTolerance,
                scaleImagesToSameSize: this.#options.scaleImagesToSameSize,
            }

            // Determine some run options
            // --version
            const versionOption = this.#options?.storybook?.version
            const versionArgv = getArgvValue('--version', value => Math.floor(parseFloat(value)))
            const version = versionOption ?? versionArgv ?? 7
            // --numShards
            const maxInstances = config?.maxInstances ?? 1
            const numShardsOption = this.#options?.storybook?.numShards
            const numShardsArgv = getArgvValue('--numShards', value => parseInt(value, 10))
            const numShards =  Math.min(numShardsOption || numShardsArgv || NUM_SHARDS, maxInstances)
            // --clip
            const clipOption = this.#options?.storybook?.clip
            const clipArgv = getArgvValue('--clip', value => value !== 'false')
            const clip = clipOption ?? clipArgv ?? true
            // --clipSelector
            const clipSelectorOption = this.#options?.storybook?.clipSelector
            const clipSelectorArgv = getArgvValue('--clipSelector', value => value)
            // V6 has '#root' as the root element, V7 has '#storybook-root'
            const clipSelector = (clipSelectorOption ?? clipSelectorArgv) ?? (version === 6 ? V6_CLIP_SELECTOR : CLIP_SELECTOR)
            // Add the clip selector to the environment variables
            process.env.VISUAL_STORYBOOK_CLIP_SELECTOR = clipSelector
            // --skipStories
            const skipStoriesOption = this.#options?.storybook?.skipStories
            const skipStoriesArgv = getArgvValue('--skipStories', value => value)
            const skipStories = skipStoriesOption ?? skipStoriesArgv ?? []
            const parsedSkipStories = parseSkipStories(skipStories)
            // --additionalSearchParams
            const additionalSearchParamsOption = this.#options?.storybook?.additionalSearchParams
            const additionalSearchParamsArgv = getArgvValue('--additionalSearchParams', value => new URLSearchParams(value))
            const additionalSearchParams = additionalSearchParamsOption ?? additionalSearchParamsArgv ?? new URLSearchParams()

            // Create the test files
            createTestFiles({
                additionalSearchParams,
                clip,
                clipSelector,
                compareOptions,
                directoryPath: tempDir,
                folders: this.folders,
                framework,
                numShards,
                skipStories: parsedSkipStories,
                storiesJson,
                storybookUrl,
            })

            // Create the capabilities
            createStorybookCapabilities(capabilities as WebdriverIO.Capabilities[])
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
            delete process.env.VISUAL_STORYBOOK_URL
            delete process.env.VISUAL_STORYBOOK_CLIP_SELECTOR
        }

        if (this.#options.createJsonReportFiles){
            new generateVisualReport(
                { directoryPath: this.folders.actualFolder }
            ).generate()
        }
    }
}
