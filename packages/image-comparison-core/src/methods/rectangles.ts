import type { ChainablePromiseElement } from 'webdriverio'
import { calculateDprData, getBase64ScreenshotSize, isObject } from '../helpers/utils.js'
import { getElementPositionAndroid, getElementPositionDesktop, getElementWebviewPosition } from './elementPosition.js'
import type {
    DeviceRectangles,
    ElementRectangles,
    RectanglesOutput,
    ScreenRectanglesOptions,
    StatusAddressToolBarRectangles,
    StatusAddressToolBarRectanglesOptions,
} from './rectangles.interfaces.js'
import type { GetElementRect } from './methods.interfaces.js'
import type { CheckScreenMethodOptions } from '../commands/screen.interfaces.js'
import type { InstanceData } from './instanceData.interfaces.js'

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
        deviceRectangles,
        initialDevicePixelRatio,
        innerHeight,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isEmulated,
        isIOS,
    } = options
    const internalDpr = isEmulated ? initialDevicePixelRatio : devicePixelRatio
    const { height } = getBase64ScreenshotSize(base64Image, internalDpr)
    let elementPosition

    // Determine the element position on the screenshot
    if (isIOS) {
        elementPosition = await getElementWebviewPosition(executor, element, { deviceRectangles })
    } else if (isAndroid) {
        elementPosition = await getElementPositionAndroid(executor, element, { deviceRectangles, isAndroidNativeWebScreenshot })
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
        internalDpr,
    )
}

/**
 * Determine the rectangles of the screen for the screenshot
 */
export function determineScreenRectangles(base64Image: string, options: ScreenRectanglesOptions): RectanglesOutput {
    // Determine screenshot data
    const {
        devicePixelRatio,
        enableLegacyScreenshotMethod,
        initialDevicePixelRatio,
        innerHeight,
        innerWidth,
        isEmulated,
        isIOS,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isLandscape,
    } = options

    // For #967: When a screenshot of an emulated device is taken, but the browser was initially
    // started as a "desktop" session, so not with emulated caps, we need to store the initial
    // devicePixelRatio when we take a screenshot and enableLegacyScreenshotMethod is enabled
    const internalDpr = isEmulated && enableLegacyScreenshotMethod ? initialDevicePixelRatio : devicePixelRatio
    const { height, width } = getBase64ScreenshotSize(base64Image, internalDpr)

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
        internalDpr,
    )
}

/**
 * Determine the rectangles for the mobile devices
 */
export function determineStatusAddressToolBarRectangles({ deviceRectangles, options }:{
    deviceRectangles: DeviceRectangles,
    options: StatusAddressToolBarRectanglesOptions,
}): StatusAddressToolBarRectangles {
    const {
        blockOutSideBar,
        blockOutStatusBar,
        blockOutToolBar,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isMobile,
        isViewPortScreenshot,
    } = options
    const rectangles = []

    if (
        isViewPortScreenshot &&
        isMobile &&
        ( isAndroid && isAndroidNativeWebScreenshot || !isAndroid )
    ) {
        const statusAddressBar = {
            x: deviceRectangles.statusBarAndAddressBar.x, y: deviceRectangles.statusBarAndAddressBar.y,
            width: deviceRectangles.statusBarAndAddressBar.width, height: deviceRectangles.statusBarAndAddressBar.height,
        }
        const toolBar = {
            x: deviceRectangles.bottomBar.x, y: deviceRectangles.bottomBar.y,
            width: deviceRectangles.bottomBar.width, height: deviceRectangles.bottomBar.height,
        }
        const leftSidePadding = {
            x: deviceRectangles.leftSidePadding.x, y: deviceRectangles.leftSidePadding.y,
            width: deviceRectangles.leftSidePadding.width, height: deviceRectangles.leftSidePadding.height,
        }
        const rightSidePadding = {
            x: deviceRectangles.rightSidePadding.x, y: deviceRectangles.rightSidePadding.y,
            width: deviceRectangles.rightSidePadding.width, height: deviceRectangles.rightSidePadding.height,
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
    const { deviceRectangles:{ homeBar, statusBar } } = instanceData

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
