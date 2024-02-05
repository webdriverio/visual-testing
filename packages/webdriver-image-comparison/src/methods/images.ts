import { access, copySync, outputFile, readFileSync } from 'fs-extra'
import { join } from 'node:path'
import { createCanvas, loadImage } from 'canvas'
import type { ComparisonOptions, ComparisonIgnoreOption } from 'resemblejs'
import compareImages from '../resemble/compareImages.js'
import { calculateDprData, getAndCreatePath, getIosBezelImageNames, getScreenshotSize } from '../helpers/utils.js'
import { DEFAULT_RESIZE_DIMENSIONS, supportedIosBezelDevices } from '../helpers/constants.js'
import { determineStatusAddressToolBarRectangles, isWdioElement } from './rectangles.js'
import type {
    AdjustedAxis,
    CropAndConvertToDataURL,
    CroppedBase64Image,
    DimensionsWarning,
    HandleIOSBezelCorners,
    IgnoreBoxes,
    ImageCompareOptions,
    ImageCompareResult,
    ResizeDimensions,
    RotateBase64ImageOptions,
    RotatedImage,
} from './images.interfaces'
import type { FullPageScreenshotsData } from './screenshots.interfaces'
import type { Executor, GetElementRect, TakeScreenShot } from './methods.interfaces'
import type { CompareData } from '../resemble/compare.interfaces'
import { LogLevel } from '../helpers/options.interfaces'
import type { WicElement } from '../commands/element.interfaces.js'

/**
 * Check if the image exists and create a new baseline image if needed
 */
export async function checkBaselineImageExists(
    actualFilePath: string,
    baselineFilePath: string,
    autoSaveBaseline: boolean,
    logLevel: LogLevel,
): Promise<void> {
    return new Promise((resolve, reject) => {
        access(baselineFilePath, (error) => {
            if (error) {
                if (autoSaveBaseline) {
                    try {
                        copySync(actualFilePath, baselineFilePath)
                        if (logLevel === LogLevel.info) {
                            console.log(
                                '\x1b[33m%s\x1b[0m',
                                `
#####################################################################################
 INFO:
 Autosaved the image to
 ${baselineFilePath}
#####################################################################################
`,
                            )
                        }
                    } catch (error) {
                        /* istanbul ignore next */
                        reject(
                            `
#####################################################################################
 Image could not be copied. The following error was thrown:
 ${error}
#####################################################################################
`,
                        )
                    }
                } else {
                    reject(
                        `
#####################################################################################
 Baseline image not found, save the actual image manually to the baseline.
 The image can be found here:
 ${actualFilePath}
#####################################################################################
`,
                    )
                }
            }
            resolve()
        })
    })
}

/**
 * Get the rotated image if needed
 */
async function getRotatedImageIfNeeded({ isLandscape, base64Image }: RotatedImage): Promise<string> {
    const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(base64Image)
    const isRotated = isLandscape && screenshotHeight > screenshotWidth

    return isRotated
        ? await rotateBase64Image({ base64Image, degrees: -90, newHeight: screenshotWidth, newWidth: screenshotHeight })
        : base64Image
}

/**
 * Log a warning when the crop goes out of the screen
 */
