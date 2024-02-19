import { executeImageCompare } from '../methods/images.js'
import { checkIsMobile } from '../helpers/utils.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { CheckFullPageOptions, SaveFullPageOptions } from './fullPage.interfaces'
import { methodCompareOptions } from '../helpers/options.js'

/**
 * Compare a fullpage screenshot
 */
export default async function checkFullPageScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkFullPageOptions: CheckFullPageOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    // 1a. Check if the method is supported in native context
    if (isNativeContext) {
        throw new Error('The method checkFullPageScreen is not supported in native context for native mobile apps!')
    }

    // 1b. Take the actual full page screenshot and retrieve the needed data
    const saveFullPageOptions: SaveFullPageOptions = {
        wic: checkFullPageOptions.wic,
        method: {
            disableCSSAnimation: checkFullPageOptions.method.disableCSSAnimation,
            enableLayoutTesting: checkFullPageOptions.method.enableLayoutTesting,
            fullPageScrollTimeout: checkFullPageOptions.method.fullPageScrollTimeout,
            hideAfterFirstScroll: checkFullPageOptions.method.hideAfterFirstScroll || [],
            hideScrollBars: checkFullPageOptions.method.hideScrollBars,
            hideElements: checkFullPageOptions.method.hideElements || [],
            removeElements: checkFullPageOptions.method.removeElements || [],
            waitForFontsLoaded: checkFullPageOptions.method.waitForFontsLoaded,
        },
    }
    const { devicePixelRatio, fileName, isLandscape } = await saveFullPageScreen(
        methods,
        instanceData,
        folders,
        tag,
        saveFullPageOptions,
        isNativeContext,
    )

    // 2a. Determine the options
    const compareOptions = methodCompareOptions(checkFullPageOptions.method)
    const executeCompareOptions = {
        devicePixelRatio,
        compareOptions: {
            wic: checkFullPageOptions.wic.compareOptions,
            method: compareOptions,
        },
        fileName,
        folderOptions: {
            autoSaveBaseline: checkFullPageOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile: checkIsMobile(instanceData.platformName),
            savePerInstance: checkFullPageOptions.wic.savePerInstance,
        },
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: checkFullPageOptions.wic.isHybridApp,
        isLandscape,
        logLevel: checkFullPageOptions.wic.logLevel,
        platformName: instanceData.platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare(methods.executor, executeCompareOptions)
}
