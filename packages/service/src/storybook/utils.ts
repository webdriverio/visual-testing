import type { Logger } from '@wdio/logger'
import type { Capabilities, Options } from '@wdio/types'
import fetch from 'node-fetch'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { ClassOptions } from 'webdriver-image-comparison'
import type {
    CategoryComponent,
    CreateItContent,
    CreateTestContent,
    CreateTestFileOptions,
    IndexRes,
    ScanStorybookReturnData,
    Stories,
    StoriesRes,
    StorybookData,
} from './Types.js'

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
        await $('${clipSelector}').waitForDisplayed();
        await waitForAllImagesLoaded();
        ${clip
        ? `await expect($('${clipSelector}')).toMatchElementSnapshot('${id}-element', ${JSON.stringify(methodOptions)})`
        : `await expect(browser).toMatchScreenSnapshot('${id}', ${JSON.stringify(methodOptions)})`}
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
export function createTestContent(
    { clip, clipSelector, folders, framework, skipStories, stories, storybookUrl }: CreateTestContent,
    // For testing purposes only
    itFunc = itFunction
): string {
    const itFunctionOptions = { clip, clipSelector, folders, framework, skipStories, storybookUrl }

    return stories.reduce((acc, storyData) => acc + itFunc({ ...itFunctionOptions, storyData }), '')
}

const waitForAllImagesLoaded = `
async function waitForAllImagesLoaded() {
    await browser.executeAsync(async (done) => {
        const timeout = 11000; // 11 seconds
        let timedOut = false;

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                timedOut = true;
                reject('Timeout: Not all images loaded within 11 seconds');
            }, timeout);
        });

        const isImageLoaded = (img) => img.complete && img.naturalWidth > 0;

        // Check for <img> elements
        const imgElements = Array.from(document.querySelectorAll('img'));
        const imgPromises = imgElements.map(img => isImageLoaded(img) ? Promise.resolve() : new Promise(resolve => {
            img.onload = () => !timedOut && resolve();
            img.onerror = () => !timedOut && resolve();
        }));

        // Check for CSS background images
        const allElements = Array.from(document.querySelectorAll('*'));
        const bgImagePromises = allElements.map(el => {
            const bgImage = window.getComputedStyle(el).backgroundImage;
            if (bgImage && bgImage !== 'none' && bgImage.startsWith('url')) {
                const imageUrl = bgImage.slice(5, -2); // Extract URL from the 'url("")'
                const image = new Image();
                image.src = imageUrl;
                return isImageLoaded(image) ? Promise.resolve() : new Promise(resolve => {
                    image.onload = () => !timedOut && resolve();
                    image.onerror = () => !timedOut && resolve();
                });
            }
            return Promise.resolve();
        });

        try {
            await Promise.race([Promise.all([...imgPromises, ...bgImagePromises]), timeoutPromise]);
            done();
        } catch (error) {
            done(error);
        }
    });
}
`

/**
 * Create the file data
 */
export function createFileData(describeTitle: string, testContent: string): string {
    return `
describe(\`${describeTitle}\`, () => {
    ${testContent}
});
${waitForAllImagesLoaded}
`
}

/**
 * Create the test files
 */
