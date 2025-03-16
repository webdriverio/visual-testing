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
    TestContext,
} from 'webdriver-image-comparison'
import { NOT_KNOWN } from 'webdriver-image-comparison/dist/helpers/constants.js'
import type { DeviceRectangleBound, DeviceRectangles, NativeContextType } from './types.js'

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
 * Get the mobile screen size, this is different for native and webview
 */
async function getMobileScreenSize(currentBrowser: WebdriverIO.Browser, isNativeContext: boolean): Promise<{ height: number; width: number }> {
    let height = 0, width = 0

    if (isNativeContext) {
        ({ height, width } = await currentBrowser.getWindowSize())
    } else {
        const { top, left, width:viewportWidth, height:viewportHeight } = await currentBrowser.execute('mobile: viewportRect') as DeviceRectangleBound
        width = left + viewportWidth
        height = top + viewportHeight
    }

    return { height, width }
}

/**
 * Get the mobile instance data
 */
async function getMobileInstanceData({
    currentBrowser,
    isNativeContext,
    nativeWebScreenshot,
}: {
    currentBrowser: WebdriverIO.Browser;
    isNativeContext:boolean;
    nativeWebScreenshot:boolean;
}): Promise<{
    devicePixelRatio: number;
    devicePlatformRect: {
        statusBar: { height: number; x: number; width: number; y: number };
        homeBar: { height: number; x: number; width: number; y: number };
    };
    deviceRectangles: DeviceRectangles
    deviceScreenSize: { height: number; width: number };
}>{
    const { isAndroid, isMobile } = currentBrowser
    const deviceScreenSize = {
        height: 0,
        width: 0,
    }
    const devicePlatformRect = {
        statusBar: { height: 0, x: 0, width: 0, y: 0 },
        homeBar: { height: 0, x: 0, width: 0, y: 0 },
    }
    let devicePixelRatio = 1
    let deviceRectangles = {
        statusBarAndAddressBar: { top: 0, left: 0, width: 0, height: 0 },
        viewport: { top: 0, left: 0, width: 0, height: 0 },
        bottomBar: { top: 0, left: 0, width: 0, height: 0 },
        leftSidePadding: { top: 0, left: 0, width: 0, height: 0 },
        rightSidePadding: { top: 0, left: 0, width: 0, height: 0 },
    }

    if (isMobile){
        const currentDriverCapabilities = currentBrowser.capabilities
        const { height, width } = await getMobileScreenSize(currentBrowser, isNativeContext)
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
        deviceRectangles = await getMobileViewPortPosition({
            currentBrowser,
            isNativeContext,
            nativeWebScreenshot,
            screenHeight: height,
            screenWidth: width,
        })
    }

    return {
        devicePixelRatio,
        devicePlatformRect,
        deviceScreenSize,
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

async function injectWebviewOverlay(currentBrowser: WebdriverIO.Browser, isAndroid: boolean): Promise<void> {
    await currentBrowser.execute((isAndroid) => {
        if (document.querySelector('[data-test="ics-overlay"]')) {return}

        const overlay = document.createElement('div')
        const dpr = isAndroid ? window.devicePixelRatio : 1
        overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw;
    height: ${document.documentElement.clientHeight}px;
    background: rgba(255, 165, 0, 0.5); z-index: 2147483647;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: black; font-size: 36px; font-family: Arial, sans-serif; text-align: center;`
        overlay.dataset.test = 'ics-overlay'

        // Create a text container inside the overlay
        const textContainer = document.createElement('div')
        textContainer.innerText = 'This overlay is used to determine the position of the webview.'
        overlay.appendChild(textContainer)

        overlay.onclick = (event) => {
            const { clientX: x, clientY: y } = event
            const data = {
                x: x * dpr,
                y: y * dpr,
                width: window.innerWidth * dpr,
                height: document.documentElement.clientHeight * dpr,
            }

            overlay.dataset.icsWebviewData = JSON.stringify(data)

            // Update text with click coordinates
            textContainer.innerHTML = `
        This overlay is used to determine the position of the webview.<br>
        Clicked at: X: ${data.x}, Y: ${data.y}<br/>
        Dimensions: Viewport width: ${data.width}, Viewport height: ${data.height}`
        }

        document.body.appendChild(overlay)

    }, isAndroid)
}

async function loadBase64Html(currentBrowser: WebdriverIO.Browser): Promise<void> {
    const htmlContent = `
        <html>
        <head><title>Base64 Page</title></head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <body>
            <h1>Hello from Base64!</h1>
            <p>This page was loaded without visiting a URL.</p>
        </body>
        </html>`

    // Convert HTML to Base64
    const base64Html = Buffer.from(htmlContent).toString('base64')

    // Load the Base64 data URL in the browser
    await currentBrowser.url(`data:text/html;base64,${base64Html}`)
}

async function getWebviewPosition(currentBrowser: WebdriverIO.Browser): Promise<DeviceRectangleBound> {
    return currentBrowser.execute(() => {
        const overlay = document.querySelector('[data-test="ics-overlay"]') as HTMLElement | null

        if (!overlay || !overlay.dataset.icsWebviewData) {
            return { top: 0, left: 0, width: 0, height: 0 }
        }

        overlay.remove()

        return JSON.parse(overlay.dataset.icsWebviewData)
    })
}

async function getMobileViewPortPosition({
    currentBrowser,
    isNativeContext,
    nativeWebScreenshot,
    screenHeight,
    screenWidth,
}: {
    currentBrowser: WebdriverIO.Browser,
    isNativeContext: boolean,
    nativeWebScreenshot: boolean,
    screenHeight: number,
    screenWidth: number,
}): Promise<DeviceRectangles> {
    const { isAndroid, isIOS } = currentBrowser

    if (!isNativeContext && (isIOS || (isAndroid && nativeWebScreenshot))) {
        // @TODO: Maybe also store the current URL and restore it after the test
        console.log('load base64 html')
        await loadBase64Html(currentBrowser)
        console.log('injecting webview overlay')
        // Inject the webview layer
        await injectWebviewOverlay(currentBrowser, isAndroid)
        // Now execute a native click on the overlay in the center of the screen
        const nativeClickX = screenWidth / 2
        const nativeClickY = screenHeight / 2
        console.log('clicking on overlay on center of screen = ', { x: nativeClickX, y: nativeClickY })
        await currentBrowser.execute(`mobile: ${isAndroid ? 'clickGesture' : 'tap'}`, { x: nativeClickX, y: nativeClickY })
        // Wait a bit for the overlay to be updated
        await currentBrowser.pause(100)
        // Now get the data from the overlay and remove it
        const webviewPosition = await getWebviewPosition(currentBrowser)
        // Now do all the magic
        const viewportTop = nativeClickY - webviewPosition.top
        const viewportLeft = nativeClickX - webviewPosition.left
        const statusBarAndAddressBarHeight = viewportTop
        const bottomBarHeight = screenHeight - (viewportTop + webviewPosition.height)
        const leftSidePaddingWidth = viewportLeft
        const rightSidePaddingWidth = screenWidth - (viewportLeft + webviewPosition.width)
        const deviceRectangles = {
            statusBarAndAddressBar: {
                top: 0,
                left: 0,
                width: screenWidth,
                height: statusBarAndAddressBarHeight,
            },
            viewport: {
                top: viewportTop,
                left: viewportLeft,
                width: webviewPosition.width,
                height: webviewPosition.height,
            },
            bottomBar: {
                top: viewportTop + webviewPosition.height,
                left: 0,
                width: screenWidth,
                height: bottomBarHeight,
            },
            leftSidePadding: {
                top: viewportTop,
                left: 0,
                width: leftSidePaddingWidth,
                height: webviewPosition.height,
            },
            rightSidePadding: {
                top: viewportTop,
                left: viewportLeft + webviewPosition.width,
                width: rightSidePaddingWidth,
                height: webviewPosition.height,
            },
        }

        return deviceRectangles
    }

    // No WebView detected, return empty values
    return {
        statusBarAndAddressBar: { top: 0, left: 0, width: 0, height: 0 },
        viewport: { top: 0, left: 0, width: 0, height: 0 },
        bottomBar: { top: 0, left: 0, width: 0, height: 0 },
        leftSidePadding: { top: 0, left: 0, width: 0, height: 0 },
        rightSidePadding: { top: 0, left: 0, width: 0, height: 0 },
    }
}

/**
 * Get the instance data
 */
export async function getInstanceData(currentBrowser: WebdriverIO.Browser, isNativeContext: boolean): Promise<InstanceData> {
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
        devicePlatformRect,
        deviceRectangles,
        deviceScreenSize,
    } = await getMobileInstanceData({ currentBrowser, isNativeContext, nativeWebScreenshot })
    devicePixelRatio = isMobile ? mobileDevicePixelRatio : devicePixelRatio

    console.log('deviceRectangles = ', deviceRectangles)

    return {
        appName,
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        devicePlatformRect,
        deviceRectangles,
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
): NativeContextType {
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
    }:
    {
        commandName: string;
        currentTestContext: TestContext;
        instanceData: InstanceData;
        tag: string;
    }
): TestContext {
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

