import type { Capabilities } from '@wdio/types'
import type { AppiumCapabilities } from 'node_modules/@wdio/types/build/Capabilities.js'
import { getMobileScreenSize, getMobileViewPortPosition, IOS_OFFSETS, NOT_KNOWN } from '@wdio/image-comparison-core'
import type { Folders, InstanceData, TestContext } from '@wdio/image-comparison-core'
import type {
    EnrichTestContextOptions,
    getFolderMethodOptions,
    GetInstanceDataOptions,
    GetMobileInstanceDataOptions,
    MobileInstanceData,
    WdioIcsOptions,
} from './types.js'

/**
 * Get the folders data
 *
 * If folder options are passed in use those values
 * Otherwise, use the values set during instantiation
 */

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
 * Get the size of a base64 screenshot in pixels without the device pixel ratio
 */
export function getBase64ScreenshotSize(screenshot: string, devicePixelRation = 1): {
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
    const screenshotSize = getBase64ScreenshotSize(screenshot)
    const devicePixelRatio = Math.round(screenshotSize.width / deviceScreenSize.width) === Math.round(screenshotSize.height / deviceScreenSize.height)
        ? Math.round(screenshotSize.width / deviceScreenSize.width)
        : Math.round(screenshotSize.height / deviceScreenSize.width)

    return Math.round(devicePixelRatio)
}

/**
 * Get the mobile instance data
 */
async function getMobileInstanceData({
    browserInstance,
    initialDeviceRectangles,
    isNativeContext,
    nativeWebScreenshot,
}: GetMobileInstanceDataOptions): Promise<MobileInstanceData>{
    const { isAndroid, isIOS, isMobile } = browserInstance
    let devicePixelRatio = 1
    let deviceRectangles = initialDeviceRectangles

    if (isMobile) {
        const currentDriverCapabilities = browserInstance.capabilities
        const { height: screenHeight, width: screenWidth } = await getMobileScreenSize({
            browserInstance,
            isIOS,
            isNativeContext,
        })
        // Update the width for the device rectangles for bottomBar, screenSize, statusBar, statusBarAndAddressBar
        deviceRectangles.screenSize.height = screenHeight
        deviceRectangles.screenSize.width = screenWidth
        deviceRectangles.bottomBar.width = screenWidth
        deviceRectangles.statusBarAndAddressBar.width = screenWidth
        deviceRectangles.statusBar.width = screenWidth
        deviceRectangles = await getMobileViewPortPosition({
            browserInstance,
            initialDeviceRectangles,
            isAndroid,
            isIOS,
            isNativeContext,
            nativeWebScreenshot,
            screenHeight,
            screenWidth,
        })

        // @TODO: 20250317: When we have all things tested with the above, we can simplify the below part to only use the iOS part
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
                deviceRectangles.statusBar.height = currentDriverCapabilities?.statBarHeight
                deviceRectangles.statusBar.width = deviceRectangles.screenSize.width
            }
        } else {
            // This is to already determine the device pixel ratio if it's not set in the capabilities
            const base64Image = await browserInstance.takeScreenshot()
            devicePixelRatio = getDevicePixelRatio(base64Image, deviceRectangles.screenSize)
            const isIphone = deviceRectangles.screenSize.width < 1024 && deviceRectangles.screenSize.height < 1024
            const deviceType = isIphone ? 'IPHONE' : 'IPAD'
            const defaultPortraitHeight = isIphone ? 667 : 1024
            const portraitHeight = deviceRectangles.screenSize.width > deviceRectangles.screenSize.height ?
                deviceRectangles.screenSize.width :
                deviceRectangles.screenSize.height
            const offsetPortraitHeight = Object.keys(IOS_OFFSETS[deviceType]).indexOf(portraitHeight.toString()) > -1 ?
                portraitHeight :
                defaultPortraitHeight
            const currentOffsets = IOS_OFFSETS[deviceType][offsetPortraitHeight][screenWidth > screenHeight ? 'LANDSCAPE' : 'PORTRAIT']
            // NOTE: The values for iOS are based on CSS pixels, so we need to multiply them with the devicePixelRatio,
            // This will NOT be done here but in a central place
            deviceRectangles.statusBar = {
                x: 0,
                y: 0,
                width: deviceRectangles.screenSize.width,
                height: currentOffsets.STATUS_BAR,
            }
            deviceRectangles.homeBar = currentOffsets.HOME_BAR
        }
    }

    return {
        devicePixelRatio,
        deviceRectangles,
    }
}

