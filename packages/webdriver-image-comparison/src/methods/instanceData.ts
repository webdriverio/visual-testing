import {
    checkIsMobile,
    checkAndroidChromeDriverScreenshot,
    checkAndroidNativeWebScreenshot,
    checkIsAndroid,
    checkIsIos,
    checkTestInBrowser,
    checkTestInMobileBrowser,
    getAddressBarShadowPadding,
    getToolBarShadowPadding,
} from '../helpers/utils.js'
import getScreenDimensions from '../clientSideScripts/getScreenDimensions.js'
import type { Executor } from './methods.interfaces.js'
import type { EnrichedInstanceData, InstanceOptions } from './instanceData.interfaces.js'

/**
 * Enrich the instance data with more data
 */
export default async function getEnrichedInstanceData(
    executor: Executor,
    instanceOptions: InstanceOptions,
    addShadowPadding: boolean,
): Promise<EnrichedInstanceData> {
    // Get the current browser data
    const browserData = await executor(getScreenDimensions)
    console.log('browserData = ', browserData)
    const { addressBarShadowPadding, toolBarShadowPadding, browserName, nativeWebScreenshot, platformName } = instanceOptions

    // Determine some constants
    const isAndroid = checkIsAndroid(platformName)
    const isIOS = checkIsIos(platformName)
    const isMobile = checkIsMobile(platformName)
    const isTestInBrowser = checkTestInBrowser(browserName)
    const isTestInMobileBrowser = checkTestInMobileBrowser(platformName, browserName)
    const isAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot(platformName, nativeWebScreenshot)
    const isAndroidChromeDriverScreenshot = checkAndroidChromeDriverScreenshot(platformName, nativeWebScreenshot)
    const addressBarPadding = getAddressBarShadowPadding({
        platformName,
        browserName,
        nativeWebScreenshot,
        addressBarShadowPadding,
        addShadowPadding,
    })
    const toolBarPadding = getToolBarShadowPadding({ platformName, browserName, toolBarShadowPadding, addShadowPadding })

    // Return the new instance data object
    return {
        ...browserData,
        ...instanceOptions,
        addressBarShadowPadding: addressBarPadding,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
        isTestInBrowser,
        isTestInMobileBrowser,
        toolBarShadowPadding: toolBarPadding,
    }
}
