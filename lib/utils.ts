import type { Capabilities } from '@wdio/types'
import type { Folders } from 'webdriver-image-comparison/build/base.interface.js'
import type {
    CheckElementMethodOptions,
    SaveElementMethodOptions,
} from 'webdriver-image-comparison/build/commands/element.interfaces.js'
import type {
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from 'webdriver-image-comparison/build/commands/fullPage.interfaces.js'
import type {
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
} from 'webdriver-image-comparison/build/commands/screen.interfaces.js'
import type { InstanceData } from 'webdriver-image-comparison/build/methods/instanceData.interfaces.js'

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
    // Subtract the needed data from the running instance
    // @TODO: There is something wrong with the types
    // `const currentCapabilities = currentBrowser.capabilities` is equal to:
    // (property) InstanceBase.capabilities: RemoteCapability
    // But:
    // - browserName
    // - browserVersion
    // - platformName
    // all show this error:
    // ```
    // Property '{property}' does not exist on type 'RemoteCapability'.
    //  Property '{property}' does not exist on type 'W3CCapabilities'
    // ```
    // ```
    const currentCapabilities = currentBrowser.requestedCapabilities
    const browserName = (
        capabilities.browserName ||
        // @ts-ignore
        currentCapabilities.browserName ||
        'browserName-not-known'
    ).toLowerCase()
    const browserVersion = (
        capabilities.browserVersion ||
        // @ts-ignore
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
        // @ts-ignore
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
