import { Jimp } from 'jimp'
import { calculateDprData, getBase64ScreenshotSize, isObject } from '../helpers/utils.js'
import { getElementPositionAndroid, getElementPositionDesktop, getElementWebviewPosition } from './elementPosition.js'
import type {
    DetermineDeviceBlockOutsOptions,
    DeviceRectangles,
    ElementRectangles,
    PrepareIgnoreRectanglesOptions,
    PreparedIgnoreRectangles,
    RectanglesOutput,
    ScreenRectanglesOptions,
    SplitIgnores,
    StatusAddressToolBarRectangles,
    StatusAddressToolBarRectanglesOptions,
} from './rectangles.interfaces.js'
import type { ElementIgnore } from 'src/commands/element.interfaces.js'

/**
 * Determine the element rectangles on the page / screenshot
 */
export async function determineElementRectangles({
    browserInstance,
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
        elementPosition = await getElementWebviewPosition(browserInstance, element, { deviceRectangles })
    } else if (isAndroid) {
        elementPosition = await getElementPositionAndroid(browserInstance, element, { deviceRectangles, isAndroidNativeWebScreenshot })
    } else {
        elementPosition = await getElementPositionDesktop(browserInstance, element, { innerHeight, screenshotHeight: height })
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
export function validateIgnoreRegion(x: unknown) {
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
export function formatErrorMessage(item:unknown, message:string) {
    const formattedItem = isObject(item) ? JSON.stringify(item) : item
    return `${formattedItem} ${message}`
}

/**
 * Split the ignores into elements and regions and throw an error if
 * an element is not a valid WebdriverIO element/region
 */
export function splitIgnores(items:unknown[]): SplitIgnores{
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
export async function getRegionsFromElements(browserInstance: WebdriverIO.Browser, elements: WebdriverIO.Element[]): Promise<RectanglesOutput[]> {
    const regions = []
    for (const element of elements) {
        const region = await browserInstance.getElementRect(element.elementId)
        regions.push(region)
    }

    return regions
}

/**
 * Translate ignores to regions
 */
export async function determineIgnoreRegions(
    browserInstance: WebdriverIO.Browser,
    ignores: ElementIgnore[],
): Promise<RectanglesOutput[]>{
    const awaitedIgnores = await Promise.all(ignores)
    const { elements, regions } = splitIgnores(awaitedIgnores)
    const regionsFromElements = await getRegionsFromElements(browserInstance, elements)

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
export async function determineDeviceBlockOuts({ isAndroid, screenCompareOptions, instanceData }: DetermineDeviceBlockOutsOptions){
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

/**
 * Prepare all ignore rectangles for image comparison
 */
export async function prepareIgnoreRectangles(options: PrepareIgnoreRectanglesOptions): Promise<PreparedIgnoreRectangles> {
    const {
        blockOut,
        ignoreRegions,
        deviceRectangles,
        devicePixelRatio,
        isMobile,
        isNativeContext,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isViewPortScreenshot,
        imageCompareOptions,
        actualFilePath
    } = options

    // Get blockOut rectangles
    let webStatusAddressToolBarOptions: RectanglesOutput[] = []

    // Handle mobile web status/address/toolbar rectangles
    if (isMobile && !isNativeContext) {
        const statusAddressToolBarOptions = {
            blockOutSideBar: imageCompareOptions.blockOutSideBar,
            blockOutStatusBar: imageCompareOptions.blockOutStatusBar,
            blockOutToolBar: imageCompareOptions.blockOutToolBar,
            isAndroid,
            isAndroidNativeWebScreenshot,
            isMobile,
            isViewPortScreenshot,
        } as StatusAddressToolBarRectanglesOptions

        webStatusAddressToolBarOptions.push(
            ...(determineStatusAddressToolBarRectangles({ deviceRectangles, options: statusAddressToolBarOptions })) || []
        )

        if (webStatusAddressToolBarOptions.length > 0) {
            // There's an issue with the resemble lib when all the rectangles are 0,0,0,0, it will see this as a full
            // blockout of the image and the comparison will succeed with 0 % difference.
            // Additionally, rectangles with either width or height equal to 0 will result in an entire axis being ignored
            // due to how resemble handles falsy values. Filter those out up front.
            webStatusAddressToolBarOptions = webStatusAddressToolBarOptions
                .filter((rectangle) => !(rectangle.x === 0 && rectangle.y === 0 && rectangle.width === 0 && rectangle.height === 0))
                .filter((rectangle) => rectangle.width > 0 && rectangle.height > 0)
        }

        // Handle home bar (iOS) blockOut for full page screenshots
        // The toolbar should be blocked out by default (when blockOutToolBar is true or undefined)
        if (!isViewPortScreenshot && imageCompareOptions.blockOutToolBar !== false && actualFilePath) {
            try {
                // For iOS: block out home bar
                if (!isAndroid && deviceRectangles.homeBar.height > 0) {
                    const image = await Jimp.read(actualFilePath)
                    const imageHeightDevicePixels = image.bitmap.height
                    const imageHeightCssPixels = imageHeightDevicePixels / devicePixelRatio
                    // Adjust home bar X position relative to the viewport (full page image only contains viewport)
                    const viewportXCssPixels = deviceRectangles.viewport.x
                    const homeBarXRelativeToViewport = deviceRectangles.homeBar.x - viewportXCssPixels
                    // Position the home bar at the bottom of the full page image
                    const homeBarYFullPageCssPixels = imageHeightCssPixels - deviceRectangles.homeBar.height
                    const homeBarRectangle: RectanglesOutput = {
                        x: homeBarXRelativeToViewport,
                        y: homeBarYFullPageCssPixels,
                        width: deviceRectangles.homeBar.width,
                        height: deviceRectangles.homeBar.height,
                    }

                    webStatusAddressToolBarOptions.push(homeBarRectangle)
                }
            } catch (_error) {
                // If we can't read the image, skip adding the toolbar blockOut
                // This shouldn't happen in normal operation, but we don't want to fail the comparison
            }
        }
    }

    // Combine all ignore regions
    const ignoredBoxes = [
        // These come from the method
        ...blockOut,
        // @TODO: I'm defaulting ignore regions for devices
        // Need to check if this is the right thing to do for web and mobile browser tests
        ...ignoreRegions,
        // Only get info about the status bars when we are in the web context
        ...webStatusAddressToolBarOptions
    ]
        .map(
            // Make sure all the rectangles are equal to the dpr for the screenshot
            (rectangles) => {
                return calculateDprData(
                    {
                        // Adjust for the ResembleJS API
                        bottom: rectangles.y + rectangles.height,
                        right: rectangles.x + rectangles.width,
                        left: rectangles.x,
                        top: rectangles.y,
                    },
                    // For Android we don't need to do it times the pixel ratio, for all others we need to
                    isAndroid ? 1 : devicePixelRatio,
                )
            },
        )

    return {
        ignoredBoxes,
        hasIgnoreRectangles: ignoredBoxes.length > 0
    }
}
