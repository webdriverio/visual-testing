import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { $, browser } from '@wdio/globals'
import logger from '@wdio/logger'
import type { Options } from '@wdio/types'
import type { ClassOptions } from '@wdio/image-comparison-core'

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
    EmulatedDeviceType,
    CapabilityMap,
    WaitForStorybookComponentToBeLoaded,
} from './Types.js'
import { deviceDescriptors } from './deviceDescriptors.js'

const log = logger('@wdio/visual-service:storybook-utils')

/**
 * Check if we run for Storybook
 */
export function isStorybookMode(): boolean {
    return process.argv.includes('--storybook')
}

/**
 * Check if the framework is cucumber
 */
export function isCucumberFramework(framework: Required<Options.Testrunner>['framework']): boolean {
    return framework.toLowerCase() === 'cucumber'
}

/**
 * Check if the framework is Jasmine
 */
export function isJasmineFramework(framework: Required<Options.Testrunner>['framework']): boolean {
    return framework.toLowerCase() === 'jasmine'
}

/**
 * Check if the framework is Mocha
 */
export function isMochaFramework(framework: Required<Options.Testrunner>['framework']): boolean {
    return framework.toLowerCase() === 'mocha'
}

/**
 * Check if there is an instance of Storybook running
 */
export async function checkStorybookIsRunning(url: string) {
    try {
        const res = await fetch(url, { method: 'GET', headers: {} })
        if (res.status !== 200) {
            throw new Error(`Unexpected status: ${res.status}`)
        }
    } catch (_e) {
        log.error(`It seems that the Storybook instance is not running at: ${url}. Are you sure it's running?`)
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
                try {
                    const data = await response.json() as StoriesRes | IndexRes
                    return (data as StoriesRes).stories || (data as IndexRes).entries
                } catch (_ign) {
                    // Ignore the json parse error
                }
            }
        }
    } catch (_ign) {
        // Ignore the error
    }

    throw new Error(`Failed to fetch index data from the project. Ensure URLs are available with valid data: ${storiesJsonUrl}, ${indexJsonUrl}.`)
}

/**
 * Get arg value from the process.argv
 */
