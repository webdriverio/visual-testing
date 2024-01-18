import type { Capabilities } from '@wdio/types'
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
 * Get the instance data
 */
export async function getInstanceData(
    capabilities: WebdriverIO.Capabilities,
    currentBrowser: WebdriverIO.Browser,
): Promise<InstanceData> {
    // @todo: Figure this one out, it might be that this can be simplified
    // we might be able to bring this back to the currentBrowser.requestedCapabilities, we would only miss
    // "protocol": "http",
    // "hostname": "127.0.0.1",
    // "path": "/",
    // "port": 4723
    // console.log('capabilities:', JSON.stringify(capabilities, null, 2))
    // console.log('currentBrowser.capabilities:', JSON.stringify(currentBrowser.capabilities, null, 2))
    // console.log('currentBrowser.requestedCapabilities:', JSON.stringify(currentBrowser.requestedCapabilities, null, 2))
    const currentCapabilities = (currentBrowser.requestedCapabilities as Capabilities.W3CCapabilities).alwaysMatch
        ? (currentBrowser.requestedCapabilities as Capabilities.W3CCapabilities).alwaysMatch
        : (currentBrowser.requestedCapabilities as WebdriverIO.Capabilities)
    const browserName = (
        capabilities.browserName ||
        currentCapabilities.browserName ||
        'not-known'
    ).toLowerCase()
    const browserVersion = (
        capabilities.browserVersion ||
        currentCapabilities.browserVersion ||
        'not-known'
    ).toLowerCase()
    const logName =
        'wdio-ics:options' in capabilities
            ? (capabilities['wdio-ics:options'] as WdioIcsOptions)?.logName ??
              ''
            : ''
    const name =
        'wdio-ics:options' in capabilities
            ? (capabilities['wdio-ics:options'] as WdioIcsOptions)?.name ?? ''
            : ''

    // For mobile
    const platformName = (
        capabilities.platformName ||
        currentCapabilities.platformName ||
        'not-known'
    ).toLowerCase()
    const platformVersion = (
        capabilities['appium:platformVersion'] ||
        (currentCapabilities as Capabilities.AppiumCapabilities)[
            'appium:platformVersion'
        ] ||
        'not-known'
    ).toLowerCase()
    const deviceName = (capabilities['appium:deviceName'] || '').toLowerCase()
    const nativeWebScreenshot = !!(
        (capabilities as Capabilities.AppiumAndroidCapabilities)[
            'appium:nativeWebScreenshot'
        ] ||
        (currentCapabilities as Capabilities.AppiumAndroidCapabilities)[
            'appium:nativeWebScreenshot'
        ]
    )
    const appName = 'appium:app' in capabilities
        ? (capabilities['appium:app']?.replace(/\\/g, '/')?.split('/')?.pop()?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'not-known')
        :'not-known'

    const { isAndroid, isIOS, isMobile } = currentBrowser
    const deviceScreenSize = {
        height: 0,
        width: 0,
    }
    let devicePixelRatio = 1
    const devicePlatformRect = {
        statusBar: { height: 0, x: 0, width: 0, y: 0 },
        homeBar: { height: 0, x: 0, width: 0, y: 0 },
    }
    if (isMobile) {
        const { height, width } = await currentBrowser.getWindowSize()
        deviceScreenSize.height = height
        deviceScreenSize.width = width

        // @TODO: This is al based on PORTRAIT mode
        if (isAndroid && currentBrowser.capabilities) {
            // @ts-ignore
            if (currentBrowser.capabilities?.pixelRatio !== undefined){
                // @ts-ignore
                devicePixelRatio = currentBrowser.capabilities?.pixelRatio
            }
            // @ts-ignore
            if (currentBrowser.capabilities?.statBarHeight !== undefined){
                // @ts-ignore
                devicePlatformRect.statusBar.height = currentBrowser.capabilities?.statBarHeight
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

    // For Mobile we can already get this data
    // Android
    // currentBrowser =  {
    //   "sessionId": "4328ba3b-618c-4068-8157-2531fb24cd3d",
    //   "capabilities": {
    //     "platformName": "Android",
    //     "wdio-ics:options": {
    //       "logName": "Pixel_7_pro_android_14_api_34_ChromeDriver_Portrait14",
    //       "commands": []
    //     },
    //     "automationName": "UIAutomator2",
    //     "deviceName": "emulator-5554",
    //     "platformVersion": "14",
    //     "app": "/Users/wimselles/Git/wdio/visual-testing/apps/android.wdio.native.app.v1.0.8.apk",
    //     "orientation": "PORTRAIT",
    //     "newCommandTimeout": 240,
    //     "platform": "LINUX",
    //     "webStorageEnabled": false,
    //     "takesScreenshot": true,
    //     "javascriptEnabled": true,
    //     "databaseEnabled": false,
    //     "networkConnectionEnabled": true,
    //     "locationContextEnabled": false,
    //     "warnings": {},
    //     "desired": {
    //       "platformName": "Android",
    //       "wdio-ics:options": {
    //         "logName": "Pixel_7_pro_android_14_api_34_ChromeDriver_Portrait14",
    //         "commands": []
    //       },
    //       "automationName": "UIAutomator2",
    //       "deviceName": "Pixel_7_Pro_Android_14_API_34",
    //       "platformVersion": "14.0",
    //       "app": "/Users/wimselles/Git/wdio/visual-testing/apps/android.wdio.native.app.v1.0.8.apk",
    //       "orientation": "PORTRAIT",
    //       "newCommandTimeout": 240
    //     },
    //     "deviceUDID": "emulator-5554",
    //     "appPackage": "com.wdiodemoapp",
    //     "pixelRatio": "3.5",
    //     "statBarHeight": 144,
    //     "viewportRect": {
    //       "left": 0,
    //       "top": 144,
    //       "width": 1440,
    //       "height": 2976
    //     },
    //     "deviceApiLevel": 34,
    //     "deviceManufacturer": "Google",
    //     "deviceModel": "sdk_gphone64_arm64",
    //     "deviceScreenSize": "1440x3120",
    //     "deviceScreenDensity": 560
    //   }
    // }

    // iOS
    // currentBrowser =  {
    //   "sessionId": "e1628f05-f4fd-4f0d-b6be-1b1defad6da2",
    //   "capabilities": {
    //     "webStorageEnabled": false,
    //     "locationContextEnabled": false,
    //     "browserName": "",
    //     "platform": "MAC",
    //     "javascriptEnabled": true,
    //     "databaseEnabled": false,
    //     "takesScreenshot": true,
    //     "networkConnectionEnabled": false,
    //     "platformName": "iOS",
    //     "wdio-ics:options": {
    //       "logName": "Iphone15Portrait17",
    //       "commands": []
    //     },
    //     "automationName": "XCUITest",
    //     "deviceName": "iPhone 15",
    //     "platformVersion": "17.2",
    //     "app": "/Users/wimselles/Git/wdio/visual-testing/apps/ios.simulator.wdio.native.app.v1.0.8.zip",
    //     "orientation": "PORTRAIT",
    //     "newCommandTimeout": 240,
    //     "language": "en",
    //     "locale": "en",
    //     "includeSafariInWebviews": true,
    //     "webviewConnectTimeout": 5000,
    //     "udid": "937B028C-B107-4B94-B4D5-1297A1FEDC34"
    //   }
    // }
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
 * traverse up the scope chain until browser element was reached
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
        // @todo: Figure this one out, according to the types this is not possible, but it returns for example this
        // driver {
        //   "sessionId": "6f546a6a-5f6a-4b7e-a2f9-e362cd7155b2",
        //   "capabilities": {
        //     "webStorageEnabled": false,
        //     "locationContextEnabled": false,
        //     "browserName": "",
        //     "platform": "MAC",
        //     "javascriptEnabled": true,
        //     "databaseEnabled": false,
        //     "takesScreenshot": true,
        //     "networkConnectionEnabled": false,
        //     "platformName": "iOS",
        //     "wdio-ics:options": {
        //       "logName": "Iphone15Portrait17",
        //       "commands": []
        //     },
        //     "automationName": "XCUITest",
        //     "deviceName": "iPhone 15",
        //     "platformVersion": "17.2",
        //     "app": "/Users/wimselles/Git/wdio/visual-testing/apps/ios.simulator.wdio.native.app.v1.0.8.zip",
        //     "orientation": "PORTRAIT",
        //     "newCommandTimeout": 240,
        //     "language": "en",
        //     "locale": "en",
        //     "udid": "937B028C-B107-4B94-B4D5-1297A1FEDC34"
        //   }
        // }

        // @ts-ignore
        return !!driver.capabilities?.browserName === false && driver.capabilities?.app !== undefined && driver.capabilities?.autoWebview !== true
    }

    return false

}
