import type { Logger } from '@wdio/logger'
import type { Capabilities, Options } from '@wdio/types'
import fetch from 'node-fetch'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { ClassOptions } from 'webdriver-image-comparison'
import type {
    CapabilityMap,
    CategoryComponent,
    CreateItContent,
    CreateTestContent,
    CreateTestFileOptions,
    IndexRes,
    Stories,
    StoriesRes,
    StorybookData,
} from './storybookTypes.js'

/**
 * Check if we run for Storybook
 */
export function isStorybookMode(): boolean {
    return process.argv.includes('--storybook')
}

/**
 * Check if the framework is cucumber
 */
export function isCucumberFramework(framework: string): boolean {
    return framework.toLowerCase() === 'cucumber'
}

/**
 * Check if the framework is Jasmine
 */
export function isJasmineFramework(framework: string): boolean {
    return framework.toLowerCase() === 'jasmine'
}

/**
 * Check if the framework is Mocha
 */
export function isMochaFramework(framework: string): boolean {
    return framework.toLowerCase() === 'mocha'
}

/**
 * Check if there is an instance of Storybook running
 */
export async function checkStorybookIsRunning(url: string) {
    try {
        const res = await fetch(url, { method: 'GET', headers: {} })
        if (res.status !== 200) {
            throw new Error(`Unxpected status: ${res.status}`)
        }
    } catch (e) {
        console.error(`It seems that the Storybook instance is not running at: ${url}. Are you sure it's running?`)
        process.exit(1)
    }
}

/**
 * Sanitize the URL to ensure it's in a proper format
 */
export function sanitizeURL(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url
    }

    url = url.replace(/(iframe\.html|index\.html)\s*$/, '')

    if (!url.endsWith('/')) {
        url += '/'
    }

    return url
}

/**
 * Extract the category and component from the story ID
 */
export function extractCategoryAndComponent(id: string): CategoryComponent {
    // The ID is in the format of `category-component--storyName`
    const [categoryComponent] = id.split('--')
    const [category, component] = categoryComponent.split('-')

    return { category, component }
}

/**
 * Get the stories JSON from the Storybook instance
 */
export async function getStoriesJson(url: string): Promise<Stories> {
    const indexJsonUrl = new URL('index.json', url).toString()
    const storiesJsonUrl = new URL('stories.json', url).toString()
    const fetchOptions = { headers: {} }

    try {
        const [indexRes, storiesRes] = await Promise.all([
            fetch(indexJsonUrl, fetchOptions),
            fetch(storiesJsonUrl, fetchOptions),
        ])

        for (const response of [storiesRes, indexRes]) {
            if (response.ok) {
                const data = await response.json() as StoriesRes | IndexRes
                return (data as StoriesRes).stories || (data as IndexRes).entries
            }
        }
    } catch (err) {
        console.error(err)
    }

    throw new Error(`Failed to fetch index data from the project. Ensure URLs are available with valid data: ${storiesJsonUrl}, ${indexJsonUrl}.`)
}

/**
 * Get arg value from the process.argv
 */
export function getArgvValue(argName: string, parseFunc: (value: string) => any): any {
    const argWithEqual = argName + '='
    const argv = process.argv

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === argName && i + 1 < argv.length) {
            return parseFunc(argv[i + 1])
        } else if (argv[i].startsWith(argWithEqual)) {
            const value = argv[i].slice(argWithEqual.length)
            return parseFunc(value)
        }
    }

    return undefined
}

/**
 * Creates a it function for the test file
 * @TODO: improve this
 */
