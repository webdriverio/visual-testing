import logger from '@wdio/logger'
import { join } from 'node:path'
import { DESKTOP, NOT_KNOWN } from './constants.js'
import { mkdirSync } from 'node:fs'
import type {
    BaseExecuteCompareOptions,
    BuildBaseExecuteCompareOptionsOptions,
    BuildFolderOptionsOptions,
    CommonCheckVariables,
    ComparisonFilePaths,
    ExecuteNativeClickOptions,
    ExtractCommonCheckVariablesOptions,
    FolderOptions,
    FormatFileDefaults,
    FormatFileNameOptions,
    GetAddressBarShadowPaddingOptions,
    GetAndCreatePathOptions,
    GetIosBezelImageNames,
    GetMobileScreenSizeOptions,
    GetMobileViewPortPositionOptions,
    GetToolBarShadowPaddingOptions,
    LoadBase64HtmlOptions,
    PrepareComparisonFilePathsOptions,
    ScreenshotSize,
} from './utils.interfaces.js'
import type { ClassOptions, CompareOptions } from './options.interfaces.js'
import { checkMetaTag } from '../clientSideScripts/checkMetaTag.js'
import { injectWebviewOverlay } from '../clientSideScripts/injectWebviewOverlay.js'
import { getMobileWebviewClickAndDimensions } from '../clientSideScripts/getMobileWebviewClickAndDimensions.js'
import type { DeviceRectangles } from '../methods/rectangles.interfaces.js'
import type { BaseDimensions } from '../base.interfaces.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:utils')

/**
 * Get and create a folder
 */
export function getAndCreatePath(folder: string, options: GetAndCreatePathOptions): string {
    const {
        browserName = NOT_KNOWN,
        deviceName = NOT_KNOWN,
        isMobile,
        savePerInstance,
    } = options
    const instanceName = (isMobile ? deviceName : `${DESKTOP}_${browserName}`).replace(/ /g, '_')
    const subFolder = savePerInstance ? instanceName : ''
    const folderName = join(folder, subFolder)

    mkdirSync(folderName, { recursive: true })

    return folderName
}

/**
 * Format the filename
 */
export function formatFileName(options: FormatFileNameOptions): string {
    const {
        browserName = NOT_KNOWN,
        browserVersion = NOT_KNOWN,
        deviceName = NOT_KNOWN,
        devicePixelRatio,
        isMobile,
        screenHeight,
        screenWidth,
        outerHeight = screenHeight,
        outerWidth = screenWidth,
        isTestInBrowser,
        name,
        platformName,
        platformVersion,
        tag,
    } = options
    const defaults: FormatFileDefaults = {
        browserName,
        browserVersion,
        deviceName,
        dpr: devicePixelRatio,
        height:isMobile ? screenHeight : outerHeight,
        logName: options.logName,
        mobile: isMobile && isTestInBrowser ? browserName  : isMobile ? 'app' : NOT_KNOWN,
        name: name,
        platformName,
        platformVersion,
        tag,
        width: isMobile ? screenWidth : outerWidth,
    }

    let fileName = options.formatImageName

    Object.keys(defaults).forEach((value: string) => {
        // @ts-ignore
        // @TODO: Fix this in a proper way
        fileName = fileName.replace(`{${value}}`, defaults[value])
    })

    return `${fileName.replace(/ /g, '_')}.png`
}

/**
 * Checks if the test is executed in a browser
 * checking for app is not sufficient because different vendors have different
 * custom names and or solutions for the app
 */
export function checkTestInBrowser(browserName: string): boolean {
    return browserName !== ''
}

/**
 * Checks if the test is executed in a browser on a mobile phone
 */
export function checkTestInMobileBrowser(isMobile: boolean, browserName: string): boolean {
    return isMobile && checkTestInBrowser(browserName)
}

/**
 * Checks if this is a native webscreenshot on android
 */
export function checkAndroidNativeWebScreenshot(isAndroid: boolean, nativeWebscreenshot: boolean): boolean {
    return (isAndroid && nativeWebscreenshot) || false
}

/**
 * Checks if this is an Android chromedriver screenshot
 */
export function checkAndroidChromeDriverScreenshot(isAndroid: boolean, nativeWebScreenshot: boolean): boolean {
    return isAndroid && !checkAndroidNativeWebScreenshot(isAndroid, nativeWebScreenshot)
}

