import { fileURLToPath } from 'node:url'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { promises as fsPromises, constants } from 'node:fs'
import { dirname, join } from 'node:path'
// @ts-ignore
import Jimp from 'jimp'
import logger from '@wdio/logger'
import compareImages from '../resemble/compareImages.js'
import { calculateDprData, getAndCreatePath, getIosBezelImageNames, getScreenshotSize, updateVisualBaseline } from '../helpers/utils.js'
import { DEFAULT_RESIZE_DIMENSIONS, supportedIosBezelDevices } from '../helpers/constants.js'
import { determineStatusAddressToolBarRectangles, isWdioElement } from './rectangles.js'
import type {
    AdjustedAxis,
    BoundingBox,
    CheckBaselineImageExists,
    CropAndConvertToDataURL,
    CroppedBase64Image,
    DimensionsWarning,
    ExecuteImageCompare,
    HandleIOSBezelCorners,
    IgnoreBoxes,
    ImageCompareResult,
    ResizeDimensions,
    RotateBase64ImageOptions,
    RotatedImage,
} from './images.interfaces.js'
import type { FullPageScreenshotsData } from './screenshots.interfaces.js'
import type { GetElementRect, TakeScreenShot } from './methods.interfaces.js'
import type { CompareData, ComparisonIgnoreOption, ComparisonOptions } from '../resemble/compare.interfaces.js'
import type { WicElement } from '../commands/element.interfaces.js'
import { processDiffPixels } from './processDiffPixels.js'
import { createCompareReport } from './createCompareReport.js'

const log = logger('@wdio/visual-service:webdriver-image-comparison:images')

/**
 * Check if the image exists and create a new baseline image if needed
 */
export async function checkBaselineImageExists(
    { actualFilePath, baselineFilePath, autoSaveBaseline = false, updateBaseline = false }: CheckBaselineImageExists
): Promise<void> {
    try {
        if (updateBaseline) {
            throw new Error()
        }

        await fsPromises.access(baselineFilePath, constants.R_OK | constants.W_OK)
    } catch {
        if (autoSaveBaseline || updateBaseline) {
            try {
                const autoSaveMessage = 'Autosaved the'
                const updateBaselineMessage = 'Updated the actual'
                const data = readFileSync(actualFilePath)
                writeFileSync(baselineFilePath, data)
                log.info(
                    '\x1b[33m%s\x1b[0m',
                    `
#####################################################################################
 INFO:
 ${autoSaveBaseline ? autoSaveMessage : updateBaselineMessage} image to
 ${baselineFilePath}
#####################################################################################`,
                )
            } catch (error) {
                throw new Error(
                    `
#####################################################################################
 Image could not be copied. The following error was thrown:
 ${error}
#####################################################################################`,
                )
            }
        } else {
            throw new Error(
                `
#####################################################################################
 Baseline image not found, save the actual image manually to the baseline.
 The image can be found here:
 ${actualFilePath}
#####################################################################################`,
            )
        }
    }
}

/**
 * Get the rotated image if needed
 */
async function getRotatedImageIfNeeded({ isWebDriverElementScreenshot, isLandscape, base64Image }: RotatedImage): Promise<string> {
    const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(base64Image)
    const isRotated = !isWebDriverElementScreenshot && isLandscape && screenshotHeight > screenshotWidth

    return isRotated ? await rotateBase64Image({ base64Image, degrees: 90 }) : base64Image
}

/**
 * Log a warning when the crop goes out of the screen
 */
