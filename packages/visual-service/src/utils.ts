import type { Capabilities } from '@wdio/types'
import type { AppiumCapabilities } from 'node_modules/@wdio/types/build/Capabilities.js'
import { getMobileScreenSize, getMobileViewPortPosition, IOS_OFFSETS, NOT_KNOWN } from 'webdriver-image-comparison'
import type { Folders, InstanceData, TestContext } from 'webdriver-image-comparison'
import type {
    EnrichTestContextOptions,
    getFolderMethodOptions,
    GetInstanceDataOptions,
    GetMobileInstanceDataOptions,
    MobileInstanceData,
    NativeContextType,
    WdioIcsOptions,
    WrapWithContextOptions,
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
    currentBrowser,
    initialDeviceRectangles,
    isNativeContext,
    nativeWebScreenshot,
}: GetMobileInstanceDataOptions): Promise<MobileInstanceData>{
    const { isAndroid, isIOS, isMobile } = currentBrowser
    let devicePixelRatio = 1
    let deviceRectangles = initialDeviceRectangles

    if (isMobile) {
        const executor = <ReturnValue, InnerArguments extends unknown[]>(
            fn: string | ((...args: InnerArguments) => ReturnValue),
            ...args: InnerArguments) => currentBrowser.execute(fn, ...args) as Promise<ReturnValue>
        const getUrl = () => currentBrowser.getUrl()
        const url = (arg:string) => currentBrowser.url(arg)
        const currentDriverCapabilities = currentBrowser.capabilities
        const { height: screenHeight, width: screenWidth } = await getMobileScreenSize({
            currentBrowser,
            executor,
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
            initialDeviceRectangles,
            isAndroid,
            isIOS,
            isNativeContext,
            methods: {
                executor,
                getUrl,
                url,
            },
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
            const base64Image = await currentBrowser.takeScreenshot()
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
            const currentOffsets = IOS_OFFSETS[deviceType][offsetPortraitHeight].PORTRAIT
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
    currentBrowser,
    initialDeviceRectangles,
    isNativeContext
}: GetInstanceDataOptions): Promise<InstanceData> {
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
        ? rawApp.replace(/\\/g, '/').split('/').pop().replace(/[^a-zA-Z0-9.]/g, '_')
        : NOT_KNOWN
    const deviceName = getDeviceName(currentBrowser)
    const ltOptions = getLtOptions(requestedCapabilities)
    // @TODO: Figure this one out in the future when we know more about the Appium capabilities from LT
    // 20241216: LT doesn't have the option to take a ChromeDriver screenshot, so if it's Android it's always native
    const nativeWebScreenshot = isAndroid && ltOptions || !!((requestedCapabilities as Capabilities.AppiumAndroidCapabilities)['appium:nativeWebScreenshot'])
    const platformVersion = (rawPlatformVersion === undefined || rawPlatformVersion === '') ? NOT_KNOWN : rawPlatformVersion.toLowerCase()
    const {
        devicePixelRatio: mobileDevicePixelRatio,
        deviceRectangles,
    } = await getMobileInstanceData({ currentBrowser, initialDeviceRectangles, isNativeContext, nativeWebScreenshot })

    devicePixelRatio = isMobile ? mobileDevicePixelRatio : devicePixelRatio

    return {
        appName,
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        deviceRectangles,
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
export function determineNativeContext(driver: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser): NativeContextType {
    // First check if it's multi remote
    if (driver.isMultiremote) {
        return Object.keys(driver).reduce((acc, instanceName) => {
            const instance = (driver as any)[instanceName] as WebdriverIO.Browser

            if (instance.sessionId) {
                acc[instance.sessionId] = determineNativeContext(instance) as boolean
            }
            return acc
        }, {} as Record<string, boolean>)
    }

    // If not check if it's a mobile
    if (driver.isMobile) {
        const isAppiumAppCapPresent = (capabilities: AppiumCapabilities) => {
            const appiumKeys = [
                'appium:app',
                'appium:bundleId',
                'appium:appPackage',
                'appium:appActivity',
                'appium:appWaitActivity',
                'appium:appWaitPackage',
                'appium:autoWebview',
            ]
            const optionsKeys = appiumKeys.map(key => key.replace('appium:', ''))
            const isInRoot = appiumKeys.some(key => capabilities[key as keyof AppiumCapabilities] !== undefined)
            // @ts-expect-error
            const isInAppiumOptions = capabilities['appium:options'] &&
                // @ts-expect-error
                optionsKeys.some(key => capabilities['appium:options']?.[key as keyof AppiumCapabilities['appium:options']] !== undefined)
                // @ts-expect-error
            const isInLtOptions = capabilities['lt:options'] &&
                // @ts-expect-error
                optionsKeys.some(key => capabilities['lt:options']?.[key as keyof AppiumCapabilities['lt:options']] !== undefined)

            return !!(isInRoot || isInAppiumOptions || isInLtOptions)
        }
        const capabilities = driver.requestedCapabilities as WebdriverIO.Capabilities & AppiumCapabilities
        const isBrowserNameFalse = !!capabilities.browserName === false
        const isAutoWebviewFalse = !(
            capabilities['appium:autoWebview'] === true ||
            capabilities['appium:options']?.autoWebview === true ||
            capabilities['lt:options']?.autoWebview === true
        )

        return isBrowserNameFalse && isAppiumAppCapPresent(capabilities) && isAutoWebviewFalse
    }

    // If not, it's webcontext
    return false
}

/**
 * Get the native context for the current browser
 */
export function getNativeContext(
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    currentBrowser: WebdriverIO.Browser,
    nativeContext: NativeContextType
): boolean {
    if (browser.isMultiremote) {
        return (nativeContext as any)[currentBrowser.sessionId]
    } else if (typeof nativeContext === 'boolean') {
        return nativeContext
    }

    return false
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
/**
 * Wrap the command with the context manager
 * This will make sure that the context manager is updated when needed
 * and that the command is executed in the correct context
 */
export function wrapWithContext<T extends (...args: any[]) => any>(opts: WrapWithContextOptions<T>): () => Promise<ReturnType<T>> {
    const { browser, command, contextManager, isNativeContext, getArgs } = opts

    return async function (this: WebdriverIO.Browser): Promise<ReturnType<T>> {
        if (contextManager.needsUpdate) {
            const instanceData: InstanceData = await getInstanceData({
                currentBrowser: browser,
                initialDeviceRectangles: contextManager.getViewportContext(),
                isNativeContext,
            })

            contextManager.setViewPortContext(instanceData.deviceRectangles)
        }

        const finalArgs = getArgs()

        return command.apply(this, finalArgs)
    }
}