/**
 * Get the address bar shadow padding. This is only needed for Android native webscreenshot and iOS
 */
export function getAddressBarShadowPadding(options: GetAddressBarShadowPaddingOptions): number {
    const { browserName, isAndroid, isIOS, isMobile, nativeWebScreenshot, addressBarShadowPadding, addShadowPadding } = options
    const isTestInMobileBrowser = checkTestInMobileBrowser(isMobile, browserName)
    const isAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot(isAndroid, nativeWebScreenshot)

    return isTestInMobileBrowser && ((isAndroidNativeWebScreenshot && isAndroid) || isIOS) && addShadowPadding
        ? addressBarShadowPadding
        : 0
}

/**
 * Get the tool bar shadow padding. Add some extra padding for iOS when we have a home bar
 */
export function getToolBarShadowPadding(options: GetToolBarShadowPaddingOptions): number {
    const { isMobile, browserName, isIOS, toolBarShadowPadding, addShadowPadding } = options

    return checkTestInMobileBrowser(isMobile, browserName) && addShadowPadding
        ? isIOS
            ? // The 9 extra are for iOS home bar for iPhones with a notch or iPads with a home bar
            toolBarShadowPadding + 9
            : toolBarShadowPadding
        : 0
}

/**
 * Calculate the data based on the device pixel ratio
 */
export function calculateDprData<T>(data: T, devicePixelRatio: number): T {
    // @ts-ignore
    // @TODO: need to figure this one out
    Object.keys(data).map((key) => (data[key] = typeof data[key] === 'number' ? Math.round(data[key] * devicePixelRatio) : data[key]))

    return data
}

/**
 * Wait for an amount of milliseconds
 */
export async function waitFor(milliseconds: number): Promise<void> {
    /* istanbul ignore next */
    return new Promise((resolve) => setTimeout(() => resolve(), milliseconds))
}

/**
 * Get the size of a screenshot in pixels without the device pixel ratio
 */
export function getBase64ScreenshotSize(screenshot: string, devicePixelRation = 1): ScreenshotSize {
    return {
        height: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(20) / devicePixelRation),
        width: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(16) / devicePixelRation),
    }
}

/**
 * Get the device pixel ratio
 */
export function getDevicePixelRatio(screenshot: string, deviceScreenSize: BaseDimensions): number {
    const screenshotSize = getBase64ScreenshotSize(screenshot)
    const devicePixelRatio = screenshotSize.width / deviceScreenSize.width

    return Math.round(devicePixelRatio)
}

/**
 * Get the iOS bezel image names
 */
