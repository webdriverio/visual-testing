import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, promises as fsPromises, constants } from 'node:fs'
import { dirname, join } from 'node:path'
import { Jimp, JimpMime } from 'jimp'
import logger from '@wdio/logger'
import compareImages from '../resemble/compareImages.js'
import { calculateDprData, getIosBezelImageNames, getBase64ScreenshotSize, prepareComparisonFilePaths, updateVisualBaseline } from '../helpers/utils.js'
import { prepareIgnoreOptions } from '../helpers/options.js'
import { DEFAULT_RESIZE_DIMENSIONS, supportedIosBezelDevices } from '../helpers/constants.js'
import { isWdioElement, prepareIgnoreRectangles } from './rectangles.js'
import type {
    AdjustedAxis,
    CheckBaselineImageExists,
    CropAndConvertToDataURL,
    CroppedBase64Image,
    DimensionsWarning,
    ExecuteImageCompare,
    HandleIOSBezelCorners,
    ImageCompareResult,
    MakeFullPageBase64ImageOptions,
    RotateBase64ImageOptions,
    RotatedImage,
    TakeBase64ElementScreenshotOptions,
    TakeResizedBase64ScreenshotOptions,
} from './images.interfaces.js'
import type { IgnoreBoxes } from './rectangles.interfaces.js'
import type { FullPageScreenshotsData } from './screenshots.interfaces.js'
import type { CompareData, ComparisonOptions } from '../resemble/compare.interfaces.js'
import { generateAndSaveDiff } from './processDiffPixels.js'
import { createJsonReportIfNeeded } from './createCompareReport.js'
import { takeBase64Screenshot } from './screenshots.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:images')

/**
 * Check if an image exists and return a boolean
 */
export async function checkIfImageExists(filePath: string): Promise<boolean> {
    try {
        await fsPromises.access(filePath, constants.R_OK)
        return true
    } catch {
        return false
    }
}

/**
 * Remove the diff image if it exists
 */
export async function removeDiffImageIfExists(diffFilePath: string): Promise<void> {
    if (await checkIfImageExists(diffFilePath)) {
        try {
            await fsPromises.unlink(diffFilePath)
            log.info(`Successfully removed the diff image before comparing at ${diffFilePath}`)
        } catch (error) {
            throw new Error(
                `Could not remove the diff image. The following error was thrown: ${error}`,
            )
        }
    }
}

/**
 * Check if the image exists and create a new baseline image if needed
 */
