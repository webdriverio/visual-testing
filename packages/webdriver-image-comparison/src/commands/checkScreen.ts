import saveScreen from './saveScreen.js'
import { executeImageCompare } from '../methods/images.js'
import { checkIsMobile } from '../helpers/utils.js'
import type { ImageCompareOptions, ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interface'
import type { CheckScreenOptions, SaveScreenOptions } from './screen.interfaces'
import { screenMethodCompareOptions } from '../helpers/options.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkScreenOptions: CheckScreenOptions,
): Promise<ImageCompareResult | number> {
    // 1.  Take the actual screenshot and retrieve the needed data
    const saveScreenOptions: SaveScreenOptions = {
        wic: checkScreenOptions.wic,
        method: {
            ...('disableCSSAnimation' in checkScreenOptions.method
                ? { disableCSSAnimation: checkScreenOptions.method.disableCSSAnimation }
                : {}),
            ...('hideScrollBars' in checkScreenOptions.method ? { hideScrollBars: checkScreenOptions.method.hideScrollBars } : {}),
            ...{ hideElements: checkScreenOptions.method.hideElements || [] },
            ...{ removeElements: checkScreenOptions.method.removeElements || [] },
        },
    }
    const { devicePixelRatio, fileName, isLandscape } = await saveScreen(methods, instanceData, folders, tag, saveScreenOptions)

    // 2a. Determine the compare options
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)
    const executeCompareOptions: ImageCompareOptions = {
        devicePixelRatio,
        compareOptions: {
            wic: checkScreenOptions.wic.compareOptions,
            method: methodCompareOptions,
        },
        fileName,
        folderOptions: {
            autoSaveBaseline: checkScreenOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile: checkIsMobile(instanceData.platformName),
            savePerInstance: checkScreenOptions.wic.savePerInstance,
        },
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: checkScreenOptions.wic.isHybridApp,
        isLandscape,
        logLevel: checkScreenOptions.wic.logLevel,
        platformName: instanceData.platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare(methods.executor, executeCompareOptions, true)
}