export function itFunction({ clip, clipSelector, folders: { baselineFolder }, framework, skipStories, storyData, storybookUrl }: CreateItContent) {
    const { id } = storyData
    const screenshotType = clip ? 'n element' : ' viewport'
    const DEFAULT_IT_TEXT = 'it'
    let itText = DEFAULT_IT_TEXT

    if (isJasmineFramework(framework)) {
        itText = 'xit'
    } else if (isMochaFramework(framework)) {
        itText = 'it.skip'
    }

    if (Array.isArray(skipStories)) {
        itText = skipStories.includes(id) ? itText : DEFAULT_IT_TEXT
    } else if (skipStories instanceof RegExp) {
        itText = skipStories.test(id) ? itText : DEFAULT_IT_TEXT
    }

    // Setup the folder structure
    const { category, component } = extractCategoryAndComponent(id)
    const methodOptions = {
        baselineFolder: join(baselineFolder, `./${category}/${component}/`),
    }

    const it = `
    ${itText}(\`should take a${screenshotType} screenshot of ${id}\`, async () => {
        await browser.url(\`${storybookUrl}iframe.html?id=${id}\`);
        await $('#storybook-root').waitForDisplayed();

        const startTime = performance.now();
        ${clip
        ? `await expect($('${clipSelector}')).toMatchElementSnapshot('${id}-element', ${JSON.stringify(methodOptions)})`
        : `await expect(browser).toMatchScreenSnapshot('${id}', ${JSON.stringify(methodOptions)})`}
        // await $('${clipSelector}').saveScreenshot('${id}.png');
        const endTime = performance.now();
        const timeTaken = endTime - startTime;
        console.log('Visual snapshot of \`${id}\` took: ', Math.round(timeTaken), ' ms')
    });
    `
    return it
}

/**
 * Write the test file
 */
export function writeTestFile(directoryPath: string, fileID: string, log: Logger, testContent: string) {
    const filePath = join(directoryPath, `${fileID}.test.js`)
    try {
        writeFileSync(filePath, testContent)
        log.info(`Test file created at: ${filePath}`)
    } catch (err) {
        log.error(`It seems that the writing the file to '${filePath}' didn't succeed due to the following error: ${err}`)
        process.exit(1)
    }
}

/**
 * Create the test content
 */
export function createTestContent({ clip, clipSelector, folders, framework, skipStories, stories, storybookUrl }: CreateTestContent): string {
    const itFunctionOptions = { clip, clipSelector, folders, framework, skipStories, storybookUrl }

    return stories.reduce((acc, storyData) => acc + itFunction({ ...itFunctionOptions, storyData }), '')
}

/**
 * Create the file data
 */
export function createFileData(describeTitle: string, testContent: string): string {
    return `\ndescribe(\`${describeTitle}\`, () => {\n    ${testContent}\n});\n`
}

/**
 * Create the test files
 */
export function createTestFiles({
    clip, clipSelector, directoryPath, folders, framework, log, numShards, skipStories, storiesJson, storybookUrl,
}: CreateTestFileOptions) {
    const storiesArray = Object.values(storiesJson)
        // By default only keep the stories, not the docs
        .filter((storyData: StorybookData) => storyData?.type === 'story' || !storyData.parameters?.docsOnly)
    const fileNamePrefix = 'visual-storybook'
    const createTestContentData = { clip, clipSelector, folders, framework, skipStories, stories: storiesArray, storybookUrl }

    if (numShards === 1) {
        const testContent = createTestContent(createTestContentData)
        const fileData = createFileData('All stories', testContent)
        writeTestFile(directoryPath, `${fileNamePrefix}-1-1`, log, fileData)
    } else {
        const totalStories = storiesArray.length
        const storiesPerShard = Math.ceil(totalStories / numShards)

        for (let shard = 0; shard < numShards; shard++) {
            const startIndex = shard * storiesPerShard
            const endIndex = Math.min(startIndex + storiesPerShard, totalStories)
            const shardStories = storiesArray.slice(startIndex, endIndex)
            const testContent = createTestContent({ ...createTestContentData, stories: shardStories })
            const fileId = `${fileNamePrefix}-${shard + 1}-${numShards}`
            const describeTitle = `Shard ${shard + 1} of ${numShards}`
            const fileData = createFileData(describeTitle, testContent)

            writeTestFile(directoryPath, fileId, log, fileData)
        }
    }
}