function logDimensionWarning({
    dimension,
    logLevel,
    maxDimension,
    position,
    type,
}: DimensionsWarning): void {
    if (logLevel === LogLevel.debug || logLevel === LogLevel.warn) {
        console.log(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 THE RESIZE DIMENSION ${type}=${dimension} MADE THE CROPPING GO OUT OF THE SCREEN SIZE
 RESULTING IN A ${type} CROP POSITION=${position}.
 THIS HAS BEEN DEFAULTED TO '${['TOP', 'LEFT'].includes(type) ? 0 : maxDimension}'
#####################################################################################
`,
        )
    }
}

/**
 * Get the adjusted axis
 */
function getAdjustedAxis({
    length,
    logLevel,
    maxDimension,
    paddingEnd,
    paddingStart,
    start,
    warningType,
}: AdjustedAxis): [number, number] {
    let adjustedStart = start - paddingStart
    let adjustedEnd = start + length + paddingEnd

    if (adjustedStart < 0) {
        logDimensionWarning({
            dimension: paddingStart,
            logLevel,
            maxDimension,
            position: adjustedStart,
            type: warningType === 'WIDTH' ? 'LEFT' : 'TOP',
        })
        adjustedStart = 0
    }
    if (adjustedEnd > maxDimension) {
        logDimensionWarning({
            dimension: paddingEnd,
            logLevel,
            maxDimension,
            position: adjustedEnd,
            type: warningType === 'WIDTH' ? 'RIGHT' : 'BOTTOM',
        })
        adjustedEnd = maxDimension
    }

    return [adjustedStart, adjustedEnd]
}

/**
 * Handle the iOS bezel corners
 */
async function handleIOSBezelCorners({
    addIOSBezelCorners,
    ctx,
    deviceName,
    devicePixelRatio,
    height,
    isLandscape,
    width,
}: HandleIOSBezelCorners){
    // Add the bezel corners to the iOS image if we need to
    const normalizedDeviceName = deviceName
        .toLowerCase()
    // (keep alphanumeric|remove simulator|remove inch|remove 1st/2nd/3rd/4th generation)
        .replace(/([^A-Za-z0-9]|simulator|inch|(\d(st|nd|rd|th)) generation)/gi, '')
    const isSupported =
        // For iPhone
        (normalizedDeviceName.includes('iphone') && supportedIosBezelDevices.includes(normalizedDeviceName)) ||
        // For iPad
        (normalizedDeviceName.includes('ipad') &&
        supportedIosBezelDevices.includes(normalizedDeviceName) &&
        (width / devicePixelRatio >= 1133 || height / devicePixelRatio >= 1133))
    let isIosBezelError = false

    if (addIOSBezelCorners && isSupported) {
        // Determine the bezel images
        const { topImageName, bottomImageName } = getIosBezelImageNames(normalizedDeviceName)

        if (topImageName && bottomImageName) {
            const topImage = readFileSync(join(__dirname, '..', '..', 'assets', 'ios', `${topImageName}.png`)).toString('base64')
            const bottomImage = readFileSync(join(__dirname, '..', '..', 'assets', 'ios', `${bottomImageName}.png`)).toString('base64')

            // If the screen is rotated the images need to be rotated
            const topBase64Image = isLandscape
                ? await rotateBase64Image({
                    base64Image: topImage,
                    degrees: -90,
                    newHeight: getScreenshotSize(topImage).width,
                    newWidth: getScreenshotSize(topImage).height,
                })
                : topImage
            const bottomBase64Image = isLandscape
                ? await rotateBase64Image({
                    base64Image: bottomImage,
                    degrees: -90,
                    newHeight: getScreenshotSize(topImage).width,
                    newWidth: getScreenshotSize(topImage).height,
                })
                : bottomImage
            // Draw top image, always place it at x=0 and y=0
            ctx.drawImage(await loadImage(`data:image/png;base64,${topBase64Image}`), 0, 0)
            // Draw bottom image, depending if the screen is rotated it needs to be placed
            // y = heightScreen - heightBottom or x = widthScreen - heightBottom
            ctx.drawImage(
                await loadImage(`data:image/png;base64,${bottomBase64Image}`),
                isLandscape ? width - getScreenshotSize(bottomImage).height : 0,
                isLandscape ? 0 : height - getScreenshotSize(bottomImage).height,
            )
        } else {
            isIosBezelError = true
        }
    }

    if (addIOSBezelCorners && !isSupported) {
        isIosBezelError = true
    }

    if (isIosBezelError) {
        console.log(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
WARNING:
We could not find the bezel corners for the device '${deviceName}'.
The normalized device name is '${normalizedDeviceName}'
and couldn't be found in the supported devices:
${supportedIosBezelDevices.join(', ')}
#####################################################################################
`,
        )
    }
}

/**
 * Crop the image and convert it to a base64 image
 */
async function cropAndConvertToDataURL({
    addIOSBezelCorners,
    base64Image,
    deviceName,
    devicePixelRatio,
    height,
    isIOS,
    isLandscape,
    sourceX,
    sourceY,
    width,
}: CropAndConvertToDataURL): Promise<string> {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const image = await loadImage(`data:image/png;base64,${base64Image}`)
    ctx.drawImage(image, sourceX, sourceY, width, height, 0, 0, width, height)

    if (isIOS){
        await handleIOSBezelCorners({ addIOSBezelCorners, ctx, deviceName, devicePixelRatio, height, isLandscape, width })
    }

    return canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
}

/**
 * Make a cropped image with Canvas
 */