export async function checkBaselineImageExists({
    actualFilePath,
    baselineFilePath,
    autoSaveBaseline = false,
    updateBaseline = false,
    actualBase64Image,
}: CheckBaselineImageExists): Promise<void> {
    try {
        if (updateBaseline || !(await checkIfImageExists(baselineFilePath))) {
            throw new Error()
        }
    } catch {
        if (autoSaveBaseline || updateBaseline) {
            try {
                const autoSaveMessage = 'Autosaved the'
                const updateBaselineMessage = 'Updated the actual'
                // Use base64 image if provided, otherwise read from file
                const data = actualBase64Image
                    ? Buffer.from(actualBase64Image, 'base64')
                    : readFileSync(actualFilePath)
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
            // Check if actual file exists before referencing it in error message
            const actualFileExists = await checkIfImageExists(actualFilePath)
            const filePathMessage = actualFileExists
                ? `The image can be found here:\n${actualFilePath}`
                : 'The actual image was not saved to disk (alwaysSaveActualImage is false).\nIf you need the actual image to create a baseline, please set alwaysSaveActualImage to true.'
            throw new Error(
                `
#####################################################################################
Baseline image not found, save the actual image manually to the baseline.
${filePathMessage}
#####################################################################################`,
            )
        }
    }
}
/**
 * Get the rotated image if needed
 */
export async function getRotatedImageIfNeeded({ isWebDriverElementScreenshot, isLandscape, base64Image }: RotatedImage): Promise<string> {
    const { height: screenshotHeight, width: screenshotWidth } = getBase64ScreenshotSize(base64Image)
    const isRotated = !isWebDriverElementScreenshot && isLandscape && screenshotHeight > screenshotWidth

    return isRotated ? await rotateBase64Image({ base64Image, degrees: 90 }) : base64Image
}

/**
 * Log a warning when the crop goes out of the screen
 */
export function logDimensionWarning({
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
export function getAdjustedAxis({
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
export async function handleIOSBezelCorners({
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
                isLandscape ? width - getBase64ScreenshotSize(bottomImage).height : 0,
                isLandscape ? 0 : height - getBase64ScreenshotSize(bottomImage).height
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
export async function cropAndConvertToDataURL({
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
    const croppedImage = image.crop({ x:sourceX, y:sourceY, w:width, h:height })

    if (isIOS) {
        await handleIOSBezelCorners({ addIOSBezelCorners, image: croppedImage, deviceName, devicePixelRatio, height, isLandscape, width })
    }

    const base64CroppedImage = await croppedImage.getBase64(JimpMime.png)
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
    const { height: screenshotHeight, width: screenshotWidth } = getBase64ScreenshotSize(base64Image)

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
    } as CropAndConvertToDataURL)
}

/**
 * Execute the image compare
 */
export async function executeImageCompare(
    {
        isViewPortScreenshot,
        isNativeContext,
        options,
        testContext,
        actualBase64Image,
    }: ExecuteImageCompare
): Promise<ImageCompareResult | number> {
    // 1. Set some variables
    const {
        devicePixelRatio,
        deviceRectangles,
        ignoreRegions = [],
        isAndroidNativeWebScreenshot,
        isAndroid,
        fileName,
    } = options
    const { actualFolder, autoSaveBaseline, alwaysSaveActualImage, baselineFolder, browserName, deviceName, diffFolder, isMobile, savePerInstance } =
        options.folderOptions
    const imageCompareOptions = { ...options.compareOptions.wic, ...options.compareOptions.method }

    // 1a. Disable JSON reports if alwaysSaveActualImage is false (JSON reports need the actual file to exist)
    if (!alwaysSaveActualImage && imageCompareOptions.createJsonReportFiles) {
        log.warn(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 WARNING:
 JSON report files require the actual image to be saved to disk.
 Since alwaysSaveActualImage is false, createJsonReportFiles has been disabled.
#####################################################################################`,
        )
        imageCompareOptions.createJsonReportFiles = false
    }

    // 2. Create all needed folders and file paths
    const filePaths = prepareComparisonFilePaths({
        actualFolder,
        baselineFolder,
        diffFolder,
        browserName,
        deviceName,
        isMobile,
        savePerInstance,
        fileName
    })
    const { actualFilePath, baselineFilePath, diffFilePath } = filePaths

    // 2a. If we have a base64 image and alwaysSaveActualImage is false, use it directly
    const useBase64Image = !alwaysSaveActualImage && actualBase64Image !== undefined
    let actualImageBuffer: Buffer

    if (useBase64Image) {
        // Convert base64 to buffer for comparison
        actualImageBuffer = Buffer.from(actualBase64Image, 'base64')
        // Only save actual image if baseline doesn't exist and autoSaveBaseline is true
        if (autoSaveBaseline && !(await checkIfImageExists(baselineFilePath))) {
            await saveBase64Image(actualBase64Image, actualFilePath)
        }
    } else {
        // Read from file as before
        actualImageBuffer = readFileSync(actualFilePath)
    }

    // 3a. Check if there is a baseline image, and determine if it needs to be auto saved or not
    await checkBaselineImageExists({
        actualFilePath,
        baselineFilePath,
        autoSaveBaseline,
        actualBase64Image: useBase64Image ? actualBase64Image : undefined,
    })

    // 3b. At this point we shouldn't have a diff image, so check if there is a diff image and remove it if it exists
    await removeDiffImageIfExists(diffFilePath)

    // 4. Prepare the compare
    // 4a.Determine the ignore options
    const ignore = prepareIgnoreOptions(imageCompareOptions)

    // 4b. Determine the ignore rectangles for the block outs
    const { ignoredBoxes } = await prepareIgnoreRectangles({
        blockOut: imageCompareOptions.blockOut ?? [],
        ignoreRegions,
        deviceRectangles,
        devicePixelRatio,
        isMobile,
        isNativeContext,
        isAndroid,
        isAndroidNativeWebScreenshot,
        isViewPortScreenshot,
        imageCompareOptions: {
            blockOutSideBar: imageCompareOptions.blockOutSideBar,
            blockOutStatusBar: imageCompareOptions.blockOutStatusBar,
            blockOutToolBar: imageCompareOptions.blockOutToolBar,
        },
        actualFilePath: isViewPortScreenshot ? undefined : actualFilePath,
    })

    const compareOptions: ComparisonOptions = {
        ignore,
        ...(ignoredBoxes.length > 0 ? { output: { ignoredBoxes } } : {}),
        scaleToSameSize: imageCompareOptions.scaleImagesToSameSize,
    }

    // 5. Execute the compare and retrieve the data
    const data: CompareData = await compareImages(readFileSync(baselineFilePath), actualImageBuffer, compareOptions)
    const rawMisMatchPercentage = data.rawMisMatchPercentage
    const reportMisMatchPercentage = imageCompareOptions.rawMisMatchPercentage
        ? rawMisMatchPercentage
        : Number(data.rawMisMatchPercentage.toFixed(3))

    // 6. Generate and save the diff when there is a diff
    const { diffBoundingBoxes, storeDiffs } = await generateAndSaveDiff(
        data,
        imageCompareOptions,
        ignoredBoxes,
        diffFilePath,
        rawMisMatchPercentage
    )

    // 6a. Save actual image on failure if alwaysSaveActualImage is false
    const saveAboveTolerance = imageCompareOptions.saveAboveTolerance ?? 0
    const hasFailure = rawMisMatchPercentage > 0 || rawMisMatchPercentage > saveAboveTolerance
    if (useBase64Image && hasFailure && actualBase64Image) {
        // Save the actual image only when comparison fails
        await saveBase64Image(actualBase64Image, actualFilePath)
    }

    // 7. Create JSON report if requested
    await createJsonReportIfNeeded({
        boundingBoxes: {
            diffBoundingBoxes,
            ignoredBoxes,
        },
        data,
        fileName,
        filePaths,
        devicePixelRatio,
        imageCompareOptions,
        testContext,
        storeDiffs,
    })

    // 8. Handle visual baseline update
    let finalReportMisMatchPercentage = reportMisMatchPercentage
    if (updateVisualBaseline()) {
        await checkBaselineImageExists({
            actualFilePath,
            baselineFilePath,
            updateBaseline: true,
            actualBase64Image: useBase64Image ? actualBase64Image : undefined,
        })
        finalReportMisMatchPercentage = 0
    }

    // 9. Return the comparison data
    return imageCompareOptions.returnAllCompareData
        ? {
            fileName,
            folders: {
                actual: actualFilePath,
                baseline: baselineFilePath,
                ...(diffFilePath ? { diff: diffFilePath } : {}),
            },
            misMatchPercentage: finalReportMisMatchPercentage,
        }
        : finalReportMisMatchPercentage
}

/**
 * Make a full page image with Canvas
 */
export async function makeFullPageBase64Image(
    screenshotsData: FullPageScreenshotsData,
    { devicePixelRatio, isLandscape }: MakeFullPageBase64ImageOptions,
): Promise<string> {
    const amountOfScreenshots = screenshotsData.data.length
    const { fullPageHeight: canvasHeight, fullPageWidth: canvasWidth } = screenshotsData
    const canvas = await new Jimp({ width: canvasWidth, height: canvasHeight })

    // Load all the images
    for (let i = 0; i < amountOfScreenshots; i++) {
        const currentScreenshot = screenshotsData.data[i].screenshot
        const { height: screenshotHeight, width: screenshotWidth } = getBase64ScreenshotSize(currentScreenshot, devicePixelRatio)
        const isRotated = isLandscape && screenshotHeight > screenshotWidth
        const newBase64Image = isRotated ? await rotateBase64Image({ base64Image: currentScreenshot, degrees: 90 }) : currentScreenshot
        const { canvasYPosition, imageHeight, imageXPosition, imageYPosition } = screenshotsData.data[i]
        const image = await Jimp.read(Buffer.from(newBase64Image, 'base64'))

        // Clamp crop dimensions to fit within the actual image bounds
        // This is especially important for the last image where the calculated height might exceed available pixels
        const actualImageWidth = image.bitmap.width
        const actualImageHeight = image.bitmap.height
        const clampedCropX = Math.max(0, Math.min(imageXPosition, actualImageWidth - 1))
        const clampedCropY = Math.max(0, Math.min(imageYPosition, actualImageHeight - 1))
        // Ensure the cropped width matches the canvas width to avoid 1px gaps due to rounding
        // The canvas width is the target, but we must not exceed the available image bounds
        const maxAvailableWidth = actualImageWidth - clampedCropX
        const clampedCropWidth = Math.min(canvasWidth, maxAvailableWidth)
        const clampedCropHeight = Math.min(imageHeight, actualImageHeight - clampedCropY)

        canvas.composite(
            image.crop({ x: clampedCropX, y: clampedCropY, w: clampedCropWidth, h: clampedCropHeight }),
            0,
            canvasYPosition
        )
    }

    const base64FullPageImage = await canvas.getBase64(JimpMime.png)
    return base64FullPageImage.replace(/^data:image\/png;base64,/, '')
}

/**
 * Save the base64 image to a file
 */
export async function saveBase64Image(base64Image: string, filePath: string) {
    await fsPromises.mkdir(dirname(filePath), { recursive: true })
    await fsPromises.writeFile(filePath, Buffer.from(base64Image, 'base64'))
}

/**
 * Create a canvas with the ignore boxes if they are present
 */
export async function addBlockOuts(screenshot: string, ignoredBoxes: IgnoreBoxes[]): Promise<string> {
    const image = await Jimp.read(Buffer.from(screenshot, 'base64'))

    // Loop over all ignored areas and add them to the current canvas
    for (const ignoredBox of ignoredBoxes) {
        const { right: ignoredBoxWidth, bottom: ignoredBoxHeight, left: x, top: y } = ignoredBox
        const ignoreCanvas = new Jimp({ width: ignoredBoxWidth - x, height: ignoredBoxHeight - y, color: '#39aa56' })
        ignoreCanvas.opacity(0.5)

        image.composite(ignoreCanvas, x, y)
    }

    const base64ImageWithBlockOuts = await image.getBase64(JimpMime.png)
    return base64ImageWithBlockOuts.replace(/^data:image\/png;base64,/, '')
}

/**
 * Rotate a base64 image
 * Tnx to https://gist.github.com/Zyndoras/6897abdf53adbedf02564808aaab94db
 */
export async function rotateBase64Image({ base64Image, degrees }: RotateBase64ImageOptions): Promise<string> {
    const image = await Jimp.read(Buffer.from(base64Image, 'base64'))
    const rotatedImage = image.rotate(degrees)
    const base64RotatedImage = await rotatedImage.getBase64(JimpMime.png)

    return base64RotatedImage.replace(/^data:image\/png;base64,/, '')
}

/**
 * Take a based64 screenshot of an element and resize it
 */
export async function takeResizedBase64Screenshot({
    browserInstance,
    element,
    devicePixelRatio,
    isIOS,
    resizeDimensions,
}: TakeResizedBase64ScreenshotOptions): Promise<string> {
    const awaitedElement = await element
    if (!isWdioElement(awaitedElement)){
        log.info('awaitedElement = ', JSON.stringify(awaitedElement))
    }

    // Get the element position
    const elementRegion = await browserInstance.getElementRect(awaitedElement.elementId as string)

    // Create a screenshot
    const base64Image = await takeBase64Screenshot(browserInstance)
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
        resizeDimensions,
    })

    return resizedBase64Image
}

/**
 * Take a base64 screenshot of an element
 */
export async function takeBase64ElementScreenshot({
    browserInstance,
    element,
    devicePixelRatio,
    isIOS,
    resizeDimensions,
}: TakeBase64ElementScreenshotOptions): Promise<string> {
    const shouldTakeResizedScreenshot = (
        resizeDimensions.top !== DEFAULT_RESIZE_DIMENSIONS.top ||
        resizeDimensions.right !== DEFAULT_RESIZE_DIMENSIONS.right ||
        resizeDimensions.bottom !== DEFAULT_RESIZE_DIMENSIONS.bottom ||
        resizeDimensions.left !== DEFAULT_RESIZE_DIMENSIONS.left
    )

    if (!shouldTakeResizedScreenshot) {
        try {
            const awaitedElement = await element
            if (!isWdioElement(awaitedElement)) {
                log.error(' takeBase64ElementScreenshot element is not a valid element because of ', JSON.stringify(awaitedElement))
            }
            return await awaitedElement.takeElementScreenshot(awaitedElement.elementId as string)
        } catch (error) {
            log.error('Error taking an element screenshot with the default `element.takeElementScreenshot(elementId)` method:', error, ' We will retry with a resized screenshot')
        }
    }

    return await takeResizedBase64Screenshot({
        browserInstance,
        element,
        devicePixelRatio,
        isIOS,
        resizeDimensions,
    })
}

