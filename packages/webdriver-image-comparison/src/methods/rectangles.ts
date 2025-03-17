import type { ChainablePromiseElement } from 'webdriverio'
import { calculateDprData, checkAndroidNativeWebScreenshot, checkIsIos, getScreenshotSize, isObject } from '../helpers/utils.js'
import { getElementPositionAndroid, getElementPositionDesktop, getElementPositionIos } from './elementPosition.js'
import { IOS_OFFSETS } from '../helpers/constants.js'
import type {
    ElementRectangles,
    RectanglesOutput,
    ScreenRectanglesOptions,
    StatusAddressToolBarRectangles,
    StatusAddressToolBarRectanglesOptions,
} from './rectangles.interfaces.js'
import type { Executor, GetElementRect } from './methods.interfaces.js'
import getIosStatusAddressToolBarOffsets from '../clientSideScripts/getIosStatusAddressToolBarOffsets.js'
import type { StatusAddressToolBarOffsets } from '../clientSideScripts/statusAddressToolBarOffsets.interfaces.js'
import type { CheckScreenMethodOptions } from '../commands/screen.interfaces.js'
import type { DeviceRectangles, InstanceData } from './instanceData.interfaces.js'

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
    const {
        devicePixelRatio,
        innerHeight,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isIOS,
        isLandscape,
    } = options
    const { height } = getScreenshotSize(base64Image, devicePixelRatio)
    let elementPosition

    // Determine the element position on the screenshot
    if (isIOS) {
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
        isIOS,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isLandscape,
    } = options
    const { height, width } = getScreenshotSize(base64Image, devicePixelRatio)

    // Determine the width
    const screenshotWidth = isIOS || isAndroidChromeDriverScreenshot ? width : innerWidth
    const screenshotHeight = isIOS || isAndroidNativeWebScreenshot ? height : innerHeight
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
export async function determineStatusAddressToolBarRectangles({ deviceRectangles, executor, options }:{
    deviceRectangles: DeviceRectangles,
    executor: Executor,
    options: StatusAddressToolBarRectanglesOptions,
}): Promise<StatusAddressToolBarRectangles> {
    const {
        blockOutSideBar,
        blockOutStatusBar,
        blockOutToolBar,
        isAndroidNativeWebScreenshot,
        // isHybridApp,
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
        let statusAddressBar, toolBar, leftSidePadding, rightSidePadding = { height: 0, width: 0, x: 0, y: 0 }

        if (checkIsIos(platformName)) {
            (
                { leftSidePadding, rightSidePadding, statusAddressBar, toolBar } =
                (await executor(getIosStatusAddressToolBarOffsets, IOS_OFFSETS, isLandscape)) as StatusAddressToolBarOffsets
            )
        } else {
            statusAddressBar = {
                x: deviceRectangles.statusBarAndAddressBar.left, y: deviceRectangles.statusBarAndAddressBar.top,
                width: deviceRectangles.statusBarAndAddressBar.width, height: deviceRectangles.statusBarAndAddressBar.height,
            }
            toolBar = {
                x: deviceRectangles.bottomBar.left, y: deviceRectangles.bottomBar.top,
                width: deviceRectangles.bottomBar.width, height: deviceRectangles.bottomBar.height,
            }
            leftSidePadding = {
                x: deviceRectangles.leftSidePadding.left, y: deviceRectangles.leftSidePadding.top,
                width: deviceRectangles.leftSidePadding.width, height: deviceRectangles.leftSidePadding.height,
            }
            rightSidePadding = {
                x: deviceRectangles.rightSidePadding.left, y: deviceRectangles.rightSidePadding.top,
                width: deviceRectangles.rightSidePadding.width, height: deviceRectangles.rightSidePadding.height,
            }
        }

        if (blockOutStatusBar) {
            rectangles.push(statusAddressBar)
        }

        if (blockOutToolBar) {
            rectangles.push(toolBar)
        }

        if (blockOutSideBar) {
            rectangles.push(leftSidePadding, rightSidePadding)
        }
    }

    return rectangles
}

/**
 * Validate that the element is a WebdriverIO element
 */