export async function makeCroppedBase64Image({
    addIOSBezelCorners,
    base64Image,
    deviceName,
    devicePixelRatio,
    isIOS,
    isLandscape,
    logLevel,
    rectangles,
    resizeDimensions = DEFAULT_RESIZE_DIMENSIONS,
}: CroppedBase64Image): Promise<string> {
    // Rotate the image if needed and get the screenshot size
    const newBase64Image = await getRotatedImageIfNeeded({ isLandscape, base64Image })
    const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(base64Image)

    // Determine/Get the size of the cropped screenshot and cut out dimensions
    const { top, right, bottom, left } = { ...DEFAULT_RESIZE_DIMENSIONS, ...resizeDimensions }
    const { height, width, x, y } = rectangles
    const [sourceXStart, sourceXEnd] = getAdjustedAxis({
        length: width,
        logLevel,
        maxDimension: screenshotWidth,
        paddingEnd: right,
        paddingStart: left,
        start: x,
        warningType: 'WIDTH'
    })
    const [sourceYStart, sourceYEnd] = getAdjustedAxis({
        length: height,
        logLevel,
        maxDimension: screenshotHeight,
        paddingEnd: bottom,
        paddingStart: top,
        start: y,
        warningType: 'HEIGHT',
    })

    // Create the canvas and draw the image on it
    return cropAndConvertToDataURL({
        addIOSBezelCorners,
        base64Image: newBase64Image,
        deviceName,
        devicePixelRatio,
        height: sourceYEnd - sourceYStart,
        isIOS,
        isLandscape,
        sourceX: sourceXStart,
        sourceY: sourceYStart,
        width: sourceXEnd - sourceXStart,
    }
    )
}

/**
 * Execute the image compare
 */
export async function executeImageCompare(
    executor: Executor,
    options: ImageCompareOptions,
    isViewPortScreenshot = false,
    isNativeContext = false,
): Promise<ImageCompareResult | number> {
    // 1. Set some variables
    const {
        ignoreRegions = [],
        devicePixelRatio,
        fileName,
        isAndroidNativeWebScreenshot,
        isAndroid,
        isHybridApp,
        isLandscape,
        logLevel,
        platformName,
    } = options
    const { actualFolder, autoSaveBaseline, baselineFolder, browserName, deviceName, diffFolder, isMobile, savePerInstance } =
        options.folderOptions
    let diffFilePath
    const imageCompareOptions = { ...options.compareOptions.wic, ...options.compareOptions.method }

    // 2. Create all needed folders
    const createFolderOptions = { browserName, deviceName, isMobile, savePerInstance }
    const actualFolderPath = getAndCreatePath(actualFolder, createFolderOptions)
    const baselineFolderPath = getAndCreatePath(baselineFolder, createFolderOptions)
    const actualFilePath = join(actualFolderPath, fileName)
    const baselineFilePath = join(baselineFolderPath, fileName)

    // 3. Check if there is a baseline image, and determine if it needs to be auto saved or not
    await checkBaselineImageExists(actualFilePath, baselineFilePath, autoSaveBaseline, logLevel)

    // 4. Prepare the compare
    // 4a.Determine the ignore options
    const resembleIgnoreDefaults = ['alpha', 'antialiasing', 'colors', 'less', 'nothing']
    const ignore = resembleIgnoreDefaults.filter((option) =>
        Object.keys(imageCompareOptions).find(
            (key: keyof typeof imageCompareOptions) => key.toLowerCase().includes(option) && imageCompareOptions[key],
        ),
    ) as ComparisonIgnoreOption[]

    // 4b. Determine the ignore rectangles for the block outs
    const blockOut = 'blockOut' in imageCompareOptions ? imageCompareOptions.blockOut || [] : []
    const webStatusAddressToolBarOptions = []
    if (!isNativeContext){
        const statusAddressToolBarOptions = {
            blockOutSideBar: imageCompareOptions.blockOutSideBar,
            blockOutStatusBar: imageCompareOptions.blockOutStatusBar,
            blockOutToolBar: imageCompareOptions.blockOutToolBar,
            isHybridApp,
            isLandscape,
            isMobile,
            isViewPortScreenshot,
            isAndroidNativeWebScreenshot,
            platformName,
        }
        webStatusAddressToolBarOptions.push(...(await determineStatusAddressToolBarRectangles(executor, statusAddressToolBarOptions)) || [])
    }
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
            // 4d. Make sure all the rectangles are equal to the dpr for the screenshot
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

    const compareOptions: ComparisonOptions = {
        ignore,
        ...(ignoredBoxes.length > 0 ? { output: { ignoredBoxes } } : {}),
        scaleToSameSize: imageCompareOptions.scaleImagesToSameSize,
    }

    // 5. Execute the compare and retrieve the data
    const data: CompareData = await compareImages(readFileSync(baselineFilePath), readFileSync(actualFilePath), compareOptions)
    const rawMisMatchPercentage = data.rawMisMatchPercentage
    const reportMisMatchPercentage = imageCompareOptions.rawMisMatchPercentage
        ? rawMisMatchPercentage
        : Number(data.rawMisMatchPercentage.toFixed(3))

    // 6. Save the diff when there is a diff or when debug mode is on
    if (rawMisMatchPercentage > imageCompareOptions.saveAboveTolerance || logLevel === LogLevel.debug) {
        const isDifference = rawMisMatchPercentage > imageCompareOptions.saveAboveTolerance
        const isDifferenceMessage = 'WARNING:\n There was a difference. Saved the difference to'
        const debugMessage = 'INFO:\n Debug mode is enabled. Saved the debug file to:'
        const diffFolderPath = getAndCreatePath(diffFolder, createFolderOptions)
        diffFilePath = join(diffFolderPath, fileName)

        await saveBase64Image(await addBlockOuts(Buffer.from(data.getBuffer()).toString('base64'), ignoredBoxes), diffFilePath)

        if (logLevel === LogLevel.debug || logLevel === LogLevel.warn) {
            console.log(
                '\x1b[33m%s\x1b[0m',
                `
#####################################################################################
 ${isDifference ? isDifferenceMessage : debugMessage}
 ${diffFilePath}
#####################################################################################
`,
            )
        }
    }

    // 7. Return the comparison data
    return imageCompareOptions.returnAllCompareData
        ? {
            fileName,
            folders: {
                actual: actualFilePath,
                baseline: baselineFilePath,
                ...(diffFilePath ? { diff: diffFilePath } : {}),
            },
            misMatchPercentage: reportMisMatchPercentage,
        }
        : reportMisMatchPercentage
}