export function getArgvValue<ParseFuncReturnType>(
    argName: string,
    parseFunc: (value: string) => ParseFuncReturnType
)  {
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
 * Get the story baseline path for the given category and component
 */
const getStoriesBaselinePathFn = ((
    category: CategoryComponent['category'],
    component: CategoryComponent['component']
) => `./${category}/${component}/`)

/**
 * Creates a it function for the test file
 * @TODO: improve this
 */
export function itFunction({ additionalSearchParams, clip, clipSelector, compareOptions, folders, framework, skipStories, storyData, storybookUrl, getStoriesBaselinePath = getStoriesBaselinePathFn  }: CreateItContent) {
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
    const storiesBaselinePath = getStoriesBaselinePath(category, component)
    const checkMethodOptions = {
        ...compareOptions,
        actualFolder: join(folders.actualFolder, storiesBaselinePath),
        baselineFolder: join(folders.baselineFolder, storiesBaselinePath),
        diffFolder: join(folders.diffFolder, storiesBaselinePath),
    }

    const it = `
    ${itText}(\`should take a${screenshotType} screenshot of ${id}\`, async () => {
        await browser.waitForStorybookComponentToBeLoaded({
            clipSelector: '${clipSelector}',
            id: '${id}',
            storybookUrl: '${storybookUrl}',
            additionalSearchParams: new URLSearchParams('${additionalSearchParams.toString()}'),
        });
        ${clip
        ? `await expect($('${clipSelector}')).toMatchElementSnapshot('${id}-element', ${JSON.stringify(checkMethodOptions)})`
        : `await expect(browser).toMatchScreenSnapshot('${id}', ${JSON.stringify(checkMethodOptions)})`}
    });
    `
    return it
}

/**
 * Write the test file
 */
export function writeTestFile(directoryPath: string, fileID: string, testContent: string) {
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
    { additionalSearchParams, clip, clipSelector, compareOptions, folders, framework, getStoriesBaselinePath, skipStories, stories, storybookUrl }: CreateTestContent,
    // For testing purposes only
    itFunc = itFunction
): string {
    const itFunctionOptions = { additionalSearchParams, clip, clipSelector, compareOptions, folders, framework, getStoriesBaselinePath, skipStories, storybookUrl }

    return stories.reduce((acc, storyData) => acc + itFunc({ ...itFunctionOptions, storyData }), '')
}

/**
 * The custom command
 */
export async function waitForStorybookComponentToBeLoaded(
    options: WaitForStorybookComponentToBeLoaded,
    // For testing purposes only
    isStorybookModeFunc = isStorybookMode
) {
    const isStorybook = isStorybookModeFunc()
    if (isStorybook) {
        const {
            additionalSearchParams,
            clipSelector = process.env.VISUAL_STORYBOOK_CLIP_SELECTOR,
            id,
            url = process.env.VISUAL_STORYBOOK_URL,
            timeout = 11000,
        } = options
        const baseUrl = new URL('iframe.html', url)
        const searchParams = new URLSearchParams({ id })
        if (additionalSearchParams) {
            for (const [key, value] of additionalSearchParams) {
                searchParams.append(key, value)
            }
        }
        baseUrl.search = searchParams.toString()
        await browser.url(baseUrl.toString())
        await $(clipSelector as string).waitForDisplayed()
        await browser.executeAsync(async (timeout, done) => {
            let timedOut = false

            const timeoutPromise = new Promise((_resolve, reject) => {
                setTimeout(() => {
                    timedOut = true
                    reject('Timeout: Not all images loaded within 11 seconds')
                }, timeout)
            })

            const isImageLoaded = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0

            // Check for <img> elements
            const imgElements = Array.from(document.querySelectorAll('img'))
            const imgPromises = imgElements.map(img => isImageLoaded(img) ? Promise.resolve() : new Promise<void>(resolve => {
                img.onload = () => { if (!timedOut) { resolve() } }
                img.onerror = () => { if (!timedOut) { resolve() } }
            }))

            // Check for CSS background images
            const allElements = Array.from(document.querySelectorAll('*'))
            const bgImagePromises = allElements.map(el => {
                const bgImage = window.getComputedStyle(el).backgroundImage
                if (bgImage && bgImage !== 'none' && bgImage.startsWith('url')) {
                    const imageUrl = bgImage.slice(5, -2) // Extract URL from the 'url("")'
                    const image = new Image()
                    image.src = imageUrl
                    return isImageLoaded(image) ? Promise.resolve() : new Promise<void>(resolve => {
                        image.onload = () => { if (!timedOut) { resolve() } }
                        image.onerror = () => { if (!timedOut) { resolve() } }
                    })
                }
                return Promise.resolve()
            })

            try {
                await Promise.race([Promise.all([...imgPromises, ...bgImagePromises]), timeoutPromise])
                done()
            } catch (error) {
                done(error)
            }
        }, timeout)
    } else {
        throw new Error('The method `waitForStorybookComponentToBeLoaded` can only be used in Storybook mode.')
    }
}

/**
 * Create the file data
 */
export function createFileData(describeTitle: string, testContent: string): string {
    return `
describe(\`${describeTitle}\`, () => {
    ${testContent}
});
`
}

/**
 * Filter the stories, by default only keep the stories, not the docs
 */
function filterStories(storiesJson: Stories): StorybookData[] {
    return Object.values(storiesJson)
        // storyData?.type === 'story' is V7+, storyData.parameters?.docsOnly is V6
        .filter((storyData: StorybookData) => storyData.type === 'story' || (storyData.parameters && !storyData.parameters.docsOnly))
}

/**
 * Create the test files
 */
export function createTestFiles(
    { additionalSearchParams, clip, clipSelector, compareOptions, directoryPath, folders, framework, getStoriesBaselinePath, numShards, skipStories, storiesJson, storybookUrl }: CreateTestFileOptions,
    // For testing purposes only
    createTestCont = createTestContent,
    createFileD = createFileData,
    writeTestF = writeTestFile
) {
    const fileNamePrefix = 'visual-storybook'
    const createTestContentData = { additionalSearchParams, clip, clipSelector, compareOptions, folders, framework, getStoriesBaselinePath, skipStories, stories: storiesJson, storybookUrl }

    if (numShards === 1) {
        const testContent = createTestCont(createTestContentData)
        const fileData = createFileD('All stories', testContent)
        writeTestF(directoryPath, `${fileNamePrefix}-1-1`, fileData)
    } else {
        const totalStories = storiesJson.length
        const storiesPerShard = Math.ceil(totalStories / numShards)

        for (let shard = 0; shard < numShards; shard++) {
            const startIndex = shard * storiesPerShard
            const endIndex = Math.min(startIndex + storiesPerShard, totalStories)
            const shardStories = storiesJson.slice(startIndex, endIndex)
            const testContent = createTestCont({ ...createTestContentData, stories: shardStories })
            const fileId = `${fileNamePrefix}-${shard + 1}-${numShards}`
            const describeTitle = `Shard ${shard + 1} of ${numShards}`
            const fileData = createFileD(describeTitle, testContent)

            writeTestF(directoryPath, fileId, fileData)
        }
    }
}

export function createChromeCapabilityWithEmulation(
    { screen:{ width, height, dpr }, name, userAgent }: EmulatedDeviceType,
    isHeadless: boolean,
): WebdriverIO.Capabilities {
    return {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                'disable-infobars',
                ...(isHeadless ? ['--headless'] : []),
            ],
            mobileEmulation: {
                deviceMetrics: {
                    width,
                    height,
                    pixelRatio: dpr,
                },
                userAgent,
            },
        },
        'wdio-ics:options': {
            logName: `local-chrome-${name.replace(/\s+/g, '-')}`,
        },
    }
}