export function getIosBezelImageNames(normalizedDeviceName: string): GetIosBezelImageNames {
    let topImageName, bottomImageName

    switch (normalizedDeviceName) {
    case 'iphonex':
        topImageName = 'iphonex.iphonexs.iphone11pro-top'
        bottomImageName = 'iphonex.iphonexs.iphone11pro-bottom'
        break
    case 'iphonexs':
        topImageName = 'iphonex.iphonexs.iphone11pro-top'
        bottomImageName = 'iphonex.iphonexs.iphone11pro-bottom'
        break
    case 'iphonexsmax':
        topImageName = 'iphonexsmax-top'
        bottomImageName = 'iphonexsmax-bottom'
        break
    case 'iphonexr':
        topImageName = 'iphonexr.iphone11-top'
        bottomImageName = 'iphonexr.iphone11-bottom'
        break
    case 'iphone11':
        topImageName = 'iphonexr.iphone11-top'
        bottomImageName = 'iphonexr.iphone11-bottom'
        break
    case 'iphone11pro':
        topImageName = 'iphonex.iphonexs.iphone11pro-top'
        bottomImageName = 'iphonex.iphonexs.iphone11pro-bottom'
        break
    case 'iphone11promax':
        topImageName = 'iphone11promax-top'
        bottomImageName = 'iphone11promax-bottom'
        break
    case 'iphone12':
        topImageName = 'iphone12.iphone12pro-top'
        bottomImageName = 'iphone12.iphone12pro.iphone13.iphone13pro.iphone14-bottom'
        break
    case 'iphone12mini':
        topImageName = 'iphone12mini-top'
        bottomImageName = 'iphone12mini.iphone13mini-bottom'
        break
    case 'iphone12pro':
        topImageName = 'iphone12.iphone12pro-top'
        bottomImageName = 'iphone12.iphone12pro.iphone13.iphone13pro.iphone14-bottom'
        break
    case 'iphone12promax':
        topImageName = 'iphone12promax-top'
        bottomImageName = 'iphone12promax.iphone13promax.iphone14plus-bottom'
        break
    case 'iphone13':
        topImageName = 'iphone13.iphone13pro.iphone14-top'
        bottomImageName = 'iphone12.iphone12pro.iphone13.iphone13pro.iphone14-bottom'
        break
    case 'iphone13mini':
        topImageName = 'iphone13mini-top'
        bottomImageName = 'iphone12mini.iphone13mini-bottom'
        break
    case 'iphone13pro':
        topImageName = 'iphone13.iphone13pro.iphone14-top'
        bottomImageName = 'iphone12.iphone12pro.iphone13.iphone13pro.iphone14-bottom'
        break
    case 'iphone13promax':
        topImageName = 'iphone13promax.iphone14plus-top'
        bottomImageName = 'iphone12promax.iphone13promax.iphone14plus-bottom'
        break
    case 'iphone14':
        topImageName = 'iphone13.iphone13pro.iphone14-top'
        bottomImageName = 'iphone12.iphone12pro.iphone13.iphone13pro.iphone14-bottom'
        break
    case 'iphone14plus':
        topImageName = 'iphone13promax.iphone14plus-top'
        bottomImageName = 'iphone12promax.iphone13promax.iphone14plus-bottom'
        break
    case 'iphone14pro':
        topImageName = 'iphone14pro-top'
        bottomImageName = 'iphone14pro-bottom'
        break
    case 'iphone14promax':
        topImageName = 'iphone14promax-top'
        bottomImageName = 'iphone14promax-bottom'
        break
    case 'iphone15':
        topImageName = 'iphone15-top'
        bottomImageName = 'iphone15-bottom'
        break
        // iPad
    case 'ipadmini':
        topImageName = 'ipadmini6th-top'
        bottomImageName = 'ipadmini6th-bottom'
        break
    case 'ipadair':
        topImageName = 'ipadair4th.ipadair5th-top'
        bottomImageName = 'ipadair4th.ipadair5th-bottom'
        break
    case 'ipadpro11':
        topImageName = 'ipadpro11-top'
        bottomImageName = 'ipadpro11-bottom'
        break
    case 'ipadpro129':
        topImageName = 'ipadpro129-top'
        bottomImageName = 'ipadpro129-bottom'
        break
    }

    if (!topImageName || !bottomImageName) {
        throw new Error(`Could not find iOS bezel images for device ${normalizedDeviceName}`)
    }

    return { topImageName, bottomImageName }
}

/**
 * Validate that the item is an object
 */
export function isObject(item:unknown) {
    return (typeof item === 'object' && item !== null) || typeof item === 'function'
}

/**
 * Validate if it's storybook
 */
export function isStorybook(){
    return process.argv.includes('--storybook')
}

/**
 * Check if we want to update baseline images
 */
export function updateVisualBaseline() {
    return process.argv.includes('--update-visual-baseline')
}
/**
 * Log the deprecated root compareOptions (at `ClassOptions` level)
 * and returns non-undefined ones to be added back to the config
 */
export function logAllDeprecatedCompareOptions(options: ClassOptions) {
    const deprecatedKeys: (keyof CompareOptions)[] = [
        'blockOutSideBar',
        'blockOutStatusBar',
        'blockOutToolBar',
        'createJsonReportFiles',
        'diffPixelBoundingBoxProximity',
        'ignoreAlpha',
        'ignoreAntialiasing',
        'ignoreColors',
        'ignoreLess',
        'ignoreNothing',
        'rawMisMatchPercentage',
        'returnAllCompareData',
        'saveAboveTolerance',
        'scaleImagesToSameSize',
    ]
    const foundDeprecatedKeys = deprecatedKeys.filter((key) => key in options)

    if (foundDeprecatedKeys.length > 0) {
        log.warn(
            'The following root-level compare options are deprecated and should be moved under \'compareOptions\':\n' +
            foundDeprecatedKeys.map((k) => `  - ${k}`).join('\n') + '\nIn the next major version, these options will be removed from the root level and only be available under \'compareOptions\'',
        )
    }

    return foundDeprecatedKeys.reduce<Partial<CompareOptions>>((acc, key) => {
        if (options[key] !== undefined) {
            acc[key] = options[key] as any
        }
        return acc
    }, {})
}

