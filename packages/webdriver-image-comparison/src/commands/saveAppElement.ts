import type { Folders } from '../base.interfaces.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import { takeBase64ElementScreenshot } from '../methods/images.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { GetElementRect, Methods } from '../methods/methods.interfaces.js'
import type { SaveElementOptions, WicElement } from './element.interfaces.js'

/**
 * Saves an element image for a native app
 */
export default async function saveAppElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: WicElement,
    tag: string,
    saveElementOptions: SaveElementOptions,
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const {
        formatImageName,
        logLevel,
        savePerInstance,
    } = saveElementOptions.wic
    const { executor, getElementRect, screenShot } = methods
    const resizeDimensions: ResizeDimensions = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const {
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        deviceScreenSize,
        isIOS,
        isMobile,
        logName,
        platformName,
        platformVersion,
    } = instanceData

    // 2. Take the screenshot
    const base64Image: string = await takeBase64ElementScreenshot({
        element,
        devicePixelRatio,
        isIOS,
        methods: {
            getElementRect: getElementRect as GetElementRect,
            screenShot,
        },
        resizeDimensions,
    })

    // 3.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image,
        filePath: {
            browserName,
            deviceName,
            isMobile,
            savePerInstance,
        },
        fileName: {
            browserName,
            browserVersion,
            deviceName,
            devicePixelRatio: devicePixelRatio,
            formatImageName,
            isMobile,
            isTestInBrowser: !isNativeContext,
            logName,
            name: '',
            platformName,
            platformVersion,
            screenHeight: deviceScreenSize.height,
            screenWidth: deviceScreenSize.width,
            tag,
        },
        isNativeContext,
        isLandscape:false,
        logLevel,
        platformName,
    }

    // 4.  Return the data
    return afterScreenshot(executor, afterOptions)
}
