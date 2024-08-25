import type { RectanglesOutput } from 'src/methods/rectangles.interfaces.js'
import { screenMethodCompareOptions } from '../helpers/options.js'
import type {  ImageCompareOptions, ImageCompareResult } from '../methods/images.interfaces.js'
import { executeImageCompare } from '../methods/images.js'
import type { GetElementRect } from '../methods/methods.interfaces.js'
import { determineDeviceBlockOuts, determineIgnoreRegions } from '../methods/rectangles.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import type { ChainablePromiseElement } from 'webdriverio'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkAppScreen(
    {
        methods,
        instanceData,
        folders,
        tag,
        checkScreenOptions,
        isNativeContext = true,
        testContext,
    }: InternalCheckScreenMethodOptions
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
        // Use the hide and remove elements from the checkScreenOptions and add them to the ignore array
        ignore: [
            ...checkScreenOptions.method.ignore || [],
            ...checkScreenOptions.method.hideElements as unknown as (RectanglesOutput | WebdriverIO.Element | ChainablePromiseElement)[] || [],
            ...checkScreenOptions.method.removeElements as unknown as (RectanglesOutput | WebdriverIO.Element | ChainablePromiseElement)[] || [],
        ]

    }
    const { executor, getElementRect } = methods
    const { isAndroid, isMobile } = instanceData

    // 2. Take the actual screenshot and retrieve the needed data
    const {
        devicePixelRatio,
        fileName,
        isLandscape,
    } = await saveAppScreen({
        methods,
        instanceData,
        folders,
        tag,
        saveScreenOptions: saveAppScreenOptions,
        isNativeContext,
    })

    // 3. Determine the ignore regions
    const ignoreRegions = await determineIgnoreRegions(screenCompareOptions.ignore || [], getElementRect as GetElementRect)
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
    return executeImageCompare({
        executor,
        isViewPortScreenshot: true,
        isNativeContext,
        options: executeCompareOptions,
        testContext,
    })
}
