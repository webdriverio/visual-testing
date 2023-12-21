import { join } from 'node:path'
import { DESKTOP, PLATFORMS } from './constants.js'
import { ensureDirSync } from 'fs-extra'
import type {
    FormatFileDefaults,
    FormatFileNameOptions,
    GetAddressBarShadowPaddingOptions,
    GetAndCreatePathOptions,
    GetToolBarShadowPaddingOptions,
    ScreenshotSize,
} from './utils.interfaces'

/**
 * Get and create a folder
 */
export function getAndCreatePath(folder: string, options: GetAndCreatePathOptions): string {
    const { browserName, deviceName, isMobile, savePerInstance } = options
    const instanceName = (isMobile ? deviceName : `${DESKTOP}_${browserName}`).replace(/ /g, '_')
    const subFolder = savePerInstance ? instanceName : ''
    const folderName = join(folder, subFolder)

    ensureDirSync(folderName)

    return folderName
}

/**
 * Format the filename
 */
export function formatFileName(options: FormatFileNameOptions): string {
    const defaults: FormatFileDefaults = {
        browserName: options.browserName,
        browserVersion: options.browserVersion,
        deviceName: options.deviceName,
        dpr: options.devicePixelRatio,
        height: options.isMobile ? options.screenHeight : options.outerHeight,
        logName: options.logName,
        mobile: options.isMobile && options.isTestInBrowser ? options.browserName : options.isMobile ? 'app' : '',
        name: options.name,
        platformName: options.platformName,
        platformVersion: options.platformVersion,
        tag: options.tag,
        width: options.isMobile ? options.screenWidth : options.outerWidth,
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
    const isIos = checkIsIos(platformName)

    return isTestInMobileBrowser && ((isAndroidNativeWebScreenshot && isAndroid) || isIos) && addShadowPadding
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
    Object.keys(data).map((key) => (data[key] = typeof data[key] === 'number' ? data[key] * devicePixelRatio : data[key]))

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
        height: Buffer.from(screenshot, 'base64').readUInt32BE(20) / devicePixelRation,
        width: Buffer.from(screenshot, 'base64').readUInt32BE(16) / devicePixelRation,
    }
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
