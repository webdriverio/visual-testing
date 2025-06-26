import { takeBase64BiDiScreenshot, takeBase64Screenshot } from '../methods/screenshots.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { determineScreenRectangles } from '../methods/rectangles.js'
import type { BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { RectanglesOutput, ScreenRectanglesOptions } from '../methods/rectangles.interfaces.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import { canUseBidiScreenshot, getMethodOrWicOption } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveWebScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext = false,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    // 1a. Set some variables
    const { addIOSBezelCorners, formatImageName, savePerInstance } = saveScreenOptions.wic

    // 1b. Set the method options to the right values
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveScreenOptions.method, saveScreenOptions.wic, 'enableLegacyScreenshotMethod')

    // 2.  Prepare the beforeScreenshot
    const beforeOptions = createBeforeScreenshotOptions(instanceData, saveScreenOptions.method, saveScreenOptions.wic)
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions)
    const {
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                innerWidth,
                isEmulated,
                isLandscape,
            },
        },
        initialDevicePixelRatio,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
    } = enrichedInstanceData

    // 3.  Take the screenshot
    let base64Image: string

    if (canUseBidiScreenshot(browserInstance) && !isMobile && !enableLegacyScreenshotMethod) {
        // 3a. Take the screenshot with the BiDi method
        base64Image = await takeBase64BiDiScreenshot({ browserInstance })
    } else {
        // 3b. Take the screenshot with the regular method
        base64Image = await takeBase64Screenshot(browserInstance)

        // Determine the rectangles
        const screenRectangleOptions: ScreenRectanglesOptions = {
            devicePixelRatio: devicePixelRatio || NaN,
            enableLegacyScreenshotMethod,
            innerHeight: innerHeight || NaN,
            innerWidth: innerWidth || NaN,
            isAndroidChromeDriverScreenshot,
            isAndroidNativeWebScreenshot,
            isEmulated: isEmulated || false,
            initialDevicePixelRatio: initialDevicePixelRatio || NaN,
            isIOS,
            isLandscape,
        }
        const rectangles: RectanglesOutput = determineScreenRectangles(base64Image, screenRectangleOptions)
        // 4.  Make a cropped base64 image
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners,
            base64Image,
            deviceName,
            devicePixelRatio: devicePixelRatio || NaN,
            isIOS,
            isLandscape,
            rectangles,
        })
    }

    // 5.  The after the screenshot methods
    const afterOptions = buildAfterScreenshotOptions({
        base64Image,
        folders,
        tag,
        isNativeContext,
        instanceData,
        enrichedInstanceData,
        beforeOptions,
        wicOptions: { formatImageName, savePerInstance }
    })

    // 6.  Return the data
    return afterScreenshot(browserInstance, afterOptions)
}
