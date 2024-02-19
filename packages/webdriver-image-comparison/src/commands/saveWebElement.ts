import { takeBase64Screenshot } from '../methods/screenshots.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { determineElementRectangles } from '../methods/rectangles.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import type { SaveElementOptions, WicElement } from './element.interfaces.js'
import type { ElementRectanglesOptions, RectanglesOutput } from '../methods/rectangles.interfaces.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import scrollElementIntoView from '../clientSideScripts/scrollElementIntoView.js'
import { waitFor } from '../helpers/utils.js'
import scrollToPosition from '../clientSideScripts/scrollToPosition.js'

/**
 * Saves an image of an element
 */
export default async function saveWebElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: HTMLElement | WicElement,
    tag: string,
    saveElementOptions: SaveElementOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNativeContext: boolean,
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addressBarShadowPadding, autoElementScroll, formatImageName, logLevel, savePerInstance, toolBarShadowPadding } =
        saveElementOptions.wic
    const { executor } = methods
    // 1b. Set the method options to the right values
    const disableCSSAnimation: boolean = saveElementOptions.method.disableCSSAnimation !== undefined
        ? Boolean(saveElementOptions.method.disableCSSAnimation)
        : saveElementOptions.wic.disableCSSAnimation
    const enableLayoutTesting: boolean = saveElementOptions.method.enableLayoutTesting !== undefined
        ? Boolean(saveElementOptions.method.enableLayoutTesting)
        : saveElementOptions.wic.enableLayoutTesting
    const hideScrollBars: boolean = saveElementOptions.method.hideScrollBars !== undefined
        ? Boolean(saveElementOptions.method.hideScrollBars)
        : saveElementOptions.wic.hideScrollBars
    const resizeDimensions: ResizeDimensions | number = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS
    const hideElements: HTMLElement[] = saveElementOptions.method.hideElements || []
    const removeElements: HTMLElement[] = saveElementOptions.method.removeElements || []
    const waitForFontsLoaded: boolean = saveElementOptions.method.waitForFontsLoaded !== undefined
        ? Boolean(saveElementOptions.method.waitForFontsLoaded)
        : saveElementOptions.wic.waitForFontsLoaded

    // 2.  Prepare the beforeScreenshot
    const beforeOptions: BeforeScreenshotOptions = {
        instanceData,
        addressBarShadowPadding,
        disableCSSAnimation,
        enableLayoutTesting,
        hideElements,
        logLevel,
        noScrollBars: hideScrollBars,
        removeElements,
        toolBarShadowPadding,
        waitForFontsLoaded,
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
        isIOS,
        isMobile,
        isTestInBrowser,
        logName,
        name,
        platformName,
        platformVersion,
    } = enrichedInstanceData

    // Scroll the element into top of the viewport and return the current scroll position
    let currentPosition: number | undefined
    if (autoElementScroll) {
        currentPosition = await executor(scrollElementIntoView, element, addressBarShadowPadding)
        await waitFor(500)
    }

    // 3.  Take the screenshot
    const base64Image: string = await takeBase64Screenshot(methods.screenShot)

    // 4.  Determine the rectangles
    const elementRectangleOptions: ElementRectanglesOptions = {
        /**
         * ToDo: handle NaA case
         */
        devicePixelRatio: devicePixelRatio || NaN,
        innerHeight: innerHeight || NaN,
        isAndroidNativeWebScreenshot,
        isAndroid,
        isIOS,
        isLandscape,
    }
    const rectangles: RectanglesOutput = await determineElementRectangles({
        executor,
        base64Image,
        options: elementRectangleOptions,
        element,
    })

    // When the screenshot has been taken and the element position has been determined,
    // we can scroll back to the original position
    // We don't need to wait for the scroll here because we don't take a screenshot after this
    if (autoElementScroll && currentPosition) {
        await executor(scrollToPosition, currentPosition)
    }

    // 5.  Make a cropped base64 image with resizeDimensions
    // @TODO: we have isLandscape here
    const croppedBase64Image = await makeCroppedBase64Image({
        addIOSBezelCorners: false,
        base64Image,
        deviceName,
        devicePixelRatio: devicePixelRatio || NaN,
        isIOS,
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
        enableLayoutTesting,
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
            devicePixelRatio: devicePixelRatio || NaN,
            formatImageName,
            isMobile,
            isTestInBrowser,
            logName,
            name,
            outerHeight: outerHeight || NaN,
            outerWidth: outerWidth || NaN,
            platformName,
            platformVersion,
            screenHeight: screenHeight || NaN,
            screenWidth: screenWidth || NaN,
            tag,
        },
        hideElements,
        hideScrollBars,
        isLandscape,
        isNativeContext: false,
        logLevel,
        platformName: instanceData.platformName,
        removeElements,
    }

    // 7.  Return the data
    return afterScreenshot(executor, afterOptions)
}