/**
 * Get the mobile screen size, this is different for native and webview
 */
export async function getMobileScreenSize({
    browserInstance,
    isIOS,
    isNativeContext,
}: GetMobileScreenSizeOptions): Promise<BaseDimensions> {
    let height = 0, width = 0
    const isLandscapeByOrientation = (await browserInstance.getOrientation()).toUpperCase() === 'LANDSCAPE'

    try {
        if (isIOS) {
            ({ screenSize: { height, width } } = (await browserInstance.execute('mobile: deviceScreenInfo')) as {
                statusBarSize: BaseDimensions,
                scale: number,
                screenSize: BaseDimensions,
            })
            // It's Android
        } else {
            const { realDisplaySize } = (await browserInstance.execute('mobile: deviceInfo')) as { realDisplaySize: string }

            if (!realDisplaySize || !/^\d+x\d+$/.test(realDisplaySize)) {
                throw new Error(`Invalid realDisplaySize format. Expected 'widthxheight', got "${realDisplaySize}"`)
            }
            [width, height] = realDisplaySize.split('x').map(Number)
        }
    } catch (error: unknown) {
        log.warn('Error getting mobile screen size:\n', error, `\nFalling back to ${isNativeContext ?
            '`getWindowSize()` which might not be as accurate' :
            'window.screen.height and window.screen.width'}`
        )

        if (isNativeContext) {
            ({ height, width } = await browserInstance.getWindowSize())
        } else {
            // This is a fallback and not 100% accurate, but we need to have something =)
            ({ height, width } = await browserInstance.execute(() => {
                const { height, width } = window.screen
                return { height, width }
            }))
        }
    }

    // There are issues where the landscape mode by orientation is not the same as the landscape mode by value
    // So we need to check and fix this
    const isLandscapeByValue = width > height
    if (isLandscapeByOrientation !== isLandscapeByValue) {
        [height, width] = [width, height]
    }

    return { height, width }
}

/**
 * Load a base64 HTML page in the browser
 */
export async function loadBase64Html({ browserInstance, isIOS }: LoadBase64HtmlOptions): Promise<void> {
    const htmlContent = `
        <html>
        <head>
            <title>Base64 Page</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    // Force correct viewport settings
                    const meta = document.querySelector("meta[name='viewport']");
                    if (!meta) {
                        const newMeta = document.createElement("meta");
                        newMeta.name = "viewport";
                        newMeta.content = "width=device-width, initial-scale=1";
                        document.head.appendChild(newMeta);
                    }
                });
            </script>
        </head>
        <body>
            <h1>Hello from Base64!</h1>
            <p>This page was loaded without visiting a URL.</p>
        </body>
        </html>`

    await browserInstance.execute((htmlContent: string) => {
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const blobUrl = URL.createObjectURL(blob)
        window.location.href = blobUrl
    }, htmlContent)

    if (isIOS) {
        await browserInstance.execute(checkMetaTag)
    }
}

/**
 * Execute a native click
 */
export async function executeNativeClick({ browserInstance, isIOS, x, y }: ExecuteNativeClickOptions): Promise<void> {
    if (isIOS) {
        return browserInstance.execute('mobile: tap', { x, y })
    }

    try {
        // The `clickGesture` is not working on Appium 1, only on Appium 2
        await browserInstance.execute('mobile: clickGesture', { x, y })
    } catch (error: unknown) {
        if (
            error instanceof Error &&
          /WebDriverError: Unknown mobile command.*?(clickGesture|tap)/i.test(error.message)
        ) {
            log.warn(
                'Error executing `clickGesture`, falling back to `doubleClickGesture`. This likely means you are using Appium 1. Is this intentional?'
            )
            await browserInstance.execute('mobile: doubleClickGesture', { x, y })
        } else {
            throw error
        }
    }
}

/**
 * Get the mobile viewport position, we determine this by:
 * 1. Loading a base64 HTML page
 * 2. Injecting an overlay on top of the webview with an event listener that stores the click position in the webview
 * 3. Clicking on the overlay in the center of the screen with a native click
 * 4. Getting the data from the overlay and removing it
 * 5. Calculating the position of the viewport based on the click position of the native click vs the overlay
 * 6. Returning the calculated values
 */
