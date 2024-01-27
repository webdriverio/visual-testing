import type { Capabilities } from '@wdio/types'
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
} from 'webdriver-image-comparison'

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
    folders: Folders
): Folders {
    return {
        actualFolder: methodOptions.actualFolder ?? folders.actualFolder,
        baselineFolder: methodOptions.baselineFolder ?? folders.baselineFolder,
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
 * Get the instance data
 */
export async function getInstanceData(
    capabilities: WebdriverIO.Capabilities,
    currentBrowser: WebdriverIO.Browser,
): Promise<InstanceData> {
    console.log('capabilities:', JSON.stringify(capabilities, null, 2))
    console.log('currentBrowser.capabilities:', JSON.stringify(currentBrowser.capabilities, null, 2))
    console.log('currentBrowser.requestedCapabilities:', JSON.stringify(currentBrowser.requestedCapabilities, null, 2))

    // Generic data         | capabilities | currentCapabilities |requestedCapabilities
    // browserName          | x            | x                   | x
    // browserVersion       | x            | x (the "official")  | x (not always)
    // platformName         | x            | x                   | x
    // logName              | x            | x                   | x
    // name                 | x            | x                   | x

    // Mobile data          | capabilities | currentCapabilities |requestedCapabilities
    // appName              | x            | x                   | x
    // deviceName           | x            | x (the "official")  | x
    // devicePixelRatio     |              |                     | x (only for Android)
    // devicePlatformRect   |              | x (only for Android)|
    // deviceScreenSize     |              | x (only for Android)|
    // isAndroid            |              |                     |
    // isIOS                |              |                     |
    // isMobile             |              |                     |
    // nativeWebScreenshot  |              |                     |
    // Android only         | 'appium:'    | x                   |x
    // platformVersion      | x            | x (the "official")  | x

    const { capabilities: currentCapabilities, requestedCapabilities } = currentBrowser
    const {
        browserName: rawBrowserName,
        browserVersion: rawBrowserVersion,
        platformName: rawPlatformName,
    } = currentCapabilities as WebdriverIO.Capabilities

    // Generic data
    const browserName = (rawBrowserName === undefined || rawBrowserName === '') ? 'not-known' : rawBrowserName.toLowerCase()
    const browserVersion = (rawBrowserVersion === undefined || rawBrowserVersion === '') ? 'not-known' : rawBrowserVersion.toLowerCase()
    let devicePixelRatio = 1
    const platformName = (rawPlatformName === undefined || rawPlatformName === '') ? 'not-known' : rawPlatformName.toLowerCase()
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
        app: rawApp,
        // @ts-ignore
        deviceName: rawDeviceName,
        // @ts-ignore
        platformVersion: rawPlatformVersion,
    } = currentCapabilities as WebdriverIO.Capabilities
    const { 'appium:deviceName': requestedDeviceName } = requestedCapabilities as AppiumCapabilities
    const appName = rawApp
        ? (rawApp?.replace(/\\/g, '/')?.split('/')?.pop()?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'not-known')
        :'not-known'
    const deviceName = (requestedDeviceName || rawDeviceName || '').toLowerCase()
    const nativeWebScreenshot = !!((requestedCapabilities as Capabilities.AppiumAndroidCapabilities)['appium:nativeWebScreenshot'])
    const platformVersion = (rawPlatformVersion === undefined || rawPlatformVersion === '') ? 'not-known' : rawPlatformVersion.toLowerCase()

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
