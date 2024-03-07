import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import type { Capabilities, Options } from '@wdio/types'
import fetch from 'node-fetch'
import { temporaryDirectory } from 'tempy'
import type { Logger } from '@wdio/logger'
import type { AppiumCapabilities } from 'node_modules/@wdio/types/build/Capabilities.js'
import { IOS_OFFSETS } from 'webdriver-image-comparison'
import type {
    Folders,
    InstanceData,
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
    CheckElementMethodOptions,
    SaveElementMethodOptions,
    ClassOptions,
} from 'webdriver-image-comparison'
import { NOT_KNOWN } from 'webdriver-image-comparison/dist/helpers/constants.js'
import type {
    CapabilityMap,
    CreateTestContent,
    CreateTestFileOptions,
    IndexRes,
    Stories,
    StoriesRes,
    StorybookData,
} from './storybookTypes.js'

interface WdioIcsOptions {
    logName?: string;
    name?: string;
}

/**
 * Get the folders data
 *
 * If folder options are passed in use those values
 * Otherwise, use the values set during instantiation
 */
type getFolderMethodOptions =
    | CheckElementMethodOptions
    | CheckFullPageMethodOptions
    | CheckScreenMethodOptions
    | SaveElementMethodOptions
    | SaveFullPageMethodOptions
    | SaveScreenMethodOptions;

export function getFolders(
    methodOptions: getFolderMethodOptions,
    folders: Folders,
    currentTestPath: string
): Folders {
    return {
        actualFolder: methodOptions.actualFolder ?? folders.actualFolder,
        baselineFolder: methodOptions.baselineFolder ?? currentTestPath,
        diffFolder: methodOptions.diffFolder ?? folders.diffFolder,
    }
}

/**
 * Get the size of a screenshot in pixels without the device pixel ratio
 */
export function getScreenshotSize(screenshot: string, devicePixelRation = 1): {
    height: number;
    width: number;
} {
    return {
        height: Buffer.from(screenshot, 'base64').readUInt32BE(20) / devicePixelRation,
        width: Buffer.from(screenshot, 'base64').readUInt32BE(16) / devicePixelRation,
    }
}

/**
 * Get the device pixel ratio
 */
export function getDevicePixelRatio(screenshot: string, deviceScreenSize: {height:number, width: number}): number {
    const screenshotSize = getScreenshotSize(screenshot)
    const devicePixelRatio = Math.round(screenshotSize.width / deviceScreenSize.width) === Math.round(screenshotSize.height / deviceScreenSize.height)
        ? Math.round(screenshotSize.width / deviceScreenSize.width)
        : Math.round(screenshotSize.height / deviceScreenSize.width)

    return Math.round(devicePixelRatio)
}

/**
 * Get the mobile instance data
 */
async function getMobileInstanceData({
    currentBrowser,
    isAndroid,
    isMobile
}: {
    currentBrowser: WebdriverIO.Browser;
    isAndroid:boolean;
    isMobile: boolean
}): Promise<{
    devicePixelRatio: number;
    devicePlatformRect: {
        statusBar: { height: number; x: number; width: number; y: number };
        homeBar: { height: number; x: number; width: number; y: number };
    };
    deviceScreenSize: { height: number; width: number };
}>{
    const deviceScreenSize = {
        height: 0,
        width: 0,
    }
    const devicePlatformRect = {
        statusBar: { height: 0, x: 0, width: 0, y: 0 },
        homeBar: { height: 0, x: 0, width: 0, y: 0 },
    }
    let devicePixelRatio = 1

    if (isMobile){
        const currentDriverCapabilities = currentBrowser.capabilities
        const { height, width } = await currentBrowser.getWindowSize()
        deviceScreenSize.height = height
        deviceScreenSize.width = width

        // @TODO: This is al based on PORTRAIT mode
        if (isAndroid && currentDriverCapabilities) {
            // We use a few `@ts-ignore` here because `pixelRatio` and `statBarHeight`
            // are returned by the driver, and not recognized by the types because they are not requested
            // @ts-ignore
            if (currentDriverCapabilities?.pixelRatio !== undefined){
                // @ts-ignore
                devicePixelRatio = currentDriverCapabilities?.pixelRatio
            }
            // @ts-ignore
            if (currentDriverCapabilities?.statBarHeight !== undefined){
                // @ts-ignore
                devicePlatformRect.statusBar.height = currentDriverCapabilities?.statBarHeight
                devicePlatformRect.statusBar.width = width
            }
        } else {
            // This is to already determine the device pixel ratio if it's not set in the capabilities
            const base64Image = await currentBrowser.takeScreenshot()
            devicePixelRatio = getDevicePixelRatio(base64Image, deviceScreenSize)
            const isIphone = width < 1024 && height < 1024
            const deviceType = isIphone ? 'IPHONE' : 'IPAD'
            const defaultPortraitHeight = isIphone ? 667 : 1024
            const portraitHeight = width > height ? width : height
            const offsetPortraitHeight =
            Object.keys(IOS_OFFSETS[deviceType]).indexOf(portraitHeight.toString()) > -1 ? portraitHeight : defaultPortraitHeight
            const currentOffsets = IOS_OFFSETS[deviceType][offsetPortraitHeight].PORTRAIT
            // NOTE: The values for iOS are based on CSS pixels, so we need to multiply them with the devicePixelRatio,
            // This will NOT be done here but in a central place
            devicePlatformRect.statusBar = {
                y: 0,
                x: 0,
                width,
                height: currentOffsets.STATUS_BAR,
            }
            devicePlatformRect.homeBar = currentOffsets.HOME_BAR
        }
    }

    return {
        devicePixelRatio,
        devicePlatformRect,
        deviceScreenSize,
    }
}

