import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import { takeBase64ElementScreenshot } from '../methods/images.js'
import type { GetElementRect } from '../methods/methods.interfaces.js'
import type { WicElement } from './element.interfaces.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'

/**
 * Saves an element image for a native app
 */
export default async function saveAppElement(
    {
        methods,
        instanceData,
        folders,
        element,
        tag,
        saveElementOptions,
        isNativeContext = false,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const {
        formatImageName,
        savePerInstance,
    } = saveElementOptions.wic
    const { getElementRect, screenShot } = methods
    const resizeDimensions: ResizeDimensions = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const {
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        deviceRectangles:{ screenSize },
        isIOS,
        isMobile,
        logName,
        platformName,
        platformVersion,
    } = instanceData

    // 2. Take the screenshot
    const base64Image: string = await takeBase64ElementScreenshot({
        element: element as WicElement,
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
            screenHeight: screenSize.height,
            screenWidth: screenSize.width,
            tag,
        },
        isNativeContext,
        isLandscape:false,
        platformName,
    }

    // 4.  Return the data
    return afterScreenshot(afterOptions)
}