function logDimensionWarning({
    dimension,
    maxDimension,
    position,
    type,
}: DimensionsWarning): void {
    log.warn(
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

/**
 * Get the adjusted axis
 */
function getAdjustedAxis({
    length,
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
            maxDimension,
            position: adjustedStart,
            type: warningType === 'WIDTH' ? 'LEFT' : 'TOP',
        })
        adjustedStart = 0
    }
    if (adjustedEnd > maxDimension) {
        logDimensionWarning({
            dimension: paddingEnd,
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
    image,
    deviceName,
    devicePixelRatio,
    height,
    isLandscape,
    width,
}: HandleIOSBezelCorners) {
    const normalizedDeviceName = deviceName.toLowerCase()
        .replace(/([^A-Za-z0-9]|simulator|inch|(\d(st|nd|rd|th)) generation)/gi, '')
    const isSupported = (normalizedDeviceName.includes('iphone') && supportedIosBezelDevices.includes(normalizedDeviceName)) ||
        (normalizedDeviceName.includes('ipad') &&
        supportedIosBezelDevices.includes(normalizedDeviceName) &&
        (width / devicePixelRatio >= 1133 || height / devicePixelRatio >= 1133))
    let isIosBezelError = false

    if (addIOSBezelCorners && isSupported) {
        const { topImageName, bottomImageName } = getIosBezelImageNames(normalizedDeviceName)

        if (topImageName && bottomImageName) {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = dirname(__filename)
            const topImage = readFileSync(join(__dirname, '..', '..', 'assets', 'ios', `${topImageName}.png`), { encoding: 'base64' })
            const bottomImage = readFileSync(join(__dirname, '..', '..', 'assets', 'ios', `${bottomImageName}.png`), { encoding: 'base64' })

            const topBase64Image = isLandscape ? await rotateBase64Image({ base64Image: topImage, degrees: 90 }) : topImage
            const bottomBase64Image = isLandscape ? await rotateBase64Image({ base64Image: bottomImage, degrees: 90 }) : bottomImage

            image.composite(await Jimp.read(Buffer.from(topBase64Image, 'base64')), 0, 0)
            image.composite(await Jimp.read(Buffer.from(bottomBase64Image, 'base64')),
                isLandscape ? width - getScreenshotSize(bottomImage).height : 0,
                isLandscape ? 0 : height - getScreenshotSize(bottomImage).height
            )
        } else {
            isIosBezelError = true
        }
    }

    if (addIOSBezelCorners && !isSupported) {
        isIosBezelError = true
    }

    if (isIosBezelError) {
        log.warn(
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
    const image = await Jimp.read(Buffer.from(base64Image, 'base64'))
    const croppedImage = image.crop(sourceX, sourceY, width, height)

    if (isIOS) {
        await handleIOSBezelCorners({ addIOSBezelCorners, image: croppedImage, deviceName, devicePixelRatio, height, isLandscape, width })
    }

    const base64CroppedImage = await croppedImage.getBase64Async(Jimp.MIME_PNG)
    return base64CroppedImage.replace(/^data:image\/png;base64,/, '')
}

/**
 * Make a cropped image with Canvas
 */
export async function makeCroppedBase64Image({
    addIOSBezelCorners,
    base64Image,
    deviceName,
    devicePixelRatio,
    isWebDriverElementScreenshot = false,
    isIOS,
    isLandscape,
    rectangles,
    resizeDimensions = DEFAULT_RESIZE_DIMENSIONS,
}: CroppedBase64Image): Promise<string> {
    // Rotate the image if needed and get the screenshot size
    const newBase64Image = await getRotatedImageIfNeeded({ isWebDriverElementScreenshot, isLandscape, base64Image })
    const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(base64Image)

    // Determine/Get the size of the cropped screenshot and cut out dimensions
    const { top, right, bottom, left } = { ...DEFAULT_RESIZE_DIMENSIONS, ...resizeDimensions }
    const { height, width, x, y } = rectangles
    const [sourceXStart, sourceXEnd] = getAdjustedAxis({
        length: width,
        maxDimension: screenshotWidth,
        paddingEnd: right,
        paddingStart: left,
        start: x,
        warningType: 'WIDTH'
    })
    const [sourceYStart, sourceYEnd] = getAdjustedAxis({
        length: height,
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
    {
        executor,
        isViewPortScreenshot,
        isNativeContext,
        options,
        testContext,
    }: ExecuteImageCompare
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
        platformName,
    } = options
    const { actualFolder, autoSaveBaseline, baselineFolder, browserName, deviceName, diffFolder, isMobile, savePerInstance } =
        options.folderOptions
    const imageCompareOptions = { ...options.compareOptions.wic, ...options.compareOptions.method }

    // 2. Create all needed folders
    const createFolderOptions = { browserName, deviceName, isMobile, savePerInstance }
    const actualFolderPath = getAndCreatePath(actualFolder, createFolderOptions)
    const baselineFolderPath = getAndCreatePath(baselineFolder, createFolderOptions)
    const actualFilePath = join(actualFolderPath, fileName)
    const baselineFilePath = join(baselineFolderPath, fileName)
    const diffFolderPath = getAndCreatePath(diffFolder, createFolderOptions)
    const diffFilePath = join(diffFolderPath, fileName)

    // 3. Check if there is a baseline image, and determine if it needs to be auto saved or not
    await checkBaselineImageExists({ actualFilePath, baselineFilePath, autoSaveBaseline })

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

    if (isMobile && !isNativeContext){
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
    let rawMisMatchPercentage = data.rawMisMatchPercentage
    let reportMisMatchPercentage = imageCompareOptions.rawMisMatchPercentage
        ? rawMisMatchPercentage
        : Number(data.rawMisMatchPercentage.toFixed(3))
    const diffBoundingBoxes:BoundingBox[] = []

    // 6. Save the diff when there is a diff
    const storeDiffs = rawMisMatchPercentage > imageCompareOptions.saveAboveTolerance || process.argv.includes('--store-diffs')
    if (storeDiffs) {
        const isDifference = rawMisMatchPercentage > imageCompareOptions.saveAboveTolerance
        const isDifferenceMessage = 'WARNING:\n There was a difference. Saved the difference to'
        const debugMessage = 'INFO:\n Debug mode is enabled. Saved the debug file to:'

        if (imageCompareOptions.createJsonReportFiles) {
            diffBoundingBoxes.push(...processDiffPixels(data.diffPixels, imageCompareOptions.diffPixelBoundingBoxProximity))
        }

        await saveBase64Image(await addBlockOuts(Buffer.from(await data.getBuffer()).toString('base64'), ignoredBoxes), diffFilePath)

        log.warn(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 ${isDifference ? isDifferenceMessage : debugMessage}
 ${diffFilePath}
#####################################################################################`,
        )
    }

    if (imageCompareOptions.createJsonReportFiles) {
        createCompareReport({
            boundingBoxes: {
                diffBoundingBoxes,
                ignoredBoxes,
            },
            data,
            fileName,
            folders: {
                actualFolderPath,
                baselineFolderPath,
                ...(storeDiffs && { diffFolderPath: diffFolderPath }),
            },
            size: {
                actual: getScreenshotSize(readFileSync(actualFilePath).toString('base64'), devicePixelRatio),
                baseline: getScreenshotSize(readFileSync(baselineFilePath).toString('base64'), devicePixelRatio),
                ...(storeDiffs && { diff: getScreenshotSize(readFileSync(diffFilePath).toString('base64'), devicePixelRatio) }),
            },
            testContext,
        })
    }

    if (updateVisualBaseline()) {
        await checkBaselineImageExists({ actualFilePath, baselineFilePath, updateBaseline: true })
        reportMisMatchPercentage = 0
        rawMisMatchPercentage = 0
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
    const canvas = await new Jimp(canvasWidth, canvasHeight)

    // Load all the images
    for (let i = 0; i < amountOfScreenshots; i++) {
        const currentScreenshot = screenshotsData.data[i].screenshot
        const { height: screenshotHeight, width: screenshotWidth } = getScreenshotSize(currentScreenshot, devicePixelRatio)
        const isRotated = isLandscape && screenshotHeight > screenshotWidth
        const newBase64Image = isRotated ? await rotateBase64Image({ base64Image: currentScreenshot, degrees: 90 }) : currentScreenshot
        const { canvasYPosition, imageHeight, imageWidth, imageXPosition, imageYPosition } = screenshotsData.data[i]
        const image = await Jimp.read(Buffer.from(newBase64Image, 'base64'))

        canvas.composite(
            image.crop(imageXPosition, imageYPosition, imageWidth, imageHeight),
            0,
            canvasYPosition
        )
    }

    const base64FullPageImage = await canvas.getBase64Async(Jimp.MIME_PNG)
    return base64FullPageImage.replace(/^data:image\/png;base64,/, '')
}

/**
 * Save the base64 image to a file
 */
export async function saveBase64Image(base64Image: string, filePath: string): Promise<void> {
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, Buffer.from(base64Image, 'base64'))
}

/**
 * Create a canvas with the ignore boxes if they are present
 */
export async function addBlockOuts(screenshot: string, ignoredBoxes: IgnoreBoxes[]): Promise<string> {
    const image = await Jimp.read(Buffer.from(screenshot, 'base64'))

    // Loop over all ignored areas and add them to the current canvas
    for (const ignoredBox of ignoredBoxes) {
        const { right: ignoredBoxWidth, bottom: ignoredBoxHeight, left: x, top: y } = ignoredBox
        const ignoreCanvas = new Jimp(ignoredBoxWidth - x, ignoredBoxHeight - y, '#39aa56')
        ignoreCanvas.opacity(0.5)

        image.composite(ignoreCanvas, x, y)
    }

    const base64ImageWithBlockOuts = await image.getBase64Async(Jimp.MIME_PNG)
    return base64ImageWithBlockOuts.replace(/^data:image\/png;base64,/, '')
}

/**
 * Rotate a base64 image
 * Tnx to https://gist.github.com/Zyndoras/6897abdf53adbedf02564808aaab94db
 */
async function rotateBase64Image({ base64Image, degrees }: RotateBase64ImageOptions): Promise<string> {
    const image = await Jimp.read(Buffer.from(base64Image, 'base64'))
    const rotatedImage = image.rotate(degrees)
    const base64RotatedImage = await rotatedImage.getBase64Async(Jimp.MIME_PNG)

    return base64RotatedImage.replace(/^data:image\/png;base64,/, '')
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
        log.info('awaitedElement = ', JSON.stringify(awaitedElement))
    }

    // Get the element position
    const elementRegion = await getElementRect(awaitedElement.elementId as string)

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
            return await awaitedElement.takeElementScreenshot(awaitedElement.elementId as string)
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

