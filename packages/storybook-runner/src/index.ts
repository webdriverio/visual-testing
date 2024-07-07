import { rmdirSync } from 'node:fs'
import logger from '@wdio/logger'
import LocalRunner from '@wdio/local-runner'
import type { Options } from '@wdio/types'
import type { StorybookRunnerOptions as StorybookRunnerOptionsImport } from './types.js'
import { CLIP_SELECTOR, FRAMEWORK_SUPPORT_ERROR, MULTIREMOTE_CAPABILITIES_ERROR, NUM_SHARDS, V6_CLIP_SELECTOR } from './constants.js'
import { createStorybookCapabilities, createTestFiles, getArgvValue, parseSkipStories, scanStorybook } from './utils.js'

const log = logger('@wdio/storybook-runner')

export default class StorybookRunner extends LocalRunner {
    #options: StorybookRunnerOptionsImport
    #config: Options.Testrunner

    constructor(
        private options: StorybookRunnerOptionsImport,
        protected _config: Options.Testrunner
    ) {
        super(options as never, _config)

        if (_config.framework === 'cucumber') {
            throw new Error(FRAMEWORK_SUPPORT_ERROR)
        }

        if (typeof _config?.capabilities === 'object' && !Array.isArray(_config?.capabilities)) {
            throw new Error(MULTIREMOTE_CAPABILITIES_ERROR)
        }

        this.#options = options
        this.#config = _config
    }

    async initialize() {
        log.info('Adding the Visual Service')
        const { services } = this.#config
        console.log('this.#config:', this.#config)

        // if (services?.flat().includes('visual')) {
        //     log.info('Visual Service is already added')
        // } else {
        //     this.#config.services = [
        //         ...(services ?? []),
        //         [
        //             'visual',
        //             {

        //             }
        //         ],
        //     ]
        // }

        // log.info('Start running Storybook tests')

        // const { storiesJson, storybookUrl, tempDir } = await scanStorybook(this.#config, this.#options)
        // // Set an environment variable so it can be used in the onComplete hook
        // process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER = tempDir
        // // Add the storybook URL to the environment variables
        // process.env.VISUAL_STORYBOOK_URL = storybookUrl

        // // Clear the capabilities
        // this.#config.capabilities.length = 0
        // log.info('Clearing the current capabilities.')

        // // Determine some run options
        // // --version
        // const versionOption = this.#options?.version
        // const versionArgv = getArgvValue('--version', value => Math.floor(parseFloat(value)))
        // const version = versionOption ?? versionArgv ?? 7
        // // --numShards
        // const maxInstances = this.#config?.maxInstances ?? 1
        // const numShardsOption = this.#options?.numShards
        // const numShardsArgv = getArgvValue('--numShards', value => parseInt(value, 10))
        // const numShards =  Math.min(numShardsOption || numShardsArgv || NUM_SHARDS, maxInstances)
        // // --clip
        // const clipOption = this.#options?.clip
        // const clipArgv = getArgvValue('--clip', value => value !== 'false')
        // const clip = clipOption ?? clipArgv ?? true
        // // --clipSelector
        // const clipSelectorOption = this.#options?.clipSelector
        // const clipSelectorArgv = getArgvValue('--clipSelector', value => value)
        // // V6 has '#root' as the root element, V7 has '#storybook-root'
        // const clipSelector = (clipSelectorOption ?? clipSelectorArgv) ?? (version === 6 ? V6_CLIP_SELECTOR : CLIP_SELECTOR)
        // // Add the clip selector to the environment variables
        // process.env.VISUAL_STORYBOOK_CLIP_SELECTOR = clipSelector
        // // --skipStories
        // const skipStoriesOption = this.#options?.skipStories
        // const skipStoriesArgv = getArgvValue('--skipStories', value => value)
        // const skipStories = skipStoriesOption ?? skipStoriesArgv ?? []
        // const parsedSkipStories = parseSkipStories(skipStories)

        // // Create the test files
        // createTestFiles({
        //     clip,
        //     clipSelector,
        //     directoryPath: tempDir,
        //     folders: 'this.folders', // Need to get the logic from the Visual service to here
        //     framework: this.#config.framework as string,
        //     numShards,
        //     skipStories: parsedSkipStories,
        //     storiesJson,
        //     storybookUrl,
        // })

        // // Create the capabilities
        // createStorybookCapabilities(this.#config.capabilities as WebdriverIO.Capabilities[])

        // You end with this
        await super.initialize()
    }

    /**
     * Clean ups, like the `onComplete` hook in the wdio.conf.js
     */
    async shutdown() {
        log.info('Shutting down Storybook tests')
        await super.shutdown()

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

        return true
    }
}

declare global {
    namespace WebdriverIO {
        interface StorybookRunnerOptions extends StorybookRunnerOptionsImport {}
    }
}
