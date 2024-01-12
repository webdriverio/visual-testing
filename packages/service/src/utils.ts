/// <reference types="webdriverio" />

import type { Capabilities } from '@wdio/types'
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
 * Get the instance data
 */
export function getInstanceData(
    capabilities: WebdriverIO.Capabilities,
    currentBrowser: WebdriverIO.Browser
): InstanceData {
    const currentCapabilities = (currentBrowser.requestedCapabilities as Capabilities.W3CCapabilities).alwaysMatch
        ? (currentBrowser.requestedCapabilities as Capabilities.W3CCapabilities).alwaysMatch
        : (currentBrowser.requestedCapabilities as WebdriverIO.Capabilities)
    const browserName = (
        capabilities.browserName ||
        currentCapabilities.browserName ||
        'browserName-not-known'
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

    return {
        browserName,
        browserVersion,
        deviceName,
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
        return driver.capabilities?.browserName === undefined && driver.capabilities?.app !== undefined && driver.capabilities?.autoWebview !== true
    }

    return false

}