/**
 * Make a full page image with Canvas
 */
export async function makeFullPageBase64Image(
    screenshotsData: FullPageScreenshotsData,
    { devicePixelRatio, isLandscape }: { devicePixelRatio: number; isLandscape: boolean },
): Promise<string> {
    const amountOfScreenshots = screenshotsData.data.length
    const { fullPageHeight: canvasHeight, fullPageWidth: canvasWidth } = screenshotsData
    const canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = canvas.getContext('2d')

    // Load all the images
    for (let i = 0; i < amountOfScreenshots; i++) {
        const currentScreenshot = screenshotsData.data[i].screenshot
        // Determine if the image is rotated
        const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(currentScreenshot, devicePixelRatio)
        const isRotated = isLandscape && screenshotHeight > screenshotWidth
        // If so we need to rotate is -90 degrees
        const newBase64Image = isRotated
            ? await rotateBase64Image({
                base64Image: currentScreenshot,
                degrees: -90,
                newHeight: screenshotWidth,
                newWidth: screenshotHeight,
            })
            : currentScreenshot
        const { canvasYPosition, imageHeight, imageWidth, imageXPosition, imageYPosition } = screenshotsData.data[i]
        const image = await loadImage(`data:image/png;base64,${newBase64Image}`)

        ctx.drawImage(
            image,
            // Start at x/y pixels from the left and the top of the image (crop)
            imageXPosition,
            imageYPosition,
            // 'Get' a (w * h) area from the source image (crop)
            imageWidth,
            imageHeight,
            // Place the result at 0, 0 in the canvas,
            0,
            canvasYPosition,
            // With as width / height: 100 * 100 (scale)
            imageWidth,
            imageHeight,
        )
    }

    return canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
}

/**
 * Save the base64 image to a file
 */
export async function saveBase64Image(base64Image: string, filePath: string): Promise<void> {
    return outputFile(filePath, base64Image, 'base64')
}

/**
 * Create a canvas with the ignore boxes if they are present
 */
