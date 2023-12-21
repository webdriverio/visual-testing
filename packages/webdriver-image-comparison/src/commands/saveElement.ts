import { takeBase64Screenshot } from '../methods/screenshots'
import { makeCroppedBase64Image } from '../methods/images'
import beforeScreenshot from '../helpers/beforeScreenshot'
import afterScreenshot from '../helpers/afterScreenshot'
import { determineElementRectangles } from '../methods/rectangles'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces'
import type { Methods } from '../methods/methods.interface'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interface'
import type { SaveElementOptions } from './element.interfaces'
import type { ElementRectanglesOptions, RectanglesOutput } from '../methods/rectangles.interfaces'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interface'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants'
import type { ResizeDimensions } from '../methods/images.interfaces'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView'
import { waitFor } from '../helpers/utils'
import scrollToPosition from '../clientSideScripts/scrollToPosition'

/**
 * Saves an image of an element
 */
export default async function saveElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: HTMLElement,
    tag: string,
    saveElementOptions: SaveElementOptions,
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addressBarShadowPadding, autoElementScroll, formatImageName, logLevel, savePerInstance, toolBarShadowPadding } =
    saveElementOptions.wic
    const { executor } = methods
    // 1b. Set the method options to the right values
    const disableCSSAnimation: boolean =
    'disableCSSAnimation' in saveElementOptions.method
        ? saveElementOptions.method.disableCSSAnimation
        : saveElementOptions.wic.disableCSSAnimation
    const hideScrollBars: boolean =
    'hideScrollBars' in saveElementOptions.method
        ? saveElementOptions.method.hideScrollBars
        : saveElementOptions.wic.hideScrollBars
    const resizeDimensions: ResizeDimensions | number = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const hideElements: HTMLElement[] = saveElementOptions.method.hideElements || []
    const removeElements: HTMLElement[] = saveElementOptions.method.removeElements || []

    // 2.  Prepare the beforeScreenshot
    const beforeOptions: BeforeScreenshotOptions = {
        instanceData,
        addressBarShadowPadding,
        disableCSSAnimation,
        hideElements,
        logLevel,
        noScrollBars: hideScrollBars,
        removeElements,
        toolBarShadowPadding,
    }
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(executor, beforeOptions, true)
    const {
        browserName,
        browserVersion,
        deviceName,
        dimensions: {
            window: { devicePixelRatio, innerHeight, isLandscape, outerHeight, outerWidth, screenHeight, screenWidth },
        },
        isAndroid,
        isAndroidNativeWebScreenshot,
        isIos,
        isMobile,
        isTestInBrowser,
        logName,
        name,
        platformName,
        platformVersion,
    } = enrichedInstanceData

    // Scroll the element into top of the viewport and return the current scroll position
    let currentPosition: number
    if (autoElementScroll) {
        currentPosition = await executor(scrollElementIntoView, element, addressBarShadowPadding)
        await waitFor(500)
    }

    // 3.  Take the screenshot
    const base64Image: string = await takeBase64Screenshot(methods.screenShot)

    // 4.  Determine the rectangles
    const elementRectangleOptions: ElementRectanglesOptions = {
        devicePixelRatio,
        innerHeight,
        isAndroidNativeWebScreenshot,
        isAndroid,
        isIos,
        isLandscape,
    }
    const rectangles: RectanglesOutput = await determineElementRectangles({
        executor,
        base64Image,
        options: elementRectangleOptions,
        element,
    })

    if (autoElementScroll) {
    // When the screenshot has been taken and the element position has been determined,
    // we can scroll back to the original position
    // We don't need to wait for the scroll here because we don't take a screenshot after this
        await executor(scrollToPosition, currentPosition)
    }

    // 5.  Make a cropped base64 image with resizeDimensions
    // @TODO: we have isLandscape here
    const croppedBase64Image = await makeCroppedBase64Image({
        addIOSBezelCorners: false,
        base64Image,
        deviceName,
        devicePixelRatio,
        isIos,
        isLandscape,
        logLevel,
        rectangles,
        resizeDimensions,
    })

    // 6.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image: croppedBase64Image,
        disableCSSAnimation,
        filePath: {
            browserName,
            deviceName,
            isMobile,
            savePerInstance: savePerInstance,
        },
        fileName: {
            browserName,
            browserVersion,
            deviceName,
            devicePixelRatio,
            formatImageName,
            isMobile,
            isTestInBrowser,
            logName,
            name,
            outerHeight,
            outerWidth,
            platformName,
            platformVersion,
            screenHeight,
            screenWidth,
            tag,
        },
        hideElements,
        hideScrollBars,
        isLandscape,
        logLevel,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 7.  Return the data
    return afterScreenshot(executor, afterOptions)
}