/**
 * Create the storybook capabilities based on the specified browsers
 */
export function createStorybookCapabilities(capabilities: Capabilities.RemoteCapabilities, log: Logger) {
    const isHeadless = process.argv.includes('--headless')
    const browsers = process.argv.includes('--browsers') ? process.argv[process.argv.indexOf('--browsers') + 1].split(',') : ['chrome']

    if (Array.isArray(capabilities)) {
        const chromeCapability = {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    'disable-infobars',
                    ...(isHeadless ? ['--headless'] : []),
                ],
            },
            'wdio-ics:options': {
                logName: 'local-chrome',
            },
        }
        const firefoxCapability = {
            browserName: 'firefox',
            'moz:firefoxOptions': {
                args: [...(isHeadless ? ['-headless'] : []),]
            },
            'wdio-ics:options': {
                logName: 'local-firefox',
            },
        }
        const safariCapability = {
            browserName: 'safari',
            'wdio-ics:options': {
                logName: 'local-safari',
            },
        }
        const edgeCapability = {
            browserName: 'MicrosoftEdge',
            'ms:edgeOptions': {
                args: [...(isHeadless ? ['--headless'] : [])]
            },
            'wdio-ics:options': {
                logName: 'local-edge',
            },
        }

        // Create a map for easy lookup
        const capabilityMap: CapabilityMap = {
            chrome: chromeCapability,
            firefox: firefoxCapability,
            safari: safariCapability,
            edge: edgeCapability,
        }

        // Create new capabilities based on the specified browsers
        const newCapabilities = browsers
            .filter((browser): browser is keyof CapabilityMap => browser in capabilityMap)
            .map(browser => capabilityMap[browser])

        capabilities.length = 0
        // Add the new capability to the capabilities array
        // @ts-ignore
        capabilities.push(...newCapabilities)
    } else {
        log.error('The capabilities are not an array')
    }
}

/**
 * Scan the storybook instance
 */
export async function scanStorybook(
    config: Options.Testrunner,
    log: Logger,
    options: ClassOptions
): Promise<{ storiesJson: Stories; storybookUrl: string; tempDir: string} > {
    // Prepare storybook scanning
    const cliUrl = getArgvValue('--url', value => value)
    const rawStorybookUrl = cliUrl ?? process.env.STORYBOOK_URL ?? options?.storybook?.url ?? 'http://127.0.0.1:6006'
    await checkStorybookIsRunning(rawStorybookUrl)
    const storybookUrl = sanitizeURL(rawStorybookUrl)

    // Create a temporary folder for test files and add that to the specs
    const tempDir = resolve(tmpdir(), `wdio-storybook-tests-${Date.now()}`)
    mkdirSync(tempDir)
    log.info(`Using temporary folder for storybook specs: ${tempDir}`)
    config.specs = [join(tempDir, '*.js')]

    // Get the stories
    const storiesJson = await getStoriesJson(storybookUrl)

    return {
        storiesJson,
        storybookUrl,
        tempDir,
    }
}

/**
 * Parse the stories to skip
 */
export function parseSkipStories(skipStories: string | string[], log: Logger): RegExp | string[] {
    if (Array.isArray(skipStories)) {
        return skipStories
    }

    const regexPattern = /^\/.*\/[gimyus]*$/
    if (regexPattern.test(skipStories)) {
        try {
            const match = skipStories.match(/^\/(.+)\/([gimyus]*)$/)
            if (match) {
                const [, pattern, flags] = match
                return new RegExp(pattern, flags)
            }
        } catch (error) {
            log.error('Invalid regular expression:', error, '. Not using a regular expression to skip stories.')
        }
    }

    return skipStories.split(',').map(skipped => skipped.trim())
}
