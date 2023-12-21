import { calculateDprData, checkAndroidNativeWebScreenshot, checkIsIos, getScreenshotSize } from '../helpers/utils.js'
import { getElementPositionAndroid, getElementPositionDesktop, getElementPositionIos } from './elementPosition.js'
import { IOS_OFFSETS, ANDROID_OFFSETS } from '../helpers/constants.js'
import type {
    ElementRectangles,
    RectanglesOutput,
    ScreenRectanglesOptions,
    StatusAddressToolBarRectangles,
    StatusAddressToolBarRectanglesOptions,
} from './rectangles.interfaces'
import type { Executor } from './methods.interface'
import getIosStatusAddressToolBarOffsets from '../clientSideScripts/getIosStatusAddressToolBarOffsets.js'
import getAndroidStatusAddressToolBarOffsets from '../clientSideScripts/getAndroidStatusAddressToolBarOffsets.js'
import type { StatusAddressToolBarOffsets } from '../clientSideScripts/statusAddressToolBarOffsets.interfaces'

/**
 * Determine the element rectangles on the page / screenshot
 */
export async function determineElementRectangles({
    executor,
    base64Image,
    options,
    element,
}: ElementRectangles): Promise<RectanglesOutput> {
    // Determine screenshot data
    const { devicePixelRatio, innerHeight, isAndroid, isAndroidNativeWebScreenshot, isIos, isLandscape } = options
    const { height } = getScreenshotSize(base64Image, devicePixelRatio)
    let elementPosition

    // Determine the element position on the screenshot
    if (isIos) {
        elementPosition = await getElementPositionIos(executor, element, { isLandscape })
    } else if (isAndroid) {
        elementPosition = await getElementPositionAndroid(executor, element, { isAndroidNativeWebScreenshot, isLandscape })
    } else {
        elementPosition = await getElementPositionDesktop(executor, element, { innerHeight, screenshotHeight: height })
    }

    // Validate if the element is visible
    if (elementPosition.height === 0 || elementPosition.width === 0) {
        let selectorMessage = ' '
        if (element.selector) {
            selectorMessage = `, with selector "$(${element.selector})",`
        }
        const message = `The element${selectorMessage}is not visible. The dimensions are ${elementPosition.width}x${elementPosition.height}`
        throw new Error(message)
    }

    // Determine the rectangles based on the device pixel ratio
    return calculateDprData(
        {
            height: elementPosition.height,
            width: elementPosition.width,
            x: elementPosition.x,
            y: elementPosition.y,
        },
        devicePixelRatio,
    )
}

/**
 * Determine the rectangles of the screen for the screenshot
 */
export function determineScreenRectangles(base64Image: string, options: ScreenRectanglesOptions): RectanglesOutput {
    // Determine screenshot data
    const {
        devicePixelRatio,
        innerHeight,
        innerWidth,
        isIos,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isLandscape,
    } = options
    const { height, width } = getScreenshotSize(base64Image, devicePixelRatio)

    // Determine the width
    const screenshotWidth = isIos || isAndroidChromeDriverScreenshot ? width : innerWidth
    const screenshotHeight = isIos || isAndroidNativeWebScreenshot ? height : innerHeight
    const isRotated = isLandscape && height > width

    // Determine the rectangles
    return calculateDprData(
        {
            height: isRotated ? screenshotWidth : screenshotHeight,
            width: isRotated ? screenshotHeight : screenshotWidth,
            x: 0,
            y: 0,
        },
        devicePixelRatio,
    )
}

/**
 * Determine the rectangles for the mobile devices
 */
export async function determineStatusAddressToolBarRectangles(
    executor: Executor,
    options: StatusAddressToolBarRectanglesOptions,
): Promise<StatusAddressToolBarRectangles> {
    const {
        blockOutSideBar,
        blockOutStatusBar,
        blockOutToolBar,
        isAndroidNativeWebScreenshot,
        isHybridApp,
        isLandscape,
        isMobile,
        isViewPortScreenshot,
        platformName,
    } = options
    const rectangles = []

    if (
        isViewPortScreenshot &&
        isMobile &&
        (checkAndroidNativeWebScreenshot(platformName, isAndroidNativeWebScreenshot) || checkIsIos(platformName))
    ) {
        const { sideBar, statusAddressBar, toolBar } = (await (checkIsIos(platformName)
            ? executor(getIosStatusAddressToolBarOffsets, IOS_OFFSETS, isLandscape)
            : executor(getAndroidStatusAddressToolBarOffsets, ANDROID_OFFSETS, {
                isHybridApp,
                isLandscape,
            }))) as StatusAddressToolBarOffsets

        if (blockOutStatusBar) {
            rectangles.push(statusAddressBar)
        }

        if (blockOutToolBar) {
            rectangles.push(toolBar)
        }

        if (blockOutSideBar) {
            rectangles.push(sideBar)
        }
    }

    return rectangles
}