export function isWdioElement(x: unknown) {
    if (!isObject(x)) {
        return false
    }

    const region = x as WebdriverIO.Element
    const keys: (keyof WebdriverIO.Element)[] = ['selector', 'elementId']

    return keys.every(key => typeof region[key] === 'string')
}

/**
 * Validate that the object is a valid ignore region
 */
function validateIgnoreRegion(x: unknown) {
    if (!isObject(x)) {
        return false
    }

    const region = x as RectanglesOutput
    const keys: (keyof RectanglesOutput)[] = ['height', 'width', 'x', 'y']

    return keys.every(key => typeof region[key] === 'number')
}

/**
 * Format the error message
 */
function formatErrorMessage(item:unknown, message:string) {
    const formattedItem = isObject(item) ? JSON.stringify(item) : item
    return `${formattedItem} ${message}`
}

/**
 * Split the ignores into elements and regions and throw an error if
 * an element is not a valid WebdriverIO element/region
 */
function splitIgnores(items:unknown[]): { elements: WebdriverIO.Element[], regions: RectanglesOutput[] }{
    const elements = []
    const regions = []
    const errorMessages = []

    for (const item of items) {
        if (Array.isArray(item)) {
            for (const nestedItem of item) {
                if (!isWdioElement(nestedItem)) {
                    errorMessages.push(formatErrorMessage(nestedItem, 'is not a valid WebdriverIO element'))
                } else {
                    elements.push(nestedItem as WebdriverIO.Element)
                }
            }
        } else if (isWdioElement(item)) {
            elements.push(item as WebdriverIO.Element)
        } else if (validateIgnoreRegion(item)) {
            regions.push(item as RectanglesOutput)
        } else {
            errorMessages.push(formatErrorMessage(item, 'is not a valid WebdriverIO element or region'))
        }
    }

    if (errorMessages.length > 0) {
        throw new Error('Invalid elements or regions: ' + errorMessages.join(', '))
    }

    return { elements, regions }
}

/**
 * Get the regions from the elements
 */
async function getRegionsFromElements(
    elements: WebdriverIO.Element[],
    getElementRect: GetElementRect,
): Promise<RectanglesOutput[]> {
    const regions = []
    for (const element of elements) {
        const region = await getElementRect(element.elementId)
        regions.push(region)
    }

    return regions
}

/**
 * Translate ignores to regions
 */
export async function determineIgnoreRegions(
    ignores: (RectanglesOutput | WebdriverIO.Element | ChainablePromiseElement)[],
    getElementRect: GetElementRect,
): Promise<RectanglesOutput[]>{
    const awaitedIgnores = await Promise.all(ignores)
    const { elements, regions } = splitIgnores(awaitedIgnores)
    const regionsFromElements = await getRegionsFromElements(elements, getElementRect)

    return [...regions, ...regionsFromElements]
        .map((region:RectanglesOutput) => ({
            x: Math.round(region.x),
            y: Math.round(region.y),
            width: Math.round(region.width),
            height: Math.round(region.height),
        }))
}

/**
 * Determine the device block outs
 */
export async function determineDeviceBlockOuts({ isAndroid, screenCompareOptions, instanceData }: {
    isAndroid: boolean,
    screenCompareOptions: CheckScreenMethodOptions,
    instanceData: InstanceData,
}){
    const rectangles: RectanglesOutput[] = []
    const { blockOutStatusBar, blockOutToolBar } = screenCompareOptions
    const { devicePlatformRect:{ homeBar, statusBar } } = instanceData

    if (blockOutStatusBar){
        rectangles.push(statusBar)
    }
    if (isAndroid){
        //
    } else if (blockOutToolBar){
        rectangles.push(homeBar)
    }

    // @TODO: This is from the native-app-compare module, I can't really find the diffs between the two
    // if (options.blockOutStatusBar) {
    //     rectangles.push(deviceInfo.rectangles.statusBar)
    // }

    // if (driver.isAndroid && options.blockOutNavigationBar) {
    //     rectangles.push(deviceInfo.rectangles.androidNavigationBar)
    // }

    return rectangles
}
