import type { Folders } from '../base.interfaces.js'
import { screenMethodCompareOptions } from '../helpers/options.js'
import type {  ImageCompareOptions, ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { GetElementRect, Methods } from '../methods/methods.interfaces.js'
import { determineDeviceBlockOuts, determineIgnoreRegions } from '../methods/rectangles.js'
import saveAppScreen from './saveAppScreen.js'
import type { CheckScreenOptions } from './screen.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkAppScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkScreenOptions: CheckScreenOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    // 1. Set some vars
    const saveAppScreenOptions = {
        wic: checkScreenOptions.wic,
        method:{
            ...{ hideElements: [] },
            ...{ removeElements:  [] },
        }
    }
    const screenCompareOptions = {
        ...checkScreenOptions.wic.compareOptions,
        ...checkScreenOptions.method,
    }
    const { executor, getElementRect } = methods
    const { isAndroid, isMobile } = instanceData

    // 2. Take the actual screenshot and retrieve the needed data
    const {
        devicePixelRatio,
        fileName,
        isLandscape,
    } = await saveAppScreen(methods, instanceData, folders, tag, saveAppScreenOptions, isNativeContext)

    // 3. Determine the ignore regions
    const { ignore } = checkScreenOptions.method
    const ignoreRegions = await determineIgnoreRegions(ignore || [], getElementRect as GetElementRect)
    const deviceIgnoreRegions = await determineDeviceBlockOuts({
        isAndroid,
        screenCompareOptions,
        instanceData,
    })

    // 4a. Determine the compare options
    const methodCompareOptions = screenMethodCompareOptions(checkScreenOptions.method)

    const executeCompareOptions: ImageCompareOptions = {
        ignoreRegions: [...ignoreRegions, ...deviceIgnoreRegions],
        compareOptions: {
            wic: checkScreenOptions.wic.compareOptions,
            method: methodCompareOptions,
        },
        devicePixelRatio,
        fileName,
        folderOptions: {
            autoSaveBaseline: checkScreenOptions.wic.autoSaveBaseline,
            actualFolder: folders.actualFolder,
            baselineFolder: folders.baselineFolder,
            diffFolder: folders.diffFolder,
            browserName: instanceData.browserName,
            deviceName: instanceData.deviceName,
            isMobile,
            savePerInstance: checkScreenOptions.wic.savePerInstance,
        },
        isAndroidNativeWebScreenshot: instanceData.nativeWebScreenshot,
        isHybridApp: false,
        isAndroid,
        isLandscape,
        platformName: instanceData.platformName,
    }

    // 4b Now execute the compare and return the data
    return executeImageCompare(executor, executeCompareOptions, true, isNativeContext)
}