export function createTestFiles(
    { clip, clipSelector, directoryPath, folders, framework, log, numShards, skipStories, storiesJson, storybookUrl }: CreateTestFileOptions,
    // For testing purposes only
    createTestCont = createTestContent,
    createFileD = createFileData,
    writeTestF = writeTestFile
) {
    const storiesArray = Object.values(storiesJson)
        // By default only keep the stories, not the docs
        .filter((storyData: StorybookData) => storyData?.type === 'story' || !storyData.parameters?.docsOnly)
    const fileNamePrefix = 'visual-storybook'
    const createTestContentData = { clip, clipSelector, folders, framework, skipStories, stories: storiesArray, storybookUrl }

    if (numShards === 1) {
        const testContent = createTestCont(createTestContentData)
        const fileData = createFileD('All stories', testContent)
        writeTestF(directoryPath, `${fileNamePrefix}-1-1`, log, fileData)
    } else {
        const totalStories = storiesArray.length
        const storiesPerShard = Math.ceil(totalStories / numShards)

        for (let shard = 0; shard < numShards; shard++) {
            const startIndex = shard * storiesPerShard
            const endIndex = Math.min(startIndex + storiesPerShard, totalStories)
            const shardStories = storiesArray.slice(startIndex, endIndex)
            const testContent = createTestCont({ ...createTestContentData, stories: shardStories })
            const fileId = `${fileNamePrefix}-${shard + 1}-${numShards}`
            const describeTitle = `Shard ${shard + 1} of ${numShards}`
            const fileData = createFileD(describeTitle, testContent)

            writeTestF(directoryPath, fileId, log, fileData)
        }
    }
}

/**
 * Create the storybook capabilities based on the specified browsers
 */
export function createStorybookCapabilities(capabilities: Capabilities.RemoteCapabilities, log: Logger) {
    const isHeadless = getArgvValue('--headless', value => value !== 'false') ?? true
    const browsers = getArgvValue('--browsers', (value: string) => value.split(',')) ?? ['chrome']

    if (Array.isArray(capabilities)) {
        const chromeCapability: WebdriverIO.Capabilities = {
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
        const firefoxCapability: WebdriverIO.Capabilities = {
            browserName: 'firefox',
            'moz:firefoxOptions': {
                args: [...(isHeadless ? ['-headless'] : []),]
            },
            'wdio-ics:options': {
                logName: 'local-firefox',
            },
        }
        const safariCapability: WebdriverIO.Capabilities = {
            browserName: 'safari',
            'wdio-ics:options': {
                logName: 'local-safari',
            },
        }
        const edgeCapability: WebdriverIO.Capabilities = {
            browserName: 'MicrosoftEdge',
            'ms:edgeOptions': {
                args: [...(isHeadless ? ['--headless'] : [])]
            },
            'wdio-ics:options': {
                logName: 'local-edge',
            },
        }
        interface CapabilityMap {
            chrome: typeof chromeCapability;
            firefox: typeof firefoxCapability;
            safari: typeof safariCapability;
            edge: typeof edgeCapability;
        }
        const capabilityMap: CapabilityMap = {
            chrome: chromeCapability,
            firefox: firefoxCapability,
            safari: safariCapability,
            edge: edgeCapability,
        }
        const newCapabilities = browsers
            .filter((browser:string): browser is keyof CapabilityMap => browser in capabilityMap)
            .map((browser:string) => capabilityMap[browser as keyof CapabilityMap])
        capabilities.length = 0
        // Add the new capability to the capabilities array
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
    options: ClassOptions,
    // For testing purposes only
    getArgvVal = getArgvValue,
    checkStorybookIsRun = checkStorybookIsRunning,
    sanitizeURLFunc = sanitizeURL,
    getStoriesJsonFunc = getStoriesJson,
): Promise<ScanStorybookReturnData> {
    // Prepare storybook scanning
    const cliUrl = getArgvVal('--url', value => value)
    const rawStorybookUrl = cliUrl ?? process.env.STORYBOOK_URL ?? options?.storybook?.url ?? 'http://127.0.0.1:6006'
    await checkStorybookIsRun(rawStorybookUrl)
    const storybookUrl = sanitizeURLFunc(rawStorybookUrl)

    // Create a temporary folder for test files and add that to the specs
    const tempDir = resolve(tmpdir(), `wdio-storybook-tests-${Date.now()}`)
    mkdirSync(tempDir)
    log.info(`Using temporary folder for storybook specs: ${tempDir}`)
    config.specs = [join(tempDir, '*.js')]

    // Get the stories
    const storiesJson = await getStoriesJsonFunc(storybookUrl)

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
