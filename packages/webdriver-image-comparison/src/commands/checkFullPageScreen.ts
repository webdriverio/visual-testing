import { executeImageCompare } from '../methods/images.js'
import { checkIsMobile } from '../helpers/utils.js'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interface'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interface'
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
): Promise<ImageCompareResult | number> {
    // 1. Take the actual full page screenshot and retrieve the needed data
    const saveFullPageOptions: SaveFullPageOptions = {
        wic: checkFullPageOptions.wic,
        method: {
            ...('disableCSSAnimation' in checkFullPageOptions.method
                ? { disableCSSAnimation: checkFullPageOptions.method.disableCSSAnimation }
                : {}),
            ...('fullPageScrollTimeout' in checkFullPageOptions.method
                ? { fullPageScrollTimeout: checkFullPageOptions.method.fullPageScrollTimeout }
                : {}),
            ...('hideScrollBars' in checkFullPageOptions.method ? { hideScrollBars: checkFullPageOptions.method.hideScrollBars } : {}),
            ...{ hideElements: checkFullPageOptions.method.hideElements || [] },
            ...{ removeElements: checkFullPageOptions.method.removeElements || [] },
            ...{ hideAfterFirstScroll: checkFullPageOptions.method.hideAfterFirstScroll || [] },
        },
    }
    const { devicePixelRatio, fileName, isLandscape } = await saveFullPageScreen(
        methods,
        instanceData,
        folders,
        tag,
        saveFullPageOptions,
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