/**
 * Get the device name
 */
function getDeviceName(currentBrowser: WebdriverIO.Browser): string {
    const { capabilities: {
        // We use a few `@ts-ignore` here because this is returned by the driver
        // and not recognized by the types because they are not requested
        // @ts-ignore
        deviceName: returnedDeviceName = NOT_KNOWN,
    }, requestedCapabilities } = currentBrowser
    let deviceName = NOT_KNOWN

    // First check if it's a BrowserStack session, they don't:
    // - return the "requested" deviceName in the session capabilities
    // - don't use the `appium:deviceName` capability
    const isBrowserStack = 'bstack:options' in requestedCapabilities
    const bsOptions = (requestedCapabilities as WebdriverIO.Capabilities)['bstack:options']
    const capName = 'deviceName'
    if (isBrowserStack && bsOptions && capName in bsOptions){
        deviceName = bsOptions[capName as keyof typeof bsOptions] as string
    }
    const { 'appium:deviceName': requestedDeviceName } = requestedCapabilities as AppiumCapabilities

    return (deviceName !== NOT_KNOWN ? deviceName : requestedDeviceName || returnedDeviceName || NOT_KNOWN).toLowerCase()
}

/**
 * Get the instance data
 */
export async function getInstanceData(currentBrowser: WebdriverIO.Browser): Promise<InstanceData> {
    const NOT_KNOWN = 'not-known'
    const { capabilities: currentCapabilities, requestedCapabilities } = currentBrowser
    const {
        browserName: rawBrowserName = NOT_KNOWN,
        browserVersion: rawBrowserVersion = NOT_KNOWN,
        platformName: rawPlatformName = NOT_KNOWN,
    } = currentCapabilities as WebdriverIO.Capabilities

    // Generic data
    const browserName = rawBrowserName === '' ? NOT_KNOWN : rawBrowserName.toLowerCase()
    const browserVersion = rawBrowserVersion === '' ? NOT_KNOWN : rawBrowserVersion.toLowerCase()
    let devicePixelRatio = 1
    const platformName = rawPlatformName === '' ? NOT_KNOWN : rawPlatformName.toLowerCase()
    const logName =
        'wdio-ics:options' in requestedCapabilities
            ? (requestedCapabilities['wdio-ics:options'] as WdioIcsOptions)?.logName ?? ''
            : ''
    const name =
        'wdio-ics:options' in requestedCapabilities
            ? (requestedCapabilities['wdio-ics:options'] as WdioIcsOptions)?.name ?? ''
            : ''

    // Mobile data
    const { isAndroid, isIOS, isMobile } = currentBrowser
    const {
        // We use a few `@ts-ignore` here because this is returned by the driver
        // and not recognized by the types because they are not requested
        // @ts-ignore
        app: rawApp = NOT_KNOWN,
        // @ts-ignore
        platformVersion: rawPlatformVersion = NOT_KNOWN,
    } = currentCapabilities as WebdriverIO.Capabilities
    const appName = rawApp !== NOT_KNOWN
        ? rawApp.replace(/\\/g, '/').split('/').pop().replace(/[^a-zA-Z0-9]/g, '_')
        : NOT_KNOWN
    const deviceName = getDeviceName(currentBrowser)
    const nativeWebScreenshot = !!((requestedCapabilities as Capabilities.AppiumAndroidCapabilities)['appium:nativeWebScreenshot'])
    const platformVersion = (rawPlatformVersion === undefined || rawPlatformVersion === '') ? NOT_KNOWN : rawPlatformVersion.toLowerCase()

    const { devicePixelRatio: mobileDevicePixelRatio, devicePlatformRect, deviceScreenSize, } = await getMobileInstanceData({ currentBrowser, isAndroid, isMobile })
    devicePixelRatio = isMobile ? mobileDevicePixelRatio : devicePixelRatio

    return {
        appName,
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        devicePlatformRect,
        deviceScreenSize,
        isAndroid,
        isIOS,
        isMobile,
        logName,
        name,
        nativeWebScreenshot,
        platformName,
        platformVersion,
    }
}

/**
 * Traverse up the scope chain until browser element was reached
 */