export async function getMobileViewPortPosition({
    browserInstance,
    initialDeviceRectangles,
    isAndroid,
    isIOS,
    isNativeContext,
    nativeWebScreenshot,
    screenHeight,
    screenWidth,
}: GetMobileViewPortPositionOptions): Promise<DeviceRectangles> {
    if (!isNativeContext && (isIOS || (isAndroid && nativeWebScreenshot))) {
        const currentUrl = await browserInstance.getUrl()
        // 1. Load a base64 HTML page
        await loadBase64Html({ browserInstance, isIOS })
        // 2. Inject an overlay on top of the webview with an event listener that stores the click position in the webview
        await browserInstance.execute(injectWebviewOverlay, isAndroid)
        // 3. Click on the overlay in the center of the screen with a native click
        const nativeClickX = screenWidth / 2
        const nativeClickY = screenHeight / 2
        await executeNativeClick({ browserInstance, isIOS, x: nativeClickX, y: nativeClickY })
        // We need to wait a bit here, otherwise the click is not registered
        await waitFor(100)
        // 4a. Get the data from the overlay and remove it
        const { y, x, width, height } = await browserInstance.execute(getMobileWebviewClickAndDimensions, '[data-test="ics-overlay"]')
        // 4.b reset the url
        await browserInstance.url(currentUrl)
        // 5. Calculate the position of the viewport based on the click position of the native click vs the overlay
        const viewportTop = Math.max(0, Math.round(nativeClickY - y))
        const viewportLeft = Math.max(0, Math.round(nativeClickX - x))
        const statusBarAndAddressBarHeight = Math.max(0, Math.round(viewportTop))
        const bottomBarHeight = Math.max(0, Math.round(screenHeight - (viewportTop + height)))
        const leftSidePaddingWidth = Math.max(0, Math.round(viewportLeft))
        const rightSidePaddingWidth = Math.max(0, Math.round(screenWidth - (viewportLeft + width)))
        const deviceRectangles = {
            ...initialDeviceRectangles,
            bottomBar: { y: viewportTop + height, x: 0, width: screenWidth, height: bottomBarHeight },
            leftSidePadding: { y: viewportTop, x: 0, width: leftSidePaddingWidth, height: height },
            rightSidePadding: { y: viewportTop, x: viewportLeft + width, width: rightSidePaddingWidth, height: height },
            screenSize: { height: screenHeight, width: screenWidth },
            statusBarAndAddressBar: { y: 0, x: 0, width: screenWidth, height: statusBarAndAddressBarHeight },
            viewport: { y: viewportTop, x: viewportLeft, width: width, height: height },
        }

        return deviceRectangles
    }

    // No WebView detected, return empty values
    return initialDeviceRectangles
}

/**
 * Get the value of a method or the default value
 */
export function getMethodOrWicOption<T, K extends keyof T>(
    method: Partial<T> | undefined,
    wic: T,
    key: K
): T[K] {
    return method?.[key] ?? wic[key]
}

/**
 * Determine if the Bidi screenshot can be used
 */
export function canUseBidiScreenshot(browserInstance: WebdriverIO.Browser): boolean {
    const { isBidi } = browserInstance
    const hasBrowsingContextCaptureScreenshot = typeof browserInstance.browsingContextCaptureScreenshot === 'function'
    const hasGetWindowHandle = typeof browserInstance.getWindowHandle === 'function'

    return isBidi && hasBrowsingContextCaptureScreenshot && hasGetWindowHandle
}

/**
 * Helper function to safely check boolean properties with proper defaults
 */
export function getBooleanOption(options: ClassOptions, key: keyof ClassOptions, defaultValue: boolean): boolean {
    return Object.prototype.hasOwnProperty.call(options, key) && options[key] !== undefined ? Boolean(options[key]) : defaultValue
}

/**
 * Helper function to create conditional property objects for cleaner spread operations
 */
export function createConditionalProperty<T>(condition: boolean, key: string, value: T): Record<string, T> | {} {
    return condition ? { [key]: value } : {}
}

/**
 * Check if resizeDimensions has any non-zero values (indicating it's been changed from default)
 */
export function hasResizeDimensions(resizeDimensions: any): boolean {
    return resizeDimensions && Object.values(resizeDimensions).some(value => value !== 0)
}

/**
 * Extracts common variables used across all check methods to reduce duplication
 */
