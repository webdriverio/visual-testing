import {
    checkAndroidChromeDriverScreenshot,
    checkAndroidNativeWebScreenshot,
    checkTestInBrowser,
    checkTestInMobileBrowser,
    getAddressBarShadowPadding,
    getToolBarShadowPadding,
} from '../helpers/utils.js'
import getScreenDimensions from '../clientSideScripts/getScreenDimensions.js'
import type { EnrichedInstanceData, InstanceOptions } from './instanceData.interfaces.js'

/**
 * Enrich the instance data with more data
 */
export default async function getEnrichedInstanceData(
    browserInstance: WebdriverIO.Browser,
    instanceOptions: InstanceOptions,
    addShadowPadding: boolean,
): Promise<EnrichedInstanceData> {
    // Get the current browser data
    const browserData = await browserInstance.execute(getScreenDimensions, instanceOptions.isMobile)
    const { addressBarShadowPadding, toolBarShadowPadding, browserName, nativeWebScreenshot } = instanceOptions

    // Determine some constants
    const isAndroid = browserInstance.isAndroid
    const isIOS = browserInstance.isIOS
    const isMobile = browserInstance.isMobile
    const isTestInBrowser = checkTestInBrowser(browserName)
    const isTestInMobileBrowser = checkTestInMobileBrowser(isMobile, browserName)
    const isAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot(isAndroid, nativeWebScreenshot)
    const isAndroidChromeDriverScreenshot = checkAndroidChromeDriverScreenshot(isAndroid, nativeWebScreenshot)
    const addressBarPadding = getAddressBarShadowPadding({
        browserName,
        isAndroid,
        isIOS,
        isMobile,
        nativeWebScreenshot,
        addressBarShadowPadding,
        addShadowPadding,
    })
    const toolBarPadding = getToolBarShadowPadding({ isAndroid, isIOS, isMobile, browserName, toolBarShadowPadding, addShadowPadding })

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
