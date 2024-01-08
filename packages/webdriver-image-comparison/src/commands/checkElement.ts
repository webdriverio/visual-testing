import { executeImageCompare } from '../methods/images.js'
import { checkIsMobile } from '../helpers/utils.js'
import saveElement from './saveElement.js'
import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { CheckElementOptions, SaveElementOptions } from './element.interfaces'
import { methodCompareOptions } from '../helpers/options.js'

/**
 * Compare  an image of the element
 */
export default async function checkElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: HTMLElement,
    tag: string,
    checkElementOptions: CheckElementOptions,
): Promise<ImageCompareResult | number> {
    // 1. Take the actual element screenshot and retrieve the needed data
    const saveElementOptions: SaveElementOptions = {
        wic: checkElementOptions.wic,
        method: {
            ...('disableCSSAnimation' in checkElementOptions.method
                ? { disableCSSAnimation: checkElementOptions.method.disableCSSAnimation }
                : {}),
            ...('hideScrollBars' in checkElementOptions.method ? { hideScrollBars: checkElementOptions.method.hideScrollBars } : {}),
            ...('resizeDimensions' in checkElementOptions.method
                ? { resizeDimensions: checkElementOptions.method.resizeDimensions }
                : {}),
            ...{ hideElements: checkElementOptions.method.hideElements || [] },
            ...{ removeElements: checkElementOptions.method.removeElements || [] },
        },
    }
    const { devicePixelRatio, fileName, isLandscape } = await saveElement(
        methods,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
    )

    // 2a. Determine the options
    const compareOptions = methodCompareOptions(checkElementOptions.method)
    const executeCompareOptions = {
        devicePixelRatio,
        compareOptions: {
            wic: checkElementOptions.wic.compareOptions,
            method: compareOptions,
        },
        fileName,
        folderOptions: {
            autoSaveBaseline: checkElementOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile: checkIsMobile(instanceData.platformName),
            savePerInstance: checkElementOptions.wic.savePerInstance,
        },
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: checkElementOptions.wic.isHybridApp,
        isLandscape,
        logLevel: checkElementOptions.wic.logLevel,
        platformName: instanceData.platformName,
    }

    // 2b Now execute the compare and return the data
    return executeImageCompare(methods.executor, executeCompareOptions)
}