/**
 * Get the LambdaTest options, these can be case insensitive
 */
export function getLtOptions(capabilities: WebdriverIO.Capabilities): any | undefined {
    const key = Object.keys(capabilities).find(
        (k) => k.toLowerCase() === 'lt:options'
    )

    return key ? (capabilities as Record<string, any>)[key] : undefined
}

/**
 * Get the device name
 */
function getDeviceName(browserInstance: WebdriverIO.Browser): string {
    const { capabilities: {
        // We use a few `@ts-ignore` here because this is returned by the driver
        // and not recognized by the types because they are not requested
        // @ts-ignore
        deviceName: returnedDeviceName = NOT_KNOWN,
    }, requestedCapabilities } = browserInstance
    let deviceName = NOT_KNOWN

    // First check if it's a BrowserStack session, they don't:
    // - return the "requested" deviceName in the session capabilities
    // - don't use the `appium:deviceName` capability
    const isBrowserStack = 'bstack:options' in requestedCapabilities
    const bsOptions = requestedCapabilities['bstack:options']
    const capName = 'deviceName'
    if (isBrowserStack && bsOptions && capName in bsOptions){
        deviceName = bsOptions[capName as keyof typeof bsOptions] as string
    }
    // Same for LabdaTest
    const isLambdaTest = 'lt:options' in requestedCapabilities
    const ltOptions = getLtOptions(requestedCapabilities)
    if (isLambdaTest && ltOptions && capName in ltOptions){
        deviceName = ltOptions[capName as keyof typeof ltOptions] as string
    }

    const { 'appium:deviceName': requestedDeviceName } = requestedCapabilities as AppiumCapabilities

    return (deviceName !== NOT_KNOWN ? deviceName : requestedDeviceName || returnedDeviceName || NOT_KNOWN).toLowerCase()
}

/**
 * Get the instance data
 */