export function getBrowserObject (elem: WebdriverIO.Element | WebdriverIO.Browser): WebdriverIO.Browser {
    const elemObject = elem as WebdriverIO.Element
    return (elemObject as WebdriverIO.Element).parent ? getBrowserObject(elemObject.parent) : elem as WebdriverIO.Browser
}

/**
 * We can't say it's native context if the autoWebview is provided and set to true, for all other cases we can say it's native
 */
export function determineNativeContext(
    driver: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
): boolean {
    if (driver.isMobile) {
        return !!(driver.requestedCapabilities as WebdriverIO.Capabilities)?.browserName === false
            && (driver.requestedCapabilities as AppiumCapabilities)?.['appium:app'] !== undefined
            && (driver.requestedCapabilities as AppiumCapabilities)?.['appium:autoWebview'] !== true
    }

    return false
}

/**
 * Check if we run for Storybook
 */
export function isStorybookMode(): boolean {
    return process.argv.includes('--storybook')
}

/**
 * Get the process argument value
 */
export function getProcessArgv(argName: string): string {
    return process.argv[process.argv.indexOf(argName) + 1]
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
export function sanitizeURL(url:string): string {
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
 * Get the stories JSON from the Storybook instance
 */
export async function getStoriesJson(url:string):  Promise<Stories>{
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
    const index = process.argv.indexOf(argName) + 1
    if (index > 0 && index < process.argv.length) {
        return parseFunc(process.argv[index])
    }
    return undefined
}

/**
 * Creates a it function for the test file
 * @TODO: improve this
 */
function itFunction(clip: boolean, clipSelector: string, data: {id:string}, storybookUrl: string) {
    const { id } = data
    const screenshotType = clip ? 'n element' : ' viewport'
    const it = `
    it(\`should take a${screenshotType} screenshot of ${id}\`, async () => {
        await browser.url(\`${storybookUrl}iframe.html?id=${id}\`);
        await $('#storybook-root').waitForDisplayed();

        const startTime = performance.now();
        ${clip
        ? `await expect($('${clipSelector}')).toMatchElementSnapshot('${id}-element')`
        : `await expect(browser).toMatchScreenSnapshot('${id}')`
}
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
function writeTestFile(directoryPath: string, fileID: string, log: Logger, testContent: string) {
    const filePath = join(directoryPath, `${fileID}.test.js`)
    try {
        writeFileSync(filePath, testContent)
        log.info(`Test file created at: ${filePath}`)
    } catch (err) {
        console.error(`It seems that the writing the file to '${filePath}' didn't succeed due to the following error: ${err}`)
        process.exit(1)
    }
}

/**
 * Create the test content
 */
function createTestContent ({ clip, clipSelector, stories, storybookUrl }:CreateTestContent):string {
    return stories.reduce((acc, storyData) => acc + itFunction(clip, clipSelector, storyData, storybookUrl), '')
}

/**
 * Create the file data
 */
function createFileData (describeTitle: string, testContent: string):string {
    return `\ndescribe(\`${describeTitle}\`, () => {\n    ${testContent}\n});\n`
}

/**
 * Create the test files
 */
export function createTestFiles({
    clip,
    clipSelector,
    directoryPath,
    log,
    numShards,
    storiesJson,
    storybookUrl,
}: CreateTestFileOptions) {
    const storiesArray = Object.values(storiesJson)
        // By default only keep the stories, not the docs
        .filter((storyData: StorybookData) => storyData?.type === 'story' || !storyData.parameters?.docsOnly)
    const fileNamePrefix = 'visual-storybook'

    if (numShards === 1){
        const testContent = createTestContent({ clip, clipSelector, stories: storiesArray, storybookUrl })
        const fileData = createFileData('All stories', testContent)
        writeTestFile(directoryPath, `${fileNamePrefix}-1-1`, log, fileData)
    } else {
        const totalStories = storiesArray.length
        const storiesPerShard = Math.ceil(totalStories / numShards)

        for (let shard = 0; shard < numShards; shard++) {
            const startIndex = shard * storiesPerShard
            const endIndex = Math.min(startIndex + storiesPerShard, totalStories)
            const shardStories = storiesArray.slice(startIndex, endIndex)
            const testContent = createTestContent({ clip, clipSelector, stories: shardStories, storybookUrl })
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
    config:Options.Testrunner,
    log: Logger,
    options:ClassOptions
): Promise<{storiesJson: Stories, storybookUrl: string, tempDir: string}>{
    // Prepare storybook scanning
    const cliUrl = getArgvValue('--url', value => value)
    const rawStorybookUrl = cliUrl ?? process.env.STORYBOOK_URL ?? options?.storybook?.url ?? 'http://127.0.0.1:6006'
    await checkStorybookIsRunning(rawStorybookUrl)
    const storybookUrl = sanitizeURL(rawStorybookUrl)

    // Create a temporary folder for test files and add that to the specs
    const tempDir = temporaryDirectory()
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
