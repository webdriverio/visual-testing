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