export async function getInstanceData({
    browserInstance,
    initialDeviceRectangles,
    isNativeContext
}: GetInstanceDataOptions): Promise<InstanceData> {
    const { capabilities: currentCapabilities, requestedCapabilities } = browserInstance
    const {
        browserName: rawBrowserName = NOT_KNOWN,
        browserVersion: rawBrowserVersion = NOT_KNOWN,
        platformName: rawPlatformName = NOT_KNOWN,
    } = currentCapabilities as WebdriverIO.Capabilities

    // Generic data
    const browserName = rawBrowserName === '' ? NOT_KNOWN : rawBrowserName.toLowerCase()
    const browserVersion = rawBrowserVersion === '' ? NOT_KNOWN : rawBrowserVersion.toLowerCase()
    // For #967: When a screenshot of an emulated device is taken, but the browser was initially
    // started as a "desktop" session, so not with emulated caps, we need to store the initial
    // devicePixelRatio when we take a screenshot and enableLegacyScreenshotMethod is enabled
    let devicePixelRatio = !browserInstance.isMobile ? (await browserInstance.execute('return window.devicePixelRatio')) as number : 1
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
    const { isAndroid, isIOS, isMobile } = browserInstance
    const {
        // We use a few `@ts-ignore` here because this is returned by the driver
        // and not recognized by the types because they are not requested
        // @ts-ignore
        app: rawApp = NOT_KNOWN,
        // @ts-ignore
        platformVersion: rawPlatformVersion = NOT_KNOWN,
    } = currentCapabilities as WebdriverIO.Capabilities
    const appName = rawApp !== NOT_KNOWN
        ? rawApp.replace(/\\/g, '/').split('/').pop().replace(/[^a-zA-Z0-9.]/g, '_')
        : NOT_KNOWN
    const deviceName = getDeviceName(browserInstance)
    const ltOptions = getLtOptions(requestedCapabilities)
    // @TODO: Figure this one out in the future when we know more about the Appium capabilities from LT
    // 20241216: LT doesn't have the option to take a ChromeDriver screenshot, so if it's Android it's always native
    const nativeWebScreenshot = isAndroid && ltOptions || !!((requestedCapabilities as Capabilities.AppiumAndroidCapabilities)['appium:nativeWebScreenshot'])
    const platformVersion = (rawPlatformVersion === undefined || rawPlatformVersion === '') ? NOT_KNOWN : rawPlatformVersion.toLowerCase()
    const {
        devicePixelRatio: mobileDevicePixelRatio,
        deviceRectangles,
    } = await getMobileInstanceData({ browserInstance, initialDeviceRectangles, isNativeContext, nativeWebScreenshot })

    devicePixelRatio = isMobile ? mobileDevicePixelRatio : devicePixelRatio

    return {
        appName,
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        deviceRectangles,
        initialDevicePixelRatio: devicePixelRatio,
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
 * Get the native context for the current browser
 */
const appiumKeys = ['app', 'bundleId', 'appPackage', 'appActivity', 'appWaitActivity', 'appWaitPackage'] as const
type AppiumKeysType = typeof appiumKeys[number]
export function getNativeContext({ capabilities, isMobile }:
    { capabilities: WebdriverIO.Capabilities, isMobile: boolean }
): boolean {
    if (!capabilities || typeof capabilities !== 'object' || !isMobile) {
        return false
    }

    const isAppiumAppCapPresent = (capabilities: Capabilities.RequestedStandaloneCapabilities) => {
        return appiumKeys.some((key) => (
            (capabilities as Capabilities.AppiumCapabilities)[key as keyof Capabilities.AppiumCapabilities] !== undefined ||
            (capabilities as Capabilities.AppiumCapabilities)[`appium:${key}`as keyof Capabilities.AppiumCapabilities] !== undefined ||
            (capabilities as WebdriverIO.Capabilities)['appium:options']?.[key as AppiumKeysType] !== undefined ||
            (capabilities as WebdriverIO.Capabilities)['lt:options']?.[key as AppiumKeysType] !== undefined
        ))
    }
    const isBrowserNameFalse = !!capabilities?.browserName === false
    const isAutoWebviewFalse = !(
        // @ts-expect-error
        capabilities?.autoWebview === true ||
        capabilities['appium:autoWebview'] === true ||
        capabilities['appium:options']?.autoWebview === true ||
        capabilities['lt:options']?.autoWebview === true
    )

    return isBrowserNameFalse && isAppiumAppCapPresent(capabilities) && isAutoWebviewFalse
}

/**
 * Make sure we have all the data for the test context
 */
export function enrichTestContext(
    {
        commandName,
        currentTestContext: {
            framework,
            parent,
            title,
        },
        instanceData: {
            appName,
            browserName,
            browserVersion,
            deviceName,
            isAndroid,
            isIOS,
            isMobile,
            platformName,
            platformVersion,
        },
        tag,
    }: EnrichTestContextOptions): TestContext {
    return {
        commandName,
        instanceData: {
            app: appName,
            browser: {
                name: browserName,
                version: browserVersion,
            },
            deviceName,
            isMobile,
            isAndroid,
            isIOS,
            platform: {
                name: platformName,
                version: platformVersion,
            },
        },
        framework,
        parent,
        tag,
        title,
    }
}