export async function addBlockOuts(screenshot: string, ignoredBoxes: IgnoreBoxes[]): Promise<string> {
    // Create canvas and load image
    const { height, width } = getScreenshotSize(screenshot)
    const canvas = createCanvas(width, height)
    const image = await loadImage(`data:image/png;base64,${screenshot}`)
    const canvasContext = canvas.getContext('2d')

    // Draw the image on canvas
    canvasContext.drawImage(
        image,
        // Start at x/y pixels from the left and the top of the image (crop)
        0,
        0,
        // 'Get' a (w * h) area from the source image (crop)
        width,
        height,
        // Place the result at 0, 0 in the canvas,
        0,
        0,
        // With as width / height: 100 * 100 (scale)
        width,
        height,
    )

    // Loop over all ignored areas and add them to the current canvas
    ignoredBoxes.forEach((ignoredBox) => {
        const { right: ignoredBoxWidth, bottom: ignoredBoxHeight, left: x, top: y } = ignoredBox
        const ignoreCanvas = createCanvas(ignoredBoxWidth - x, ignoredBoxHeight - y)
        const ignoreContext = ignoreCanvas.getContext('2d')

        // Add a background color to the ignored box
        ignoreContext.globalAlpha = 0.5
        ignoreContext.fillStyle = '#39aa56'
        ignoreContext.fillRect(0, 0, ignoredBoxWidth - x, ignoredBoxHeight - y)

        // add to canvasContext
        canvasContext.drawImage(ignoreCanvas, x, y)
    })

    // Return the screenshot
    return canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
}

/**
 * Rotate a base64 image
 * Tnx to https://gist.github.com/Zyndoras/6897abdf53adbedf02564808aaab94db
 */
async function rotateBase64Image({ base64Image, degrees, newHeight, newWidth }: RotateBase64ImageOptions): Promise<string> {
    const canvas = createCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')
    const image = await loadImage(`data:image/png;base64,${base64Image}`)

    canvas.width = degrees % 180 === 0 ? image.width : image.height
    canvas.height = degrees % 180 === 0 ? image.height : image.width

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((degrees * Math.PI) / 180)
    ctx.drawImage(image, image.width / -2, image.height / -2)

    return canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
}

/**
 * Take a based64 screenshot of an element and resize it
 */
async function takeResizedBase64Screenshot({
    element,
    devicePixelRatio,
    isIOS,
    methods:{
        getElementRect,
        screenShot,
    },
    resizeDimensions,
}:{
    element: WicElement,
    devicePixelRatio: number,
    isIOS: boolean,
    methods:{
        getElementRect: GetElementRect,
        screenShot: TakeScreenShot,
    }
    resizeDimensions: ResizeDimensions,
}
): Promise<string> {
    const awaitedElement = await element
    if (!isWdioElement(awaitedElement)){
        console.log('awaitedElement = ', JSON.stringify(awaitedElement))
    }

    // Get the element position
    const elementRegion = await getElementRect(awaitedElement.elementId)

    // Create a screenshot
    const base64Image = await screenShot()
    // Crop it out with the correct dimensions

    // Make the image smaller
    // Provide the size of the image with the resizeDimensions on left, right, top and bottom
    const resizedBase64Image = await makeCroppedBase64Image({
        addIOSBezelCorners: false,
        base64Image,
        deviceName: '',
        devicePixelRatio,
        isIOS,
        isLandscape: false,
        // @TODO:we need to fix this debug statement
        // @ts-ignore
        logLevel: 'debug',
        rectangles: calculateDprData({
            height: elementRegion.height,
            width: elementRegion.width,
            x: elementRegion.x,
            y: elementRegion.y,
        }, isIOS ? devicePixelRatio : 1),
        // The assumption is that a user calculated the resizeDimensions from a screenshot which is with the devicePixelRatio
        resizeDimensions: calculateDprData(resizeDimensions, 1/devicePixelRatio),
    })

    return resizedBase64Image
}

/**
 * Take a base64 screenshot of an element
 */
export async function takeBase64ElementScreenshot({
    element,
    devicePixelRatio,
    isIOS,
    methods:{
        getElementRect,
        screenShot,
    },
    resizeDimensions,
}:{
    element: WicElement,
    devicePixelRatio: number,
    isIOS: boolean,
    methods:{
        getElementRect: GetElementRect,
        screenShot: TakeScreenShot,
    }
    resizeDimensions: ResizeDimensions,
}): Promise<string> {
    const shouldTakeResizedScreenshot = resizeDimensions !== DEFAULT_RESIZE_DIMENSIONS

    if (!shouldTakeResizedScreenshot) {
        try {
            const awaitedElement = await element
            if (!isWdioElement(awaitedElement)) {
                console.error(' takeBase64ElementScreenshot element is not a valid element because of ', JSON.stringify(awaitedElement))
            }
            return await awaitedElement.takeElementScreenshot(awaitedElement.elementId)
        } catch (error) {
            console.error('Error taking an element screenshot with the default `element.takeElementScreenshot(elementId)` method:', error, ' We will retry with a resized screenshot')
        }
    }

    return await takeResizedBase64Screenshot({
        element,
        devicePixelRatio,
        isIOS,
        methods: {
            getElementRect,
            screenShot,
        },
        resizeDimensions,
    })
}
