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
    DeviceRectangles,
    DeviceRectangleBound,
} from 'webdriver-image-comparison'
import { NOT_KNOWN } from 'webdriver-image-comparison/dist/helpers/constants.js'
import type { MobileInstanceData, NativeContextType } from './types.js'
import { DEVICE_RECTANGLES } from './constants.js'

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
async function getMobileScreenSize(currentBrowser: WebdriverIO.Browser): Promise<{ height: number; width: number }> {
    let height = 0, width = 0
    const { isIOS } = currentBrowser

    if (isIOS) {
        ({ screenSize: { height, width } } = (await currentBrowser.execute('mobile: deviceScreenInfo')) as {
            statusBarSize: { width: number, height: number },
            scale: number,
            screenSize: { width: number, height: number },
        })
    // It's Android
    } else {
        const { realDisplaySize } = (await currentBrowser.execute('mobile: deviceInfo')) as { realDisplaySize: string }

        if (!realDisplaySize || !/^\d+x\d+$/.test(realDisplaySize)) {
            throw new Error(`Invalid realDisplaySize format. Expected 'widthxheight', got "${realDisplaySize}"`)
        }
        [width, height] = realDisplaySize.split('x').map(Number)
    }

    return { height, width }
}

/**
 * Inject an overlay on top of the webview with an event listener that stores the click position in the webview
 */
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

        const textContainer = document.createElement('div')
        textContainer.innerText = 'This overlay is used to determine the position of the webview.'
        overlay.appendChild(textContainer)

        overlay.onclick = (event) => {
            const { clientX: x, clientY: y } = event
            const data = {
                left: x * dpr,
                top: y * dpr,
                width: window.innerWidth * dpr,
                height: document.documentElement.clientHeight * dpr,
            }

            overlay.dataset.icsWebviewData = JSON.stringify(data)
            textContainer.innerHTML = `
        This overlay is used to determine the position of the webview.<br>
        Clicked at: X: ${data.left}, Y: ${data.top}<br/>
        Dimensions: Viewport width: ${data.width}, Viewport height: ${data.height}`
        }

        document.body.appendChild(overlay)
    }, isAndroid)
}

/**
 * Load a base64 HTML page in the browser
 */
async function loadBase64Html(currentBrowser: WebdriverIO.Browser): Promise<void> {
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

    const base64Html = Buffer.from(htmlContent).toString('base64')

    await currentBrowser.url(`data:text/html;base64,${base64Html}`)

    if (currentBrowser.isIOS) {
        await currentBrowser.execute(() => {
            const meta = document.querySelector("meta[name='viewport']")
            if (!meta) {
                const newMeta = document.createElement('meta')
                newMeta.name = 'viewport'
                newMeta.content = 'width=device-width, initial-scale=1'
                document.head.appendChild(newMeta)
            }
        })
    }
}

/**
 * Get the webview click and viewport dimensions
 */
async function getMobileWebviewClickAndDimensions(currentBrowser: WebdriverIO.Browser): Promise<DeviceRectangleBound> {
    return currentBrowser.execute(() => {
        const overlay = document.querySelector('[data-test="ics-overlay"]') as HTMLElement | null
        const defaultValue = { top: 0, left: 0, width: 0, height: 0 }

        if (!overlay || !overlay.dataset.icsWebviewData) {
            return defaultValue
        }

        overlay.remove()

        try {
            return JSON.parse(overlay.dataset.icsWebviewData)
        } catch {
            return defaultValue
        }
    })
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
        const currentUrl = await currentBrowser.getUrl()
        // 1. Load a base64 HTML page
        await loadBase64Html(currentBrowser)
        // 2. Inject an overlay on top of the webview with an event listener that stores the click position in the webview
        await injectWebviewOverlay(currentBrowser, isAndroid)
        // 3. Click on the overlay in the center of the screen with a native click
        const nativeClickX = screenWidth / 2
        const nativeClickY = screenHeight / 2
        console.log('Clicking on the overlay at X:', nativeClickX, 'Y:', nativeClickY)
        await currentBrowser.execute(`mobile: ${isAndroid ? 'clickGesture' : 'tap'}`, { x: nativeClickX, y: nativeClickY })
        // We need to wait a bit here, otherwise the click is not registered
        await currentBrowser.pause(100)
        // 4a. Get the data from the overlay and remove it
        const { top, left, width, height } = await getMobileWebviewClickAndDimensions(currentBrowser)
        console.log({ top, left, width, height })
        // 4.b reset the url
        await currentBrowser.url(currentUrl)
        // 5. Calculate the position of the viewport based on the click position of the native click vs the overlay
        const viewportTop = nativeClickY - top
        const viewportLeft = nativeClickX - left
        const statusBarAndAddressBarHeight = viewportTop
        const bottomBarHeight = screenHeight - (viewportTop + height)
        const leftSidePaddingWidth = viewportLeft
        const rightSidePaddingWidth = screenWidth - (viewportLeft + width)
        const deviceRectangles = {
            statusBarAndAddressBar: { top: 0, left: 0, width: screenWidth, height: statusBarAndAddressBarHeight },
            viewport: { top: viewportTop, left: viewportLeft, width: width, height: height },
            bottomBar: { top: viewportTop + height, left: 0, width: screenWidth, height: bottomBarHeight },
            leftSidePadding: { top: viewportTop, left: 0, width: leftSidePaddingWidth, height: height },
            rightSidePadding: { top: viewportTop, left: viewportLeft + width, width: rightSidePaddingWidth, height: height },
        }

        return deviceRectangles
    }

    // No WebView detected, return empty values
    return DEVICE_RECTANGLES
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
}): Promise<MobileInstanceData>{
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
    let deviceRectangles = DEVICE_RECTANGLES

    if (isMobile){
        const currentDriverCapabilities = currentBrowser.capabilities
        const { height, width } = await getMobileScreenSize(currentBrowser)
        deviceScreenSize.height = height
        deviceScreenSize.width = width
        deviceRectangles = await getMobileViewPortPosition({
            currentBrowser,
            isNativeContext,
            nativeWebScreenshot,
            screenHeight: height,
            screenWidth: width,
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
            const offsetPortraitHeight = Object.keys(IOS_OFFSETS[deviceType]).indexOf(portraitHeight.toString()) > -1 ?
                portraitHeight :
                defaultPortraitHeight
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

