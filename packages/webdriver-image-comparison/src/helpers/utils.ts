import { join } from 'node:path'
import { DESKTOP, NOT_KNOWN, PLATFORMS } from './constants.js'
import { mkdirSync } from 'node:fs'
import type {
    FormatFileDefaults,
    FormatFileNameOptions,
    GetAddressBarShadowPaddingOptions,
    GetAndCreatePathOptions,
    GetToolBarShadowPaddingOptions,
    ScreenshotSize,
} from './utils.interfaces.js'

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
 * Checks if it is mobile
 */
export function checkIsMobile(platformName: string): boolean {
    return checkIsAndroid(platformName) || checkIsIos(platformName)
}

/**
 * Checks if the os is Android
 */
export function checkIsAndroid(platformName: string): boolean {
    return platformName.toLowerCase() === PLATFORMS.ANDROID
}

/**
 * Checks if the os is IOS
 */
export function checkIsIos(platformName: string): boolean {
    return platformName.toLowerCase() === PLATFORMS.IOS
}

/**
 * Checks if the test is executed in a browser
 */
export function checkTestInBrowser(browserName: string): boolean {
    return browserName !== ''
}

/**
 * Checks if the test is executed in a browser on a mobile phone
 */
export function checkTestInMobileBrowser(platformName: string, browserName: string): boolean {
    return checkIsMobile(platformName) && checkTestInBrowser(browserName)
}

/**
 * Checks if this is a native webscreenshot on android
 */
export function checkAndroidNativeWebScreenshot(platformName: string, nativeWebscreenshot: boolean): boolean {
    return (checkIsAndroid(platformName) && nativeWebscreenshot) || false
}

/**
 * Checks if this is an Android chromedriver screenshot
 */
export function checkAndroidChromeDriverScreenshot(platformName: string, nativeWebScreenshot: boolean): boolean {
    return checkIsAndroid(platformName) && !checkAndroidNativeWebScreenshot(platformName, nativeWebScreenshot)
}

/**
 * Get the address bar shadow padding. This is only needed for Android native webscreenshot and iOS
 */
export function getAddressBarShadowPadding(options: GetAddressBarShadowPaddingOptions): number {
    const { platformName, browserName, nativeWebScreenshot, addressBarShadowPadding, addShadowPadding } = options
    const isTestInMobileBrowser = checkTestInMobileBrowser(platformName, browserName)
    const isAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot(platformName, nativeWebScreenshot)
    const isAndroid = checkIsAndroid(platformName)
    const isIOS = checkIsIos(platformName)

    return isTestInMobileBrowser && ((isAndroidNativeWebScreenshot && isAndroid) || isIOS) && addShadowPadding
        ? addressBarShadowPadding
        : 0
}

/**
 * Get the tool bar shadow padding. This is only needed for iOS
 */
export function getToolBarShadowPadding(options: GetToolBarShadowPaddingOptions): number {
    const { platformName, browserName, toolBarShadowPadding, addShadowPadding } = options

    return checkTestInMobileBrowser(platformName, browserName) && checkIsIos(platformName) && addShadowPadding
        ? checkIsIos(platformName)
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
export function getScreenshotSize(screenshot: string, devicePixelRation = 1): ScreenshotSize {
    return {
        height: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(20) / devicePixelRation),
        width: Math.round(Buffer.from(screenshot, 'base64').readUInt32BE(16) / devicePixelRation),
    }
}

/**
 * Get the device pixel ratio
 */
export function getDevicePixelRatio(screenshot: string, deviceScreenSize: {height:number, width: number}): number {
    const screenshotSize = getScreenshotSize(screenshot)
    const devicePixelRatio = screenshotSize.width / deviceScreenSize.width

    return Math.round(devicePixelRatio)
}

/**
 * Get the iOS bezel image names
 */
export function getIosBezelImageNames(normalizedDeviceName: string): { topImageName: string; bottomImageName: string } {
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
export function updateVisualBaseline(): boolean {
    return process.argv.includes('--update-visual-baseline')
}