/**
 * Throw an error message if the capabilities are not set up correctly
 */
export function capabilitiesErrorMessage(
    browsers: string[],
    capabilityMap: CapabilityMap,
    devices: string[],
    deviceDescriptors: EmulatedDeviceType[],
    isMobileEmulation: boolean,
) {
    let errorMessage = 'No capabilities were added. Please ensure that '
    const browserIssues = browsers.some((browser:string) => !(browser in capabilityMap))
    const deviceIssues = isMobileEmulation && devices.some((deviceName:string) => !deviceDescriptors.some(device => device.name === deviceName))

    if (browserIssues && deviceIssues) {
        errorMessage += `the browsers '${browsers.join(',')}' and devices '${devices.join(',')}' are supported.`
    } else if (browserIssues) {
        errorMessage += `the browsers '${browsers.join(',')}' are supported.`
    } else if (deviceIssues) {
        errorMessage += `the devices '${devices.join(',')}' are supported.`
    } else {
        errorMessage += 'the specified configuration is correct.'
    }

    throw new Error(errorMessage)
}

/**
 * Create the storybook capabilities based on the specified browsers
 */
export function createStorybookCapabilities(
    capabilities: WebdriverIO.Capabilities[],
    // For testing purposes only
    createChromeCapabilityWithEmulationFunc = createChromeCapabilityWithEmulation,
    capabilitiesErrorMessageFunc = capabilitiesErrorMessage,
) {
    if (!Array.isArray(capabilities)) {
        log.error('The capabilities are not an array')
        return
    }

    const isHeadless = getArgvValue('--headless', value => value !== 'false') ?? true
    const browsers = getArgvValue('--browsers', (value: string) => value.split(',')) ?? ['chrome']
    const devices = getArgvValue('--devices', (value: string) => value.split(',')) ?? []
    const isMobileEmulation = devices.length > 0

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
    const edgeCapability: WebdriverIO.Capabilities = {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
            args: [...(isHeadless ? ['--headless'] : [])],
        },
        'wdio-ics:options': {
            logName: 'local-edge',
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
    interface CapabilityMap {
            chrome: typeof chromeCapability;
            edge: typeof edgeCapability;
            firefox: typeof firefoxCapability;
            safari: typeof safariCapability;
        }
    const capabilityMap: CapabilityMap = {
        chrome: chromeCapability,
        edge: edgeCapability,
        firefox: firefoxCapability,
        safari: safariCapability,
    }
    const standardCapabilities = browsers
        .filter((browser: string): browser is keyof CapabilityMap => browser in capabilityMap && browser.toLowerCase() !== 'chrome')
        .map((browser: string) => capabilityMap[browser as keyof CapabilityMap])

    capabilities.push(...standardCapabilities)

    if (isMobileEmulation) {
        devices.forEach((deviceName: string) => {
            const foundDevice = deviceDescriptors.find((device: EmulatedDeviceType) => device.name === deviceName)
            if (foundDevice) {
                const chromeMobileCapability = createChromeCapabilityWithEmulationFunc(foundDevice, isHeadless)
                capabilities.push(chromeMobileCapability)
            } else {
                log.error(`The device ${deviceName} is not supported. Please choose from the following devices: ${deviceDescriptors.map(device => device.name).join(', ')}`)
            }
        })
    } else if (browsers.includes('chrome')) {
        capabilities.push(chromeCapability)
    }

    if (capabilities.length === 0) {
        capabilitiesErrorMessageFunc(browsers, capabilityMap, devices, deviceDescriptors, isMobileEmulation)
    }

    log.info('Added new storybook capabilities:', JSON.stringify(capabilities, null, 2))
}

/**
 * Scan the storybook instance
 */
export async function scanStorybook(
    config: WebdriverIO.Config,
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

    // Get the stories
    const storiesJson = await getStoriesJsonFunc(storybookUrl)
    const filteredStories = filterStories(storiesJson)

    // Check if the specs are provided via the CLI so they can be added to the specs
    // when users provide stories with interactive components
    const isCliSpecs = getArgvVal('--spec', value => value)
    const cliSpecs: string[] = []
    if (isCliSpecs) {
        cliSpecs.push( ...(config.specs as string[]))
    }
    config.specs = [join(tempDir, '*.{js,mjs,ts}'), ...cliSpecs]

    return {
        storiesJson: filteredStories,
        storybookUrl,
        tempDir,
    }
}

/**
 * Parse the stories to skip
 */
export function parseSkipStories(skipStories: string | string[]): RegExp | string[] {
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
