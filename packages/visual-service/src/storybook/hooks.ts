import { rmdirSync } from 'node:fs'
import logger from '@wdio/logger'
import { SevereServiceError } from 'webdriverio'
import type { Capabilities } from '@wdio/types'
import type { ClassOptions, CheckElementMethodOptions, Folders } from '@wdio/image-comparison-core'
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

const log = logger('@wdio/visual-service')

export async function prepareStorybook(
    config: WebdriverIO.Config,
    capabilities: Capabilities.TestrunnerCapabilities,
    options: ClassOptions,
    folders: Folders,
): Promise<void> {
    const isStorybook = isStorybookMode()
    const framework = config.framework as string
    const isCucumber = isCucumberFramework(framework)

    if (isCucumber && isStorybook) {
        throw new SevereServiceError('\n\nRunning Storybook in combination with the cucumber framework adapter is not supported.\nOnly Jasmine and Mocha are supported.\n\n')
    }

    if (!isStorybook) {
        return
    }

    log.info('Running `@wdio/visual-service` in Storybook mode.')

    const { storiesJson, storybookUrl, tempDir } = await scanStorybook(config, options)
    process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER = tempDir
    process.env.VISUAL_STORYBOOK_URL = storybookUrl

    if (typeof capabilities === 'object' && !Array.isArray(capabilities)) {
        throw new SevereServiceError('\n\nRunning Storybook in combination with Multiremote is not supported.\nRemove your `capabilities` property from your config or assign an empty array to it like `capabilities: [],`.\n\n')
    }

    capabilities.length = 0
    log.info('Clearing the current capabilities.')

    const compareOptions: CheckElementMethodOptions = {
        blockOutSideBar: options.blockOutSideBar,
        blockOutStatusBar: options.blockOutStatusBar,
        blockOutToolBar: options.blockOutToolBar,
        ignoreAlpha: options.ignoreAlpha,
        ignoreAntialiasing: options.ignoreAntialiasing,
        ignoreColors: options.ignoreColors,
        ignoreLess: options.ignoreLess,
        ignoreNothing: options.ignoreNothing,
        rawMisMatchPercentage: options.rawMisMatchPercentage,
        returnAllCompareData: options.returnAllCompareData,
        saveAboveTolerance: options.saveAboveTolerance,
        scaleImagesToSameSize: options.scaleImagesToSameSize,
    }

    // --version
    const versionOption = options?.storybook?.version
    const versionArgv = getArgvValue('--version', value => Math.floor(parseFloat(value)))
    const version = versionOption ?? versionArgv ?? 7
    // --numShards
    const maxInstances = config?.maxInstances ?? 1
    const numShardsOption = options?.storybook?.numShards
    const numShardsArgv = getArgvValue('--numShards', value => parseInt(value, 10))
    const numShards = Math.min(numShardsOption || numShardsArgv || NUM_SHARDS, maxInstances)
    // --clip
    const clipOption = options?.storybook?.clip
    const clipArgv = getArgvValue('--clip', value => value !== 'false')
    const clip = clipOption ?? clipArgv ?? true
    // --clipSelector
    const clipSelectorOption = options?.storybook?.clipSelector
    const clipSelectorArgv = getArgvValue('--clipSelector', value => value)
    const clipSelector = (clipSelectorOption ?? clipSelectorArgv) ?? (version === 6 ? V6_CLIP_SELECTOR : CLIP_SELECTOR)
    process.env.VISUAL_STORYBOOK_CLIP_SELECTOR = clipSelector
    // --skipStories
    const skipStoriesOption = options?.storybook?.skipStories
    const skipStoriesArgv = getArgvValue('--skipStories', value => value)
    const skipStories = skipStoriesOption ?? skipStoriesArgv ?? []
    const parsedSkipStories = parseSkipStories(skipStories)
    // --additionalSearchParams
    const additionalSearchParamsOption = options?.storybook?.additionalSearchParams
    const additionalSearchParamsArgv = getArgvValue('--additionalSearchParams', value => new URLSearchParams(value))
    const additionalSearchParams = additionalSearchParamsOption ?? additionalSearchParamsArgv ?? new URLSearchParams()
    const getStoriesBaselinePath = options?.storybook?.getStoriesBaselinePath

    createTestFiles({
        additionalSearchParams,
        clip,
        clipSelector,
        compareOptions,
        directoryPath: tempDir,
        folders,
        framework,
        getStoriesBaselinePath,
        numShards,
        skipStories: parsedSkipStories,
        storiesJson,
        storybookUrl,
    })

    createStorybookCapabilities(capabilities as WebdriverIO.Capabilities[])
}

export function cleanupStorybook(): void {
    const tempDir = process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER
    if (!tempDir) {
        return
    }

    log.info(`Cleaning up temporary folder for storybook specs: ${tempDir}`)
    try {
        rmdirSync(tempDir, { recursive: true })
        log.info(`Temporary folder for storybook specs has been removed: ${tempDir}`)
    } catch (err) {
        log.error(`Failed to remove temporary folder for storybook specs: ${tempDir} due to: ${(err as Error).message}`)
    }

    delete process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER
    delete process.env.VISUAL_STORYBOOK_URL
    delete process.env.VISUAL_STORYBOOK_CLIP_SELECTOR
}