export function extractCommonCheckVariables(
    options: ExtractCommonCheckVariablesOptions
): CommonCheckVariables {
    const { folders, instanceData, wicOptions } = options

    return {
    // Folders
        actualFolder: folders.actualFolder,
        baselineFolder: folders.baselineFolder,
        diffFolder: folders.diffFolder,

        // Instance data
        browserName: instanceData.browserName,
        deviceName: instanceData.deviceName,
        deviceRectangles: instanceData.deviceRectangles,
        isAndroid: instanceData.isAndroid,
        isMobile: instanceData.isMobile,
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,

        // Optional instance data
        ...(instanceData.platformName && { platformName: instanceData.platformName }),
        ...(instanceData.isIOS !== undefined && { isIOS: instanceData.isIOS }),

        // WIC options
        autoSaveBaseline: wicOptions.autoSaveBaseline,
        savePerInstance: wicOptions.savePerInstance,

        // Optional WIC options
        ...(wicOptions.isHybridApp !== undefined && { isHybridApp: wicOptions.isHybridApp }),
    }
}

/**
 * Builds folder options object used across all check methods to reduce duplication
 */
export function buildFolderOptions(
    options: BuildFolderOptionsOptions
): FolderOptions {
    const { commonCheckVariables } = options

    return {
        autoSaveBaseline: commonCheckVariables.autoSaveBaseline,
        actualFolder: commonCheckVariables.actualFolder,
        baselineFolder: commonCheckVariables.baselineFolder,
        diffFolder: commonCheckVariables.diffFolder,
        browserName: commonCheckVariables.browserName,
        deviceName: commonCheckVariables.deviceName,
        isMobile: commonCheckVariables.isMobile,
        savePerInstance: commonCheckVariables.savePerInstance,
    }
}

/**
 * Builds base execute compare options object used across all check methods to reduce duplication
 */
export function buildBaseExecuteCompareOptions(
    options: BuildBaseExecuteCompareOptionsOptions
): BaseExecuteCompareOptions {
    const {
        commonCheckVariables,
        wicCompareOptions,
        methodCompareOptions,
        devicePixelRatio,
        fileName,
        isElementScreenshot = false,
        additionalProperties = {}
    } = options

    // For element screenshots, override blockOut options to false
    const processedWicOptions = isElementScreenshot ? {
        ...wicCompareOptions,
        blockOutSideBar: false,
        blockOutStatusBar: false,
        blockOutToolBar: false,
    } : wicCompareOptions

    const baseOptions: BaseExecuteCompareOptions = {
        compareOptions: {
            wic: processedWicOptions,
            method: methodCompareOptions,
        },
        devicePixelRatio,
        deviceRectangles: commonCheckVariables.deviceRectangles,
        fileName,
        folderOptions: buildFolderOptions({ commonCheckVariables }),
        isAndroid: commonCheckVariables.isAndroid,
        isAndroidNativeWebScreenshot: commonCheckVariables.isAndroidNativeWebScreenshot,
        // Add optional properties from commonCheckVariables if they exist
        ...(commonCheckVariables.platformName && { platformName: commonCheckVariables.platformName }),
        ...(commonCheckVariables.isIOS !== undefined && { isIOS: commonCheckVariables.isIOS }),
        ...(commonCheckVariables.isHybridApp !== undefined && { isHybridApp: commonCheckVariables.isHybridApp }),
    }

    // Add any additional properties
    return {
        ...baseOptions,
        ...additionalProperties,
    }
}

/**
 * Prepare all file paths needed for image comparison
 */
export function prepareComparisonFilePaths(options: PrepareComparisonFilePathsOptions): ComparisonFilePaths {
    const {
        actualFolder,
        baselineFolder,
        diffFolder,
        browserName,
        deviceName,
        isMobile,
        savePerInstance,
        fileName
    } = options
    const createFolderOptions = { browserName, deviceName, isMobile, savePerInstance }
    const actualFolderPath = getAndCreatePath(actualFolder, createFolderOptions)
    const baselineFolderPath = getAndCreatePath(baselineFolder, createFolderOptions)
    const diffFolderPath = getAndCreatePath(diffFolder, createFolderOptions)
    const actualFilePath = join(actualFolderPath, fileName)
    const baselineFilePath = join(baselineFolderPath, fileName)
    const diffFilePath = join(diffFolderPath, fileName)

    return {
        actualFolderPath,
        baselineFolderPath,
        diffFolderPath,
        actualFilePath,
        baselineFilePath,
        diffFilePath
    }
}
